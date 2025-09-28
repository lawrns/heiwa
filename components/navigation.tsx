'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Bed } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavigationProps, NavigationItem } from '@/lib/types'
import { getNavigationItems } from '@/lib/content'
import { useBooking } from '@/lib/booking-context'

export function Navigation({ items: initialItems, currentPath, className }: NavigationProps & { items?: NavigationItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<NavigationItem[]>(initialItems || [])
  const [loading, setLoading] = useState(!initialItems)
  const { openBooking } = useBooking()

  useEffect(() => {
    if (!initialItems) {
      getNavigationItems().then(fetchedItems => {
        setItems(fetchedItems)
        setLoading(false)
      }).catch(() => {
        // Fallback to static items if fetch fails
        setItems([])
        setLoading(false)
      })
    }
  }, [initialItems])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <nav
      className={cn('fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              onClick={closeMenu}
            >
              <Image
                src="/images/heiwalogo.webp"
                alt="Heiwa House"
                width={120}
                height={40}
                className="h-10 w-auto"
                style={{ height: 'auto' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <nav aria-label="Main navigation">
              <ul className="flex items-center space-x-8">
                {items.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        'text-sm font-medium tracking-wide transition-colors hover:text-orange-400 uppercase',
                        currentPath === item.path
                          ? 'text-orange-400'
                          : 'text-white'
                      )}
                      aria-current={currentPath === item.path ? 'page' : undefined}
                      {...(item.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        'aria-label': `${item.name} (opens in new tab)`
                      })}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Phone Number */}
            <div className="flex items-center text-sm text-white">
              <span>📞 +351 912 193 785</span>
            </div>

            {/* Book Now Button */}
            <button
              onClick={openBooking}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors flex items-center gap-2 uppercase"
            >
              <Bed className="w-4 h-4" />
              BOOK NOW
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <nav aria-label="Mobile navigation">
            <ul className="px-4 pt-4 pb-6 space-y-2 bg-black/90 backdrop-blur-sm border-t border-gray-600">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium tracking-wide transition-colors uppercase',
                      currentPath === item.path
                        ? 'text-orange-400'
                        : 'text-white hover:text-orange-400'
                    )}
                    onClick={closeMenu}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                    {...(item.external && {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      'aria-label': `${item.name} (opens in new tab)`
                    })}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-600">
                <div className="text-sm text-white mb-3">📞 +351 912 193 785</div>
                <button
                  onClick={() => {
                    openBooking()
                    closeMenu()
                  }}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors uppercase"
                >
                  <Bed className="w-4 h-4" />
                  BOOK NOW
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </nav>
  )
}
