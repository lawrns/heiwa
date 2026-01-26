'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as PerformanceEntry & { value: number }
            console.log('CLS:', clsEntry.value)
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}
