'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function TestRoomBookingPage() {
  const [apiResult, setApiResult] = useState('')
  const [roomResult, setRoomResult] = useState('')
  const [widgetResult, setWidgetResult] = useState('')
  const [bookingResult, setBookingResult] = useState('')

  const API_BASE = 'https://heiwahouse.netlify.app/api'
  const API_KEY = 'heiwa_wp_test_key_2024_secure_deployment'

  useEffect(() => {
    // Configure API for the widget
    if (typeof window !== 'undefined') {
      (window as any).heiwa_booking_ajax = {
        api_endpoint: API_BASE,
        api_key: API_KEY
      }
    }

    // Auto-run tests on page load
    setTimeout(() => {
      testAPIConnectivity()
      setTimeout(() => testRoomAvailability(), 1000)
      setTimeout(() => testWidgetFunctions(), 2000)
    }, 500)
  }, [])

  const logResult = (setter: (value: string) => void, message: string, isSuccess = true) => {
    const prefix = isSuccess ? '✅' : '❌'
    setter(`${prefix} ${message}`)
  }

  const testAPIConnectivity = async () => {
    try {
      const response = await fetch(`${API_BASE}/wordpress/test`, {
        headers: { 'X-Heiwa-API-Key': API_KEY }
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        logResult(setApiResult, `API Connectivity Success: ${data.message}`, true)
      } else {
        logResult(setApiResult, `API Connectivity Failed: ${data.message || 'Unknown error'}`, false)
      }
    } catch (error: any) {
      logResult(setApiResult, `API Connectivity Error: ${error.message}`, false)
    }
  }

  const testRoomAvailability = async () => {
    try {
      const startDate = '2025-10-15'
      const endDate = '2025-10-20'
      const url = `${API_BASE}/wordpress/rooms/availability?start_date=${startDate}&end_date=${endDate}`
      
      const response = await fetch(url, {
        headers: { 'X-Heiwa-API-Key': API_KEY }
      })
      const data = await response.json()
      
      if (response.ok && data.success && data.data.available_rooms) {
        const roomCount = data.data.available_rooms.length
        const roomNames = data.data.available_rooms.map((r: any) => r.name).join(', ')
        logResult(setRoomResult, `Room Availability Success: Found ${roomCount} rooms (${roomNames})`, true)
      } else {
        logResult(setRoomResult, `Room Availability Failed: ${data.message || 'No rooms found'}`, false)
      }
    } catch (error: any) {
      logResult(setRoomResult, `Room Availability Error: ${error.message}`, false)
    }
  }

  const testWidgetFunctions = () => {
    try {
      // Check if widget functions exist
      const checks = [
        { name: 'jQuery', exists: typeof (window as any).jQuery !== 'undefined' },
        { name: 'HeiwaBookingWidget', exists: typeof (window as any).HeiwaBookingWidget !== 'undefined' },
        { name: 'heiwa_booking_ajax', exists: typeof (window as any).heiwa_booking_ajax !== 'undefined' }
      ]
      
      const results = checks.map(check => 
        `${check.exists ? '✅' : '❌'} ${check.name}: ${check.exists ? 'Available' : 'Missing'}`
      ).join('<br>')
      
      const allPassed = checks.every(check => check.exists)
      setWidgetResult(results)
    } catch (error: any) {
      logResult(setWidgetResult, `Widget Function Test Error: ${error.message}`, false)
    }
  }

  const simulateRoomBooking = async () => {
    try {
      setBookingResult('🔄 Starting room booking simulation...')
      
      // Step 1: Test API configuration
      if (typeof (window as any).heiwa_booking_ajax === 'undefined') {
        throw new Error('Widget API configuration not found')
      }
      
      // Step 2: Simulate API call like the widget does
      const apiConfig = {
        endpoint: (window as any).heiwa_booking_ajax.api_endpoint || API_BASE,
        apiKey: (window as any).heiwa_booking_ajax.api_key || API_KEY
      }
      
      const startDate = '2025-10-15'
      const endDate = '2025-10-20'
      const url = `${apiConfig.endpoint}/wordpress/rooms/availability?start_date=${startDate}&end_date=${endDate}`
      
      const response = await fetch(url, {
        headers: { 
          'X-Heiwa-API-Key': apiConfig.apiKey,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success && data.data.available_rooms && data.data.available_rooms.length > 0) {
        const room = data.data.available_rooms[0]
        logResult(setBookingResult, `Room Booking Simulation Success: Found room "${room.name}" at €${room.price_per_night}/night`, true)
      } else {
        logResult(setBookingResult, `Room Booking Simulation Failed: ${data.message || 'No rooms available'}`, false)
      }
      
    } catch (error: any) {
      logResult(setBookingResult, `Room Booking Simulation Failed: ${error.message}`, false)
    }
  }

  return (
    <>
      {/* Load jQuery */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />
      
      {/* Load widget scripts */}
      <Script 
        src="/wordpress-plugin/heiwa-booking-widget/assets/js/widget.js?v=2025091007"
        strategy="afterInteractive"
      />

      <div className="container">
        <style jsx>{`
          .container {
            font-family: Arial, sans-serif;
            margin: 20px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .test-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
          }
          .test-button {
            padding: 10px 20px;
            margin: 5px;
            background: #007cba;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;
          }
          .test-button:hover {
            background: #005a87;
          }
          .test-result {
            margin: 10px 0;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
            white-space: pre-wrap;
          }
          .success {
            background: #d4edda;
            color: #155724;
          }
          .error {
            background: #f8d7da;
            color: #721c24;
          }
        `}</style>

        <h1>Room Booking API Test</h1>
        
        <div className="test-section">
          <h2>1. Test API Connectivity</h2>
          <button className="test-button" onClick={testAPIConnectivity}>Test API Connection</button>
          <div className="test-result">{apiResult}</div>
        </div>
        
        <div className="test-section">
          <h2>2. Test Room Availability</h2>
          <button className="test-button" onClick={testRoomAvailability}>Test Room Availability</button>
          <div className="test-result">{roomResult}</div>
        </div>
        
        <div className="test-section">
          <h2>3. Test Widget Functions</h2>
          <button className="test-button" onClick={testWidgetFunctions}>Test Widget Functions</button>
          <div className="test-result" dangerouslySetInnerHTML={{ __html: widgetResult }}></div>
        </div>
        
        <div className="test-section">
          <h2>4. Simulate Room Booking Flow</h2>
          <button className="test-button" onClick={simulateRoomBooking}>Simulate Booking Flow</button>
          <div className="test-result">{bookingResult}</div>
        </div>
      </div>
    </>
  )
}
