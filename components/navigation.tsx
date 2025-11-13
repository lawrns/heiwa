'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Bed, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavigationProps, NavigationItem } from '@/lib/types'
import { getNavigationItems } from '@/lib/content'
import { useBooking } from '@/lib/booking-context'
import { MobileNavOverlay } from '@/components/ui/mobile-nav-overlay'

export function Navigation({ items: initialItems, currentPath, className }: NavigationProps & { items?: NavigationItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [fetchedItems, setFetchedItems] = useState<NavigationItem[]>([])
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const { openBooking } = useBooking()

  useEffect(() => {
    if (!initialItems) {
      getNavigationItems().then(items => {
        setFetchedItems(items)
      }).catch(() => {
        setFetchedItems([])
      })
    }
  }, [initialItems])

  // Filter out activity items that should be in dropdown (but keep SURF visible)
  const items = useMemo(() => {
    const allItems = initialItems || fetchedItems
    return allItems.filter(item => 
      !['/play', '/flow'].includes(item.path)
    )
  }, [initialItems, fetchedItems])
  
  // Add SURF as direct link for all pages
  const itemsWithSurf = useMemo(() => {
    const hasSurf = items.some(item => item.path === '/surf')
    if (!hasSurf) {
      return [...items, { path: '/surf', name: 'SURF' }]
    }
    return items
  }, [items])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => {
    setIsOpen(false)
    setActivitiesOpen(false)
  }

  // Split navigation items for the new layout
  const leftNavItems = [
    { path: '/', name: 'HOME' },
    { path: '/rooms', name: 'ROOM RENTALS' },
    { path: '/surf-weeks', name: 'SURF WEEK' }
  ]

  const rightNavItems: NavigationItem[] = []

  const activitiesItems = [
    { path: '/play', name: 'PLAY' },
    { path: '/surf', name: 'SURF' },
    { path: '/flow', name: 'FLOW' }
  ]

  // Check if we're on the homepage to apply special layout
  const isHomepage = currentPath === '/'

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 lg:z-50',
        isHomepage 
          ? 'bg-black/20 backdrop-blur-md' 
          : 'bg-gray-800 backdrop-blur-sm',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isHomepage ? (
          // Homepage Layout: Centered logo with left/right positioning
          <div className="relative flex items-center justify-between h-20">
            {/* Left Side - Navigation Menu */}
            <div className="hidden lg:flex items-center flex-1">
              <nav aria-label="Main navigation">
                <ul className="flex items-center space-x-6">
                  {leftNavItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          'text-xs font-medium tracking-wide transition-colors hover:text-orange-400 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-2 py-1',
                          currentPath === item.path
                            ? 'text-orange-400'
                            : 'text-white'
                        )}
                        aria-current={currentPath === item.path ? 'page' : undefined}
                        aria-label={`Navigate to ${item.name} page`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link
                href="/"
                onClick={closeMenu}
              >
                <Image
                  src="/images/heiwalogo.webp"
                  alt="Heiwa House"
                  width={112}
                  height={37}
                  className="h-9 w-auto"
                  style={{ height: 'auto' }}
                />
              </Link>
            </div>

            {/* Right Side - Activities Dropdown, Location, Phone & Book Button */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-end">
              {/* Activities Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActivitiesOpen(true)}
                onMouseLeave={() => setActivitiesOpen(false)}
              >
                <button
                  className={cn(
                    'text-xs font-medium tracking-wide transition-colors hover:text-orange-400 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-2 py-1 flex items-center gap-1',
                    (currentPath?.includes('/flow') || currentPath?.includes('/play'))
                      ? 'text-orange-400'
                      : 'text-white'
                  )}
                  aria-label="Open activities menu"
                  aria-expanded={activitiesOpen}
                  aria-haspopup="true"
                >
                  ACTIVITIES
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activitiesOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1">
                      {activitiesItems.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={cn(
                            'block px-4 py-2 text-xs font-medium tracking-wide transition-colors hover:bg-gray-800 hover:text-orange-400 uppercase',
                            currentPath === item.path
                              ? 'text-orange-400'
                              : 'text-white'
                          )}
                          aria-label={`Navigate to ${item.name} page`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              {rightNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'text-xs font-medium tracking-wide transition-colors hover:text-orange-400 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-2 py-1',
                    currentPath === item.path
                      ? 'text-orange-400'
                      : 'text-white'
                  )}
                  aria-current={currentPath === item.path ? 'page' : undefined}
                  aria-label={`Navigate to ${item.name} page`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Phone Number */}
              <div className="flex items-center text-xs text-white">
                <span className="tracking-wide">+351 912 193 785</span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={openBooking}
                className="px-4 py-2 text-xs font-medium tracking-wide transition-colors flex items-center gap-1 uppercase rounded text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{ backgroundColor: '#ec681c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65d16'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec681c'}
              >
                <Bed className="w-3 h-3" />
                BOOK
              </button>
            </div>

            {/* Mobile menu button - positioned on the right */}
            <div className="lg:hidden ml-auto">
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
        ) : (
          // Other Pages Layout: Original layout with logo on left
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
                  width={96}
                  height={32}
                  className="h-8 w-auto"
                  style={{ height: 'auto' }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <nav aria-label="Main navigation">
                <ul className="flex items-center space-x-8">
                  {itemsWithSurf.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          'text-sm font-medium tracking-wide transition-colors hover:text-orange-400 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-2 py-1',
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
                  
                  {/* Activities Dropdown */}
                  <li>
                    <div 
                      className="relative"
                      onMouseEnter={() => setActivitiesOpen(true)}
                      onMouseLeave={() => setActivitiesOpen(false)}
                    >
                      <button
                        className={cn(
                          'text-sm font-medium tracking-wide transition-colors hover:text-orange-400 uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded px-2 py-1 flex items-center gap-1',
                          (currentPath?.includes('/flow') || currentPath?.includes('/play') || currentPath?.includes('/surf'))
                            ? 'text-orange-400'
                            : 'text-white'
                        )}
                        aria-label="Open activities menu"
                        aria-expanded={activitiesOpen}
                        aria-haspopup="true"
                      >
                        ACTIVITIES
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {activitiesOpen && (
                        <div className="absolute top-full left-0 pt-2 z-50">
                          <div className="w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1">
                            {activitiesItems.map((item) => (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                  'block px-4 py-2 text-sm font-medium tracking-wide transition-colors hover:bg-gray-800 hover:text-orange-400 uppercase',
                                  currentPath === item.path
                                    ? 'text-orange-400'
                                    : 'text-white'
                                )}
                                aria-label={`Navigate to ${item.name} page`}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                </ul>
              </nav>

              {/* Phone Number */}
              <div className="flex items-center text-sm text-white">
                <span className="tracking-wide">Call. +351 912 193 785</span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={openBooking}
                className="px-6 py-3 text-sm font-medium tracking-wide transition-colors flex items-center gap-2 uppercase text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{ backgroundColor: '#ec681c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65d16'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec681c'}
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
        )}
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavOverlay 
        isOpen={isOpen} 
        onClose={closeMenu} 
        items={[
          { path: '/', name: 'HOME' },
          { path: '/rooms', name: 'ROOM RENTALS' },
          { path: '/surf-weeks', name: 'SURF WEEK' },
          { path: '/surf', name: 'SURF' },
          { path: '/play', name: 'PLAY' },
          { path: '/flow', name: 'FLOW' }
        ]}
        currentPath={currentPath || '/'}
      />
    </nav>
  )
}
