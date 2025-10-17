'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { getNavigationItems } from '@/lib/content'
import type { NavigationItem } from '@/lib/types'

export function Footer() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])

  useEffect(() => {
    getNavigationItems().then(items => {
      setNavigationItems(items)
    }).catch(() => {
      // Fallback to static items
      setNavigationItems([
        { path: '/', name: 'Home' },
        { path: '/the-spot', name: 'The Spot' },
        { path: '/rooms', name: 'Room Rentals' },
        { path: '/surf-weeks', name: 'Surf Weeks' }
      ])
    })
  }, [])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {/* Map Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Find us here</h3>
            <div className="w-full h-72 bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3076.5367824744444!2d-9.1657!3d39.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDExJzA3LjEiTiA5wrAwOSw1Ni41Ilc!5e0!3m2!1sen!2spt!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Heiwa House Location - Santa Cruz, Portugal"
              />
            </div>
          </div>

          {/* General Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">General</h3>
            <ul className="space-y-3">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
            <a
              href="https://www.instagram.com/heiwahouse_portugal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 rounded"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram</span>
            </a>
          </div>

          {/* About Us / Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">About Us</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                <a
                  href="mailto:info@heiwahouse.com"
                  className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 rounded"
                >
                  E. info@heiwahouse.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+351912193785"
                  className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900 rounded"
                >
                  T. + 351 912 193 785
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}