'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, CalendarIcon, UsersIcon, DollarSignIcon, MailIcon } from 'lucide-react'
import Link from 'next/link'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId') || 'mock-booking-id'

  return (
    <div className="min-h-screen bg-gradient-to-br from-oceanBlue-50 to-surfTeal-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl text-green-600" data-testid="booking-confirmed-title">Booking Confirmed!</CardTitle>
            <p className="text-gray-600 mt-2">
              Your surf adventure has been successfully booked. Get ready for an amazing experience!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Booking Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-oceanBlue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium">{bookingId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-oceanBlue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-medium">Your group</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSignIcon className="w-5 h-5 text-oceanBlue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">$1,200 MXN</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MailIcon className="w-5 h-5 text-oceanBlue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Confirmation</p>
                    <p className="font-medium">Email sent</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Check Your Email</p>
                    <p className="text-sm text-blue-700">You'll receive a detailed confirmation with all booking information</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Prepare for Your Trip</p>
                    <p className="text-sm text-green-700">We'll send preparation materials 5 days before your arrival</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Arrive and Surf!</p>
                    <p className="text-sm text-purple-700">Meet your instructors and start your surfing adventure</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button asChild className="flex-1" data-testid="view-bookings-button">
                <Link href="/client/bookings">
                  View My Bookings
                </Link>
              </Button>

              <Button variant="outline" asChild className="flex-1" data-testid="book-another-button">
                <Link href="/weeks">
                  Book Another Week
                </Link>
              </Button>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-4 border-t"
            >
              <p className="text-sm text-gray-600">
                Questions? Contact us at{' '}
                <a
                  href="mailto:support@heiwa.house"
                  className="text-oceanBlue-600 hover:underline"
                >
                  support@heiwa.house
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
