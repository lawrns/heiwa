'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function WidgetDemoPage() {
  useEffect(() => {
    // Configure API for the widget
    if (typeof window !== 'undefined') {
      (window as any).heiwa_booking_ajax = {
        api_endpoint: `${window.location.origin}/api`,
        api_key: 'heiwa_wp_test_key_2024_secure_deployment'
      }
    }
  }, [])

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
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/widget.css?v=2025091101"
      />
      
      {/* Load widget scripts */}
      <Script 
        src="/wordpress-plugin/heiwa-booking-widget/assets/js/widget.js?v=2025091101"
        strategy="afterInteractive"
        onLoad={() => {
          // Auto-initialize widget after script loads
          try {
            setTimeout(() => {
              if (typeof (window as any).HeiwaBookingWidget !== 'undefined') {
                (window as any).HeiwaBookingWidget.init()
              }
            }, 300)
          } catch (e) {
            console.error('HeiwaBookingWidget init failed:', e)
          }
        }}
      />

      <div className="demo-container">
        <style jsx>{`
          .demo-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
          }
          .hero-section {
            text-align: center;
            margin-bottom: 60px;
          }
          .hero-section h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .hero-section p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 40px;
          }
          .demo-section {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .demo-section h2 {
            margin-top: 0;
            margin-bottom: 20px;
          }
          .booking-trigger {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .booking-trigger:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.3);
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
          }
          .feature-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
          }
          .feature-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          .instructions {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
          }
          .instructions h3 {
            margin-top: 0;
          }
          .instructions ol {
            text-align: left;
          }
          .instructions li {
            margin-bottom: 10px;
          }
        `}</style>

        <div className="hero-section">
          <h1>Heiwa House Booking Widget</h1>
          <p>Experience our premium surf camp booking system in action</p>
        </div>

        <div className="demo-section">
          <h2>Live Widget Demo</h2>
          <p>Click the button below to open the booking widget and explore the complete booking flow:</p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <button className="heiwa-booking-trigger booking-trigger">
              Book Your Surf Adventure
            </button>
          </div>

          <div className="instructions">
            <h3>How to Test:</h3>
            <ol>
              <li><strong>Click the booking button</strong> above to open the widget modal</li>
              <li><strong>Choose booking type:</strong> Select between "All-Inclusive Surf Week" or "Book a Room"</li>
              <li><strong>For Surf Weeks:</strong> Browse available surf camps and select one</li>
              <li><strong>For Room Booking:</strong> Pick dates, set participants, and check availability</li>
              <li><strong>Complete the flow:</strong> Fill in participant details and review your booking</li>
            </ol>
          </div>
        </div>

        <div className="demo-section">
          <h2>Widget Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">Design</div>
              <h3>Premium Design</h3>
              <p>Surf-themed styling with wave patterns and ocean gradients</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Mobile</div>
              <h3>Mobile Responsive</h3>
              <p>Perfect experience on all devices and screen sizes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Rooms</div>
              <h3>Real Room Data</h3>
              <p>Authentic Heiwa House rooms with images and amenities</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Fast</div>
              <h3>Fast & Smooth</h3>
              <p>Optimized performance with smooth animations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">Secure</div>
              <h3>Secure Booking</h3>
              <p>Safe and secure booking process with validation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">A11y</div>
              <h3>Accessible</h3>
              <p>Full keyboard navigation and screen reader support</p>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>Integration Ready</h2>
          <p>This widget is ready to be installed on any WordPress site using the provided plugin.</p>
          <p><strong>WordPress Integration:</strong> Simply add the <code>[heiwa_booking]</code> shortcode to any page or post.</p>
          <p><strong>API Powered:</strong> Connected to the live Heiwa House booking system with real room data and availability.</p>
        </div>
      </div>
    </>
  )
}
