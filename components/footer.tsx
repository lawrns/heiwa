'use client'

import { useState, useEffect } from 'react'
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
        { path: '/', name: 'HOME' },
        { path: '/the-spot', name: 'THE SPOT' },
        { path: '/rooms', name: 'ROOM RENTALS' },
        { path: '/surf-weeks', name: 'SURF CAMP' }
      ])
    })
  }, [])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-heading font-normal text-primary mb-6">
              HEIWA HOUSE
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Nestled on Portugal's coast, Heiwa House is your sanctuary for rest and adventure.
              Experience world-class surfing, yoga, and coastal living.
            </p>
            <p className="text-gray-400 text-xs">
              © 2024 Heiwa House. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wide">General</h4>
            <ul className="space-y-3">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className="text-gray-300 text-sm hover:text-primary transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4 uppercase tracking-wide">About Us</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <a
                href="mailto:info@heiwahouse.com"
                className="block hover:text-primary transition-colors"
              >
                E. info@heiwahouse.com
              </a>
              <a
                href="tel:+351912193785"
                className="block hover:text-primary transition-colors"
              >
                T. + 351 912 193 785
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}