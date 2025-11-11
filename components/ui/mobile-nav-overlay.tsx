'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Bed, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
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

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - solid dark background */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Menu Panel - centered overlay */}
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-4 top-20 bottom-20 bg-gray-900 rounded-lg shadow-2xl z-50 lg:hidden overflow-hidden flex flex-col"
            style={{ maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 10rem)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation Items - scrollable */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
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
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-medium uppercase text-sm tracking-wide ${
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
                                className={`block px-4 py-2 rounded-lg transition-all duration-200 font-medium uppercase text-xs tracking-wide ${
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
                        className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium uppercase text-sm tracking-wide ${
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

            {/* Footer CTA - fixed at bottom */}
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <button
                className="w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors uppercase text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: '#ec681c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65d16'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ec681c'}
                onClick={() => {
                  openBooking()
                  onClose()
                }}
              >
                <Bed className="w-4 h-4" />
                BOOK NOW
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
