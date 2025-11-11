'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { getNavigationItems } from '@/lib/content'
import type { NavigationItem } from '@/lib/types'

// Fallback navigation items - use immediately to prevent flash
const fallbackNavigationItems: NavigationItem[] = [
  { path: '/', name: 'HOME' },
  { path: '/the-spot', name: 'THE SPOT' },
  { path: '/rooms', name: 'ROOM RENTALS' },
  { path: '/surf-weeks', name: 'SURF CAMP' },
  { path: '/play', name: 'PLAY' },
  { path: '/flow', name: 'FLOW' }
]

export function Footer() {
  const pathname = usePathname()
  // Initialize with fallback items immediately to prevent flash
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(fallbackNavigationItems)

  // Hide footer for admin routes
  if (pathname.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    getNavigationItems().then(items => {
      // Only update if we got items from CMS, otherwise keep fallback
      if (items && items.length > 0) {
        setNavigationItems(items)
      }
    }).catch(() => {
      // Keep fallback items on error
      setNavigationItems(fallbackNavigationItems)
    })
  }, [])

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Map Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Find us here
            </h3>
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3076.5367824744444!2d-9.1657!3d39.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDExJzA3LjEiTiA5wrAwOSw1Ni41Ilc!5e0!3m2!1sen!2spt!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Heiwa House Location - Santa Cruz, Portugal"
                className="w-full h-full"
              />
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Santa Cruz, Portugal
            </p>
          </div>

          {/* General Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">General</h3>
            <ul className="space-y-3">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded inline-block"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.instagram.com/heiwahouse_portugal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div>

          {/* About Us / Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">About Us</h3>
            <div className="space-y-4">
              <div>
                <a
                  href="mailto:info@heiwahouse.com"
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@heiwahouse.com</span>
                </a>
              </div>
              <div>
                <a
                  href="tel:+351912193785"
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-accent transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                >
                  <Phone className="w-4 h-4" />
                  <span>+351 912 193 785</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Heiwa House. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-accent text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-accent text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
