'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function TestWidgetPage() {
  const [initStatus, setInitStatus] = useState('Not initialized')
  const [statusClass, setStatusClass] = useState('status-info')

  useEffect(() => {
    // Configure API for the widget
    if (typeof window !== 'undefined') {
      (window as any).heiwa_booking_ajax = {
        api_endpoint: 'https://heiwahouse.netlify.app/api',
        api_key: 'heiwa_wp_test_key_2024_secure_deployment'
      }
    }
  }, [])

  const initializeWidget = () => {
    try {
      // Create a test trigger button
      const triggerHTML = '<button class="heiwa-booking-trigger widget-trigger-btn">BOOK NOW</button>'
      document.body.insertAdjacentHTML('beforeend', triggerHTML)

      // Initialize the widget
      if (typeof (window as any).HeiwaBookingWidget !== 'undefined') {
        ;(window as any).HeiwaBookingWidget.init()
        setInitStatus('Initialized successfully')
        setStatusClass('status-success')
      } else {
        throw new Error('HeiwaBookingWidget not found')
      }
    } catch (error: any) {
      console.error('Widget initialization failed:', error)
      setInitStatus('Initialization failed')
      setStatusClass('status-error')
    }
  }

  return (
    <>
      {/* Load jQuery */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />
      
      {/* Load widget styles */}
      <link 
        rel="stylesheet" 
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/widget.css?v=2025091007"
      />
      
      {/* Load widget scripts */}
      <Script 
        src="/wordpress-plugin/heiwa-booking-widget/assets/js/widget.js?v=2025091007"
        strategy="afterInteractive"
      />

      <div className="test-container">
        <style jsx>{`
          .test-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
          }
          .test-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .test-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .test-section h3 {
            margin-top: 0;
            color: #1e293b;
          }
          .widget-trigger-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
          }
          .widget-trigger-btn:hover {
            background: #1d4ed8;
          }
          .status-indicator {
            margin-top: 12px;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
          }
          .status-info {
            background: #dbeafe;
            color: #1e40af;
          }
          .status-success {
            background: #d1fae5;
            color: #065f46;
          }
          .status-error {
            background: #fee2e2;
            color: #991b1b;
          }
          .mock-api-response {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 16px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            white-space: pre-wrap;
            overflow-x: auto;
            margin: 12px 0;
          }
        `}</style>

        <div className="test-header">
          <h1>Heiwa Booking Widget Test Suite</h1>
          <p>Test the new booking type selector and dual booking flows</p>
        </div>

        <div className="test-section">
          <h3>Widget Initialization Test</h3>
          <p>Click the button below to initialize the widget and test the booking type selector:</p>
          <button className="widget-trigger-btn" onClick={initializeWidget}>
            Initialize Widget
          </button>
          <div className={`status-indicator ${statusClass}`}>
            {initStatus}
          </div>
        </div>

        <div className="test-section">
          <h3>Mock API Responses</h3>
          <p>Expected API response format for surf weeks:</p>
          <div className="mock-api-response">{`{
  "success": true,
  "data": {
    "surf_weeks": [
      {
        "id": "week-001",
        "title": "International Surf Week",
        "category": "international",
        "start_date": "2025-10-01",
        "end_date": "2025-10-08",
        "available_spots": 12,
        "price_from": 899,
        "description": "Open to all participants globally"
      }
    ]
  }
}`}</div>

          <p>Expected API response format for room availability:</p>
          <div className="mock-api-response">{`{
  "success": true,
  "data": {
    "available_rooms": [
      {
        "id": "room-001",
        "name": "Ocean View Double",
        "capacity": 2,
        "price_per_night": 120,
        "amenities": ["ocean_view", "private_bathroom", "wifi"]
      }
    ]
  }
}`}</div>
        </div>

        <div className="test-section">
          <h3>Accessibility Test Checklist</h3>
          <ul>
            <li>✅ ARIA labels and roles implemented</li>
            <li>✅ Keyboard navigation support (arrow keys, Enter, Space)</li>
            <li>✅ Focus indicators visible</li>
            <li>✅ Screen reader compatibility</li>
            <li>✅ Semantic HTML structure</li>
          </ul>
        </div>

        <div className="test-section">
          <h3>Responsive Design Test</h3>
          <p>Resize your browser window to test responsive behavior:</p>
          <ul>
            <li><strong>Mobile (≤767px):</strong> Cards stack vertically</li>
            <li><strong>Tablet (768px-1023px):</strong> Cards side by side</li>
            <li><strong>Desktop (≥1024px):</strong> Cards side by side with proper spacing</li>
          </ul>
        </div>
      </div>
    </>
  )
}
