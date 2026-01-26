'use client'

import Image from 'next/image'

interface HostSectionProps {
  className?: string
}

export function HostSection({ className = '' }: HostSectionProps) {
  return (
    <div className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center italic">
          Your Hosts
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Polaroid-style Image */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="relative">
              {/* Polaroid frame effect */}
              <div className="bg-white p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-100 p-2">
                  <Image
                    src="/images/DSC03534.jpg"
                    alt="Heiwa House Hosts"
                    width={300}
                    height={400}
                    className="object-cover rounded"
                  />
                </div>
                {/* Polaroid bottom white space */}
                <div className="h-8 bg-white"></div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Surf the waves, flow through yoga, and find your rhythm in the heartbeat of Heiwa House. 
                We believe in the power of connection, the joy of play, and the magic of living in the moment.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                You can book a room and enjoy our amazing facilities, or join one of our all-inclusive surf weeks 
                for the ultimate experience. Our space is designed to bring people together, create lasting memories, 
                and help you discover your best self.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                To join a group of like-minded people who share your passion for surfing, adventure, and authentic 
                experiences, check out our surf weeks. We create an environment where friendships are born and 
                adventures begin.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                We also offer the option to rent the space for your own events, retreats, or special occasions. 
                Whether it&apos;s a yoga retreat, team building, or a private celebration, Heiwa House provides the 
                perfect backdrop for your gathering.
              </p>
            </div>

            {/* Signature */}
            <div className="pt-6">
              <p className="text-2xl font-handwriting text-gray-800 italic">
                Janis, Buka & Edijs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
