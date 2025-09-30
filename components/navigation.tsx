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
  const [scrolled, setScrolled] = useState(false)
  const { openBooking } = useBooking()

  useEffect(() => {
    if (!initialItems) {
      getNavigationItems().then(fetchedItems => {
        setItems(fetchedItems)
      }).catch(() => {
        setItems([])
      })
    }
  }, [initialItems])

  // Check if we're on the homepage
  const isHomepage = currentPath === '/'

  // Track scroll position for minimized nav on inner pages
  useEffect(() => {
    if (isHomepage) return // Don't track scroll on homepage

    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled, isHomepage])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Dynamic styles based on page and scroll state
  const navClasses = cn(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
    isHomepage 
      ? 'bg-black/20 backdrop-blur-sm' 
      : scrolled
        ? 'bg-white shadow-lg py-2'
        : 'bg-white shadow-sm py-4',
    className
  )

  const heightClass = cn(
    'transition-all duration-300 ease-in-out',
    isHomepage 
      ? 'h-20' 
      : scrolled 
        ? 'h-16' 
        : 'h-20'
  )

  const logoSize = scrolled && !isHomepage ? { width: 100, height: 33 } : { width: 140, height: 46 }
  const textColorClass = isHomepage ? 'text-white' : 'text-gray-900'
  const hoverColorClass = isHomepage ? 'hover:text-accent' : 'hover:text-accent'

  return (
    <nav className={navClasses} role="navigation" aria-label="Main navigation">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {isHomepage ? (
          // Homepage Layout: Centered logo with left/right positioning
          <div className={cn('relative flex items-center justify-between', heightClass)}>
            {/* Left Side - Navigation Menu */}
            <div className="hidden lg:flex items-center">
              <nav aria-label="Main navigation">
                <ul className="flex items-center space-x-8">
                  {items.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={cn(
                          'text-sm font-medium tracking-wide transition-colors uppercase border-b-2 pb-1',
                          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-sm',
                          currentPath === item.path
                            ? 'text-accent border-accent font-bold'
                            : 'border-transparent ' + textColorClass,
                          hoverColorClass
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
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" onClick={closeMenu}>
                <Image
                  src="/images/heiwalogo.webp"
                  alt="Heiwa House"
                  width={logoSize.width}
                  height={logoSize.height}
                  className="h-12 w-auto transition-all duration-300"
                  style={{ height: 'auto' }}
                />
              </Link>
            </div>

            {/* Right Side - Phone & Book Now Button */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="tel:+351912193785" className={cn('flex items-center text-sm transition-colors', textColorClass, hoverColorClass)}>
                <span>+351 912 193 785</span>
              </a>

              <button
                onClick={openBooking}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors flex items-center gap-2 uppercase rounded min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                <Bed className="w-4 h-4" />
                BOOK NOW
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-auto">
              <button
                onClick={toggleMenu}
                className={cn(
                  'inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent',
                  textColorClass,
                  hoverColorClass
                )}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        ) : (
          // Inner Pages Layout: Standard horizontal layout with animated minimization
          <div className={cn('flex justify-between items-center', heightClass)}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" onClick={closeMenu}>
                <Image
                  src="/images/heiwalogo.webp"
                  alt="Heiwa House"
                  width={logoSize.width}
                  height={logoSize.height}
                  className="transition-all duration-300"
                  style={{ height: 'auto', width: scrolled ? '100px' : '120px' }}
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
                          'text-sm font-medium tracking-wide transition-colors uppercase border-b-2 pb-1',
                          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-sm',
                          currentPath === item.path
                            ? 'text-accent border-accent font-bold'
                            : 'border-transparent ' + textColorClass,
                          hoverColorClass
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

              <a href="tel:+351912193785" className={cn('flex items-center text-sm transition-colors', textColorClass, hoverColorClass)}>
                <span>+351 912 193 785</span>
              </a>

              <button
                onClick={openBooking}
                className={cn(
                  'bg-accent hover:bg-accent-hover text-white font-medium tracking-wide transition-colors flex items-center gap-2 uppercase rounded min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  scrolled ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'
                )}
              >
                <Bed className={scrolled ? 'w-3 h-3' : 'w-4 h-4'} />
                BOOK NOW
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className={cn(
                  'inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent',
                  textColorClass,
                  hoverColorClass
                )}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <nav aria-label="Mobile navigation">
            <ul className="px-4 pt-4 pb-6 space-y-2 bg-black/90 backdrop-blur-sm border-t border-gray-700">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium tracking-wide transition-colors uppercase rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black',
                      currentPath === item.path
                        ? 'text-accent bg-accent/10 font-bold'
                        : 'text-white hover:text-accent hover:bg-white/5'
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
              <li className="pt-4 border-t border-gray-700">
                <a href="tel:+351912193785" className="block text-sm text-white mb-3">📞 +351 912 193 785</a>
                <button
                  onClick={() => {
                    openBooking()
                    closeMenu()
                  }}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors uppercase min-h-[44px] rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
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