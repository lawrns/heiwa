'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Bed, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useBooking } from '@/lib/booking-context'

interface MobileNavOverlayProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{ name: string; path: string }>
  currentPath: string
}

export function MobileNavOverlay({ isOpen, onClose, items, currentPath }: MobileNavOverlayProps) {
  const { openBooking } = useBooking()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  const menuVariants = {
    hidden: { x: 300 },
    visible: {
      x: 0,
    },
    exit: {
      x: 300,
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  if (!mounted || typeof document === 'undefined') return null

  const overlayContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - MUST be above nav z-50 */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9999,
              pointerEvents: 'auto'
            }}
            className="lg:hidden"
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              width: '20rem',
              height: '100vh',
              backgroundColor: '#111827',
              zIndex: 10000,
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)'
            }}
            className="lg:hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
            id="mobile-menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {items.map((item, i) => {
                const isActivities = item.name === 'ACTIVITIES'
                const isExpanded = expandedItems.includes('activities')
                
                return (
                  <motion.div
                    key={item.path}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {isActivities ? (
                      <div>
                        <button
                          onClick={() => setExpandedItems(isExpanded ? [] : ['activities'])}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-medium uppercase text-base tracking-wide ${
                            currentPath?.includes('/flow') || currentPath?.includes('/play') || currentPath?.includes('/surf')
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {item.name}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="mt-2 ml-4 space-y-2 border-l border-gray-700 pl-4">
                            {[
                              { name: 'PLAY', path: '/play' },
                              { name: 'SURF', path: '/surf' },
                              { name: 'FLOW', path: '/flow' }
                            ].map((subitem) => (
                              <Link
                                key={subitem.path}
                                href={subitem.path}
                                onClick={onClose}
                                className={`block px-4 py-2 rounded-lg transition-all duration-200 font-medium uppercase text-sm tracking-wide ${
                                  currentPath === subitem.path
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                              >
                                {subitem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={onClose}
                        className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium uppercase text-base tracking-wide ${
                          currentPath === item.path
                            ? 'bg-orange-500 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                )
              })}
            </nav>

            {/* Footer CTA */}
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gray-900">
              <button
                className="w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors uppercase text-base flex items-center justify-center gap-2"
                style={{ backgroundColor: '#ec681c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65d16'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec681c'}
                onClick={() => {
                  openBooking()
                  onClose()
                }}
              >
                <Bed className="w-5 h-5" />
                BOOK NOW
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Portal MUST render to body, not inside nav
  return createPortal(overlayContent, document.body)
}
