import { Metadata } from 'next'
import { CardGrid } from '@/components/card-grid'
import { roomsPageContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Room Rentals',
  description: 'Book your stay at Heiwa House. Choose from our beautifully appointed rooms and dorm accommodations with ocean views.',
}

export default function RoomsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
          <div className="absolute inset-0 bg-surface/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-text mb-4">
            Room Rentals
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto">
            Choose from our beautifully appointed rooms and dorm accommodations with stunning ocean views
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-section-y bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-4">
              Our Accommodations
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Each room is designed for comfort and connection with the natural surroundings
            </p>
          </div>

          <CardGrid
            items={roomsPageContent.rooms.map(room => ({
              title: room.name,
              image: room.image,
              description: room.description
            }))}
            columns={3}
          />

          <div className="text-center mt-12">
            <p className="text-muted text-lg mb-6">
              Ready to book your stay? Check availability and reserve your room below.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Widget Section */}
      <section className="py-section-y bg-surface-alt">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-text mb-4">
              Book Your Stay
            </h2>
            <p className="text-lg text-muted">
              Use our integrated booking system to check availability and reserve your accommodation
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted">
              Click the "Check Availability" button below to book your room
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted text-sm">
              Need help with your booking? Contact us at{' '}
              <a
                href="mailto:info@heiwahouse.com"
                className="text-primary hover:underline"
              >
                info@heiwahouse.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-section-y bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-heading font-semibold text-text mb-4">
                What&apos;s Included
              </h3>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Daily housekeeping service</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>High-speed WiFi throughout the property</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Access to all common areas and amenities</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>24/7 security and support</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-heading font-semibold text-text mb-4">
                Booking Policies
              </h3>
              <ul className="space-y-3 text-muted">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Free cancellation up to 48 hours before check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Check-in after 3:00 PM, check-out by 11:00 AM</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Payment required at time of booking</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Minimum 2-night stay required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}