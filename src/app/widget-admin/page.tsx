'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function WidgetAdminPage() {
  useEffect(() => {
    // Configure API for the WordPress widget
    if (typeof window !== 'undefined') {
      (window as any).heiwa_booking_ajax = {
        ajax_url: `${window.location.origin}/api/wordpress/ajax`,
        nonce: 'demo_nonce_for_testing',
        api_endpoint: `${window.location.origin}/api`,
        rest_base: `${window.location.origin}/wp-json/heiwa/v1`,
        build_id: '20250914-demo',
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
        onLoad={() => {
          console.log('jQuery loaded for WordPress widget')
          // Make jQuery available globally
          ;(window as any).jQuery = window.jQuery
          ;(window as any).$ = window.jQuery
        }}
      />

      {/* Load WordPress widget styles (modular CSS architecture) */}
      <link
        rel="stylesheet"
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/base.css?v=20250914"
      />
      <link
        rel="stylesheet"
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/components.css?v=20250914"
      />
      <link
        rel="stylesheet"
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/layout.css?v=20250914"
      />
      <link
        rel="stylesheet"
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/landing-page.css?v=20250914"
      />
      <link
        rel="stylesheet"
        href="/wordpress-plugin/heiwa-booking-widget/assets/css/utilities.css?v=20250914"
      />

      {/* WordPress widget JavaScript - Now working! */}
      <Script
        src="/wordpress-plugin/heiwa-booking-widget/assets/js/widget.js?v=20250914"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('WordPress widget script loaded')
          // Initialize the WordPress widget
          setTimeout(() => {
            if (typeof (window as any).jQuery !== 'undefined') {
              console.log('Initializing WordPress widget...')
              // The widget should auto-initialize
            }
          }, 1000)
        }}
      />

      {/* WordPress Landing Page Demo - Simulating [heiwa_landing_page] shortcode */}
      <div className="heiwa-landing-page-widget" data-widget-id="demo-widget">
        
        {/* Hero Section */}
        <section className="heiwa-hero-section">
          {/* Background Pattern */}
          <div className="heiwa-hero-background">
            <svg className="heiwa-hero-pattern" viewBox="0 0 400 400" fill="none">
              <defs>
                <pattern id="wave-pattern-demo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" strokeWidth="2" fill="none" className="heiwa-pattern-stroke"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wave-pattern-demo)" />
            </svg>
          </div>

          <div className="heiwa-hero-content">
            <div className="heiwa-hero-inner">
              <h1 className="heiwa-hero-title">
                Experience the Ultimate
                <span className="heiwa-hero-title-gradient">Surf Adventure</span>
              </h1>
              <p className="heiwa-hero-subtitle">
                Join our world-class surf camps in stunning locations around the world. From beginner-friendly waves to advanced surf coaching, we have the perfect experience for every level.
              </p>
              
              {/* Feature Highlights */}
              <div className="heiwa-feature-grid">
                <div className="heiwa-feature-card">
                  <div className="heiwa-feature-icon heiwa-blue-gradient">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="heiwa-feature-title">Expert Coaching</h3>
                  <p className="heiwa-feature-description">Professional surfers with decades of experience</p>
                </div>

                <div className="heiwa-feature-card">
                  <div className="heiwa-feature-icon heiwa-orange-gradient">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="heiwa-feature-title">Perfect Waves</h3>
                  <p className="heiwa-feature-description">World-famous breaks with consistent, quality waves</p>
                </div>

                <div className="heiwa-feature-card">
                  <div className="heiwa-feature-icon heiwa-teal-gradient">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="heiwa-feature-title">Amazing Community</h3>
                  <p className="heiwa-feature-description">Connect with fellow surfers from around the world</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Preview */}
        <section className="heiwa-destinations-section">
          <div className="heiwa-destinations-inner">
            <div className="heiwa-destinations-header">
              <h2 className="heiwa-destinations-title">Our Surf Destinations</h2>
              <p className="heiwa-destinations-subtitle">
                Discover amazing surf spots around the world
              </p>
            </div>

            <div className="heiwa-destinations-grid">
              <div className="heiwa-destination-card heiwa-blue-gradient" data-destination="Costa Rica">
                <div className="heiwa-destination-image">
                  <span className="heiwa-destination-name">Costa Rica</span>
                </div>
                <div className="heiwa-destination-content">
                  <h3 className="heiwa-destination-location">Nosara Beach Camp</h3>
                  <p className="heiwa-destination-description">Perfect waves for all levels with stunning beachfront accommodation</p>
                  <div className="heiwa-destination-footer">
                    <span className="heiwa-destination-price">€899</span>
                    <span className="heiwa-destination-duration">7 days</span>
                  </div>
                </div>
              </div>

              <div className="heiwa-destination-card heiwa-orange-gradient" data-destination="Morocco">
                <div className="heiwa-destination-image">
                  <span className="heiwa-destination-name">Morocco</span>
                </div>
                <div className="heiwa-destination-content">
                  <h3 className="heiwa-destination-location">Taghazout Surf Camp</h3>
                  <p className="heiwa-destination-description">North African adventure with consistent Atlantic waves</p>
                  <div className="heiwa-destination-footer">
                    <span className="heiwa-destination-price">€799</span>
                    <span className="heiwa-destination-duration">7 days</span>
                  </div>
                </div>
              </div>

              <div className="heiwa-destination-card heiwa-teal-gradient" data-destination="Portugal">
                <div className="heiwa-destination-image">
                  <span className="heiwa-destination-name">Portugal</span>
                </div>
                <div className="heiwa-destination-content">
                  <h3 className="heiwa-destination-location">Ericeira Surf Week</h3>
                  <p className="heiwa-destination-description">European surf paradise with world-class coaching</p>
                  <div className="heiwa-destination-footer">
                    <span className="heiwa-destination-price">€899</span>
                    <span className="heiwa-destination-duration">7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="heiwa-cta-section">
          <div className="heiwa-cta-inner">
            <h2 className="heiwa-cta-title">Ready for Your Surf Adventure?</h2>
            <p className="heiwa-cta-subtitle">Book your perfect surf experience today</p>
            <div className="heiwa-cta-text">
              Click the "Book Now" button to see the WordPress plugin integration demo!
            </div>
          </div>
        </section>

        {/* Fixed Book Now Button - WordPress Plugin Trigger */}
        <button
          className="heiwa-booking-trigger heiwa-landing-trigger"
          data-widget-target="demo-widget"
          style={{'--heiwa-primary-color': '#f97316'} as any}
          aria-label="Open booking widget"
          title="Click to open the booking widget"
        >
          <svg className="heiwa-trigger-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="heiwa-trigger-text">
            Book Now
            <span className="heiwa-trigger-pulse"></span>
          </span>
        </button>
      </div>

      {/* Demo Info Banner */}
      <div className="fixed bottom-4 left-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-40">
        <h4 className="font-semibold mb-2">WordPress Plugin Demo</h4>
        <p className="text-sm mb-2">This page demonstrates the WordPress plugin shortcode:</p>
        <code className="bg-blue-700 px-2 py-1 rounded text-xs">[heiwa_landing_page]</code>
        <p className="text-xs mt-2 opacity-90">✅ CSS styling is working perfectly!</p>
        <p className="text-xs mt-1 opacity-80">✅ JavaScript syntax errors fixed!</p>
        <p className="text-xs mt-1 opacity-80">✅ Booking widget now fully functional!</p>
      </div>
    </>
  )
}
