'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavigationProps } from '@/lib/types'

export function Navigation({ items, currentPath, className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <nav
      className={cn('bg-white shadow-sm', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-3xl font-heading font-normal text-primary hover:text-accent-hover transition-colors tracking-wide"
              onClick={closeMenu}
            >
              HEIWA HOUSE
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
                        'text-sm font-medium tracking-wide transition-colors hover:text-primary',
                        currentPath === item.path
                          ? 'text-primary'
                          : 'text-text'
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
            <div className="flex items-center text-sm text-text">
              <span>+351 912 193 785</span>
            </div>

            {/* Book Now Button */}
            <Link
              href="/rooms"
              className="bg-primary hover:bg-accent-hover text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors"
            >
              BOOK NOW
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-text hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
            <ul className="px-4 pt-4 pb-6 space-y-2 bg-white border-t border-gray-200">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium tracking-wide transition-colors',
                      currentPath === item.path
                        ? 'text-primary'
                        : 'text-text hover:text-primary'
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
              <li className="pt-4 border-t border-gray-200">
                <div className="text-sm text-text mb-3">+351 912 193 785</div>
                <Link
                  href="/rooms"
                  className="inline-block bg-primary hover:bg-accent-hover text-white px-6 py-3 text-sm font-medium tracking-wide transition-colors"
                  onClick={closeMenu}
                >
                  BOOK NOW
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </nav>
  )
}
