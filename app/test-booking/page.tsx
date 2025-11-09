'use client'

import { BookingWidget } from '@/components/BookingWidget/BookingWidget'
import { useBooking } from '@/lib/booking-context'

export default function TestBookingPage() {
  const { openBooking, isBookingOpen } = useBooking()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">🏄‍♂️ Heiwa House Booking Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Test the Complete Booking Flow</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">📋 Testing Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click the "Open Booking Widget" button below</li>
                <li>Select experience type (Surf Week or Room Booking)</li>
                <li>Choose available dates from the calendar</li>
                <li>Select your preferred room or surf week package</li>
                <li>Add any optional add-ons (yoga, airport transfer, etc.)</li>
                <li>Fill in guest details (name, email, phone)</li>
                <li>Review your booking summary and total price</li>
                <li>Choose payment method (Credit Card or Bank Transfer)</li>
                <li>Submit the booking</li>
                <li>Verify booking confirmation and check admin panel</li>
              </ol>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => openBooking()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
              >
                🏄‍♂️ Open Booking Widget
              </button>
              
              <p className="mt-4 text-gray-600">
                Click to start the complete booking process
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🔍 Current Status:</h4>
              <ul className="text-sm space-y-1">
                <li>• Booking Widget State: {isBookingOpen ? 'OPEN' : 'CLOSED'}</li>
                <li>• API Endpoint: /api/bookings</li>
                <li>• Database: PostgreSQL (Supabase)</li>
                <li>• Payment: Test Mode</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">✅ What to Test:</h4>
              <ul className="text-sm space-y-1">
                <li>• Date selection and availability</li>
                <li>• Room/surf week selection</li>
                <li>• Add-on options and pricing</li>
                <li>• Guest form validation</li>
                <li>• Payment method selection</li>
                <li>• Booking submission and confirmation</li>
                <li>• Error handling for invalid inputs</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Booking Widget will appear as modal when triggered */}
        <BookingWidget />
        
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">🔗 Quick Links:</h3>
          <div className="space-y-2">
            <a href="/admin" className="block text-blue-600 hover:underline">
              → Admin Panel (to check bookings after submission)
            </a>
            <a href="/rooms" className="block text-blue-600 hover:underline">
              → View Rooms
            </a>
            <a href="/" className="block text-blue-600 hover:underline">
              → Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
