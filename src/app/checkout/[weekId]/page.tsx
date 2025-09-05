'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import BookingWizard from '@/components/booking/BookingWizard'

interface BookingData {
  weekId: string
  participants: any[]
  roomSelections: any[]
  addOns: any[]
  totalAmount: number
  currency: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)

  const handleBookingComplete = async (data: BookingData) => {
    setBookingData(data)

    try {
      // Create Stripe checkout session (mocked)
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: `booking_${Date.now()}`,
          amount: data.totalAmount,
          currency: data.currency
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to payment page
        router.push(`/checkout/${params.weekId}/payment`)
      } else {
        console.error('Failed to create checkout session')
        // Fallback to success for now
        router.push(`/booking/success?bookingId=mock-${Date.now()}`)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      // Fallback to success for now
      router.push(`/booking/success?bookingId=mock-${Date.now()}`)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Your booking has been successfully created.</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Week:</strong> {params.weekId}</p>
              <p><strong>Participants:</strong> {bookingData.participants.length}</p>
              <p><strong>Total:</strong> ${bookingData.totalAmount} {bookingData.currency}</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/client/bookings">View My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to week details
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="checkout-title">Complete Your Booking</h1>
            <p className="text-gray-600">
              Follow the steps below to secure your spot in this amazing surf week
            </p>
          </div>
        </motion.div>

        {/* Booking Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-8">
              <BookingWizard
                weekId={params.weekId as string}
                onComplete={handleBookingComplete}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <p>
            By completing your booking, you agree to our{' '}
            <Link href="/terms" className="text-oceanBlue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-oceanBlue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="mt-2">
            Need help? Contact us at{' '}
            <a href="mailto:support@heiwa.house" className="text-oceanBlue-600 hover:underline">
              support@heiwa.house
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
