import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Stay | Heiwa House',
  description: 'Book your stay at Heiwa House - Premium accommodation in Portugal',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Your Stay</h1>
          
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Booking System Coming Soon
            </h2>
            <p className="text-gray-600 mb-8">
              We&apos;re working on our online booking system. In the meantime, please contact us directly to make a reservation.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">📞</span>
                <a 
                  href="tel:+351912193785" 
                  className="text-orange-500 hover:text-orange-600 font-medium text-lg"
                >
                  +351 912 193 785
                </a>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">✉️</span>
                <a 
                  href="mailto:info@heiwahouse.com" 
                  className="text-orange-500 hover:text-orange-600 font-medium text-lg"
                >
                  info@heiwahouse.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
