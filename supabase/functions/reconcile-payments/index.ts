import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Stripe } from "https://esm.sh/stripe@13.0.0"

interface ReconcilePaymentsRequest {
  date_from?: string // ISO date string
  date_to?: string // ISO date string
  limit?: number // Max records to check (default 100)
  auto_correct?: boolean // Whether to auto-correct found issues
}

interface ReconciliationReport {
  summary: {
    total_payments_checked: number
    discrepancies_found: number
    auto_corrected: number
    manual_review_required: number
    execution_time_ms: number
  }
  discrepancies: Array<{
    type: 'missing_payment' | 'amount_mismatch' | 'status_mismatch' | 'orphaned_stripe_payment'
    severity: 'high' | 'medium' | 'low'
    booking_id?: string
    stripe_payment_id?: string
    local_payment_id?: string
    description: string
    suggested_action: string
    auto_corrected?: boolean
  }>
  metadata: {
    date_range: {
      from: string
      to: string
    }
    execution_timestamp: string
    stripe_api_calls: number
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const startTime = Date.now()

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role for admin operations
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const requestData: ReconcilePaymentsRequest = await req.json()

    // Set defaults
    const dateFrom = requestData.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    const dateTo = requestData.date_to || new Date().toISOString()
    const limit = Math.min(requestData.limit || 100, 1000) // Max 1000 records
    const autoCorrect = requestData.auto_correct || false

    console.log(`Starting payment reconciliation: ${dateFrom} to ${dateTo}, limit: ${limit}, auto-correct: ${autoCorrect}`)

    // Get local payments in date range
    const { data: localPayments, error: localPaymentsError } = await supabaseClient
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        currency,
        payment_status,
        stripe_payment_intent_id,
        transaction_id,
        payment_date,
        refunded_amount,
        created_at,
        booking:bookings!inner(
          id,
          customer_id,
          status
        )
      `)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .not('stripe_payment_intent_id', 'is', null)
      .limit(limit)

    if (localPaymentsError) {
      console.error('Error fetching local payments:', localPaymentsError)
      return new Response(
        JSON.stringify({
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch local payment records'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const discrepancies: ReconciliationReport['discrepancies'] = []
    let stripeApiCalls = 0

    // Check each local payment against Stripe
    for (const localPayment of localPayments || []) {
      try {
        const paymentIntentId = localPayment.stripe_payment_intent_id || localPayment.transaction_id

        if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
          // Skip non-Stripe payments or invalid IDs
          continue
        }

        // Fetch payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        stripeApiCalls++

        // Check for amount mismatch
        const stripeAmount = paymentIntent.amount / 100 // Convert from cents
        if (Math.abs(stripeAmount - localPayment.amount) > 0.01) { // Allow 1 cent difference
          discrepancies.push({
            type: 'amount_mismatch',
            severity: 'high',
            booking_id: localPayment.booking_id,
            stripe_payment_id: paymentIntentId,
            local_payment_id: localPayment.id,
            description: `Amount mismatch: Local=${localPayment.amount}, Stripe=${stripeAmount}`,
            suggested_action: 'Update local payment amount to match Stripe',
            auto_corrected: autoCorrect ? await correctAmountMismatch(supabaseClient, localPayment.id, stripeAmount) : false
          })
        }

        // Check for status mismatch
        const stripeStatus = paymentIntent.status === 'succeeded' ? 'completed' :
                           paymentIntent.status === 'canceled' ? 'failed' : 'pending'
        if (stripeStatus !== localPayment.payment_status && localPayment.payment_status !== 'refunded') {
          discrepancies.push({
            type: 'status_mismatch',
            severity: 'medium',
            booking_id: localPayment.booking_id,
            stripe_payment_id: paymentIntentId,
            local_payment_id: localPayment.id,
            description: `Status mismatch: Local=${localPayment.payment_status}, Stripe=${stripeStatus}`,
            suggested_action: 'Update local payment status to match Stripe',
            auto_corrected: autoCorrect ? await correctStatusMismatch(supabaseClient, localPayment.id, stripeStatus) : false
          })
        }

        // Check for refunds
        const stripeRefunds = paymentIntent.charges?.data[0]?.refunds?.data || []
        const stripeRefundedAmount = stripeRefunds
          .filter((refund: any) => refund.status === 'succeeded')
          .reduce((sum: number, refund: any) => sum + refund.amount, 0) / 100

        if (Math.abs(stripeRefundedAmount - (localPayment.refunded_amount || 0)) > 0.01) {
          discrepancies.push({
            type: 'amount_mismatch',
            severity: 'medium',
            booking_id: localPayment.booking_id,
            stripe_payment_id: paymentIntentId,
            local_payment_id: localPayment.id,
            description: `Refund amount mismatch: Local=${localPayment.refunded_amount || 0}, Stripe=${stripeRefundedAmount}`,
            suggested_action: 'Update local refunded amount to match Stripe',
            auto_corrected: autoCorrect ? await correctRefundMismatch(supabaseClient, localPayment.id, stripeRefundedAmount) : false
          })
        }

      } catch (stripeError: any) {
        if (stripeError.code === 'resource_missing') {
          // Payment intent doesn't exist in Stripe
          discrepancies.push({
            type: 'missing_payment',
            severity: 'high',
            booking_id: localPayment.booking_id,
            local_payment_id: localPayment.id,
            description: `Payment intent ${paymentIntentId} not found in Stripe`,
            suggested_action: 'Investigate why payment exists locally but not in Stripe'
          })
        } else {
          console.error(`Error checking payment ${localPayment.id}:`, stripeError)
          // Continue with other payments
        }
      }
    }

    // Check for orphaned Stripe payments (payments in Stripe not in our DB)
    // This is more complex and would require listing recent payments from Stripe
    // For now, we'll note this as a future enhancement

    const executionTime = Date.now() - startTime
    const autoCorrected = discrepancies.filter(d => d.auto_corrected).length
    const manualReviewRequired = discrepancies.filter(d => !d.auto_corrected && d.severity === 'high').length

    const report: ReconciliationReport = {
      summary: {
        total_payments_checked: localPayments?.length || 0,
        discrepancies_found: discrepancies.length,
        auto_corrected: autoCorrected,
        manual_review_required: manualReviewRequired,
        execution_time_ms: executionTime
      },
      discrepancies,
      metadata: {
        date_range: {
          from: dateFrom,
          to: dateTo
        },
        execution_timestamp: new Date().toISOString(),
        stripe_api_calls: stripeApiCalls
      }
    }

    // Log reconciliation results
    console.log(`Reconciliation completed: ${discrepancies.length} discrepancies found, ${autoCorrected} auto-corrected`)

    // Store reconciliation report for audit
    await supabaseClient
      .from('privacy_audit_log')
      .insert({
        user_id: null, // System operation
        action: 'payment_reconciliation',
        resource_type: 'system',
        resource_id: null,
        ip_address: null,
        user_agent: 'reconciliation_system',
        performed_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify(report),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in reconcile-payments:', error)
    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred during payment reconciliation'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions for auto-correction
async function correctAmountMismatch(supabaseClient: any, paymentId: string, stripeAmount: number): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('payments')
      .update({ amount: stripeAmount })
      .eq('id', paymentId)

    return !error
  } catch (error) {
    console.error('Error correcting amount mismatch:', error)
    return false
  }
}

async function correctStatusMismatch(supabaseClient: any, paymentId: string, stripeStatus: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('payments')
      .update({ payment_status: stripeStatus })
      .eq('id', paymentId)

    return !error
  } catch (error) {
    console.error('Error correcting status mismatch:', error)
    return false
  }
}

async function correctRefundMismatch(supabaseClient: any, paymentId: string, stripeRefundedAmount: number): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('payments')
      .update({ refunded_amount: stripeRefundedAmount })
      .eq('id', paymentId)

    return !error
  } catch (error) {
    console.error('Error correcting refund mismatch:', error)
    return false
  }
}
