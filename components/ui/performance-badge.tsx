'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
}

export function PerformanceBadge() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measurePerformance = () => {
      try {
        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          setMetrics((prev) => ({ ...prev!, lcp: Math.round(lastEntry.startTime) }))
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // Measure FID
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            setMetrics((prev) => ({
              ...prev!,
              fid: Math.round(entry.processingStart - entry.startTime),
            }))
          })
        }).observe({ entryTypes: ['first-input'] })

        // Measure CLS
        let clsValue = 0
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              setMetrics((prev) => ({ ...prev!, cls: Math.round(clsValue * 1000) / 1000 }))
            }
          })
        }).observe({ entryTypes: ['layout-shift'] })

        // Measure TTFB
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          setMetrics((prev) => ({
            ...prev!,
            ttfb: Math.round(navigation.responseStart - navigation.requestStart),
          }))
        }

        setMetrics({
          lcp: 0,
          fid: 0,
          cls: 0,
          ttfb: 0,
        })
      } catch (error) {
        console.error('Performance measurement error:', error)
      }
    }

    measurePerformance()
  }, [])

  if (!metrics) return null

  const getScore = (lcp: number, fid: number, cls: number) => {
    let score = 100
    if (lcp > 2500) score -= 20
    if (fid > 100) score -= 20
    if (cls > 0.1) score -= 20
    return Math.max(0, score)
  }

  const score = getScore(metrics.lcp, metrics.fid, metrics.cls)
  const scoreColor = score >= 90 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-30 hidden lg:block"
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="relative group"
        title="Click to view performance metrics"
      >
        {/* Badge */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg bg-white border-2 border-gray-200 ${scoreColor} hover:shadow-xl transition-shadow`}>
          {score}
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            Performance Score
          </div>
        </div>
      </button>

      {/* Detailed Metrics Panel */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200"
        >
          <h3 className="font-bold text-gray-900 mb-3">Core Web Vitals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">LCP:</span>
              <span className="font-mono">{metrics.lcp}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">FID:</span>
              <span className="font-mono">{metrics.fid}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CLS:</span>
              <span className="font-mono">{metrics.cls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TTFB:</span>
              <span className="font-mono">{metrics.ttfb}ms</span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="mt-3 w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 py-1 rounded transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
