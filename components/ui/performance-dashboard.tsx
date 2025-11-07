'use client'

import { useState, useEffect } from 'react'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    const measurePerformance = () => {
      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Measure FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
        })
      }).observe({ entryTypes: ['first-input'] })

      // Measure CLS
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          }
        })
      }).observe({ entryTypes: ['layout-shift'] })

      // Measure TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics(prev => ({ ...prev, ttfb: navigation.responseStart - navigation.requestStart }))
      }
    }

    measurePerformance()
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full text-xs z-40 transition-colors"
        title="Toggle Performance Dashboard"
      >
        📊
      </button>

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <span>Performance Metrics</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1">
          <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
          <div>FID: {metrics.fid.toFixed(0)}ms</div>
          <div>CLS: {metrics.cls.toFixed(3)}</div>
          <div>TTFB: {metrics.ttfb.toFixed(0)}ms</div>
        </div>
        </div>
      )}
    </>
  )
}
