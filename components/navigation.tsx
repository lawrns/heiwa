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
      className={cn('bg-surface border-b border-muted/20', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-text hover:text-primary transition-colors"
              onClick={closeMenu}
            >
              Heiwa House
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <nav aria-label="Main navigation">
              <ul className="ml-10 flex items-baseline space-x-4">
                {items.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface',
                        currentPath === item.path
                          ? 'bg-primary text-on-primary'
                          : 'text-text hover:text-primary hover:bg-surface-alt'
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-text hover:text-primary hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
        <div className="md:hidden" id="mobile-menu">
          <nav aria-label="Mobile navigation">
            <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface-alt border-t border-muted/20">
              {items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface',
                      currentPath === item.path
                        ? 'bg-primary text-on-primary'
                        : 'text-text hover:text-primary hover:bg-surface'
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
            </ul>
          </nav>
        </div>
      )}
    </nav>
  )
}
