'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  CreditCardIcon,
  LockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  DollarSignIcon,
  ShieldCheckIcon
} from 'lucide-react'
import Link from 'next/link'

interface BookingSummary {
  weekId: string
  participants: number
  roomType: string
  totalAmount: number
  currency: string
  addOns: Array<{ name: string; price: number }>
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })

  // Mock booking summary - in real app this would come from URL params or context
  const [bookingSummary] = useState<BookingSummary>({
    weekId: params.weekId as string,
    participants: 2,
    roomType: 'Ocean View Suite',
    totalAmount: 1200,
    currency: 'MXN',
    addOns: [
      { name: 'Private Surf Lessons', price: 200 },
      { name: 'Daily Yoga Sessions', price: 150 }
    ]
  })

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock successful payment
    router.push('/booking/success?bookingId=mock-payment-success')
  }

  const formatCardNumber = (value: string) => {
    // Remove spaces and limit to 16 digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
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
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to booking details
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="payment-title">Complete Your Payment</h1>
            <p className="text-gray-600">
              Secure payment for your Heiwa House surf week
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card data-testid="payment-form">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCardIcon className="w-5 h-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-oceanBlue-500 bg-oceanBlue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="card-payment-method"
                    >
                      <CreditCardIcon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Credit Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid="paypal-payment-method"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <span className="text-sm font-medium">PayPal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                        data-testid="card-name-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails(prev => ({
                          ...prev,
                          number: formatCardNumber(e.target.value)
                        }))}
                        maxLength={19}
                        data-testid="card-number-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails(prev => ({
                            ...prev,
                            expiry: formatExpiry(e.target.value)
                          }))}
                          maxLength={5}
                          data-testid="card-expiry-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          type="password"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                          maxLength={4}
                          data-testid="card-cvc-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-xl font-bold">P</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                  data-testid="pay-button"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LockIcon className="w-4 h-4" />
                      <span>Pay ${bookingSummary.totalAmount.toLocaleString()} {bookingSummary.currency}</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-8" data-testid="order-summary">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Week Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Week:</span>
                    <span className="font-medium">{params.weekId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">{bookingSummary.participants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{bookingSummary.roomType}</span>
                  </div>
                </div>

                <Separator />

                {/* Add-ons */}
                {bookingSummary.addOns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Add-ons:</h4>
                    {bookingSummary.addOns.map((addon, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{addon.name}</span>
                        <span className="font-medium">${addon.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${bookingSummary.totalAmount.toLocaleString()} {bookingSummary.currency}</span>
                </div>

                {/* Booking Policy */}
                <div className="text-xs text-gray-600 space-y-2 pt-4 border-t">
                  <p className="font-medium">Booking Policy:</p>
                  <ul className="space-y-1">
                    <li>• Free cancellation up to 30 days before arrival</li>
                    <li>• 50% refund 15-29 days before arrival</li>
                    <li>• No refund within 14 days of arrival</li>
                    <li>• All sales are final</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <p>
            By completing this payment, you agree to our{' '}
            <Link href="/terms" className="text-oceanBlue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-oceanBlue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
