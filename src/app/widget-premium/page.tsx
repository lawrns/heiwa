'use client';

import { useEffect } from 'react';
import { BookingWidget } from '../../components/BookingWidget/BookingWidget';

export default function WidgetPremiumPage() {
  useEffect(() => {
    // Simulate WordPress configuration that would be provided by wp_localize_script
    if (typeof window !== 'undefined') {
      (window as any).heiwaWidgetConfig = {
        ajaxUrl: `${window.location.origin}/wp-json/wp/v2/`,
        nonce: 'wp_rest_nonce_12345',
        restBase: `${window.location.origin}/wp-json/heiwa/v1`,
        pluginUrl: '/wordpress-plugin/heiwa-booking-widget/',
        buildId: 'react-build-' + Date.now(),
        settings: {
          apiEndpoint: `${window.location.origin}/api`,
          apiKey: 'heiwa_wp_test_key_2024_secure_deployment',
          position: 'right',
          primaryColor: '#f97316',
          triggerText: 'BOOK NOW'
        }
      };

      (window as any).heiwaWidgetAssets = {
        images: '/wordpress-plugin/heiwa-booking-widget/assets/images/',
        css: '/wordpress-plugin/heiwa-booking-widget/assets/build/'
      };

      console.log('🎯 WordPress React Widget Config Loaded:', (window as any).heiwaWidgetConfig.buildId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">WordPress Premium React Widget Demo</h1>
          <p className="text-orange-100">Demonstrating React widget integration approach for WordPress</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="wave-pattern-premium" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" strokeWidth="2" fill="none" className="text-orange-500"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern-premium)" />
          </svg>
        </div>

        <div className="relative px-6 py-20 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Experience the Ultimate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Surf Adventure
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Join our world-class surf camps in stunning locations around the world. 
              From beginner-friendly waves to advanced surf coaching, we have the perfect 
              experience for every level.
            </p>

            {/* Feature Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Expert Coaching</h3>
                <p className="text-gray-600 text-sm">Professional surfers with decades of experience</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Perfect Waves</h3>
                <p className="text-gray-600 text-sm">World-famous breaks with consistent, quality waves</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Amazing Community</h3>
                <p className="text-gray-600 text-sm">Connect with fellow surfers from around the world</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Surf Destinations</h2>
            <p className="text-xl text-gray-600">Discover amazing surf spots around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Costa Rica',
                location: 'Nosara Beach Camp',
                description: 'Perfect waves for all levels with stunning beachfront accommodation',
                price: 899,
                gradient: 'from-blue-400 to-blue-600',
              },
              {
                name: 'Morocco',
                location: 'Taghazout Surf Camp',
                description: 'North African adventure with consistent Atlantic waves',
                price: 799,
                gradient: 'from-orange-400 to-orange-600',
              },
              {
                name: 'Portugal',
                location: 'Ericeira Surf Week',
                description: 'European surf paradise with world-class coaching',
                price: 899,
                gradient: 'from-teal-400 to-teal-600',
              },
            ].map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className={`aspect-video bg-gradient-to-br ${destination.gradient} flex items-center justify-center`}>
                    <span className="text-white text-xl font-semibold drop-shadow-lg">
                      {destination.name}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {destination.location}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {destination.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-600">
                        €{destination.price}
                      </span>
                      <span className="text-sm text-gray-500">7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready for Your Surf Adventure?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Book your perfect surf experience today
          </p>
          <div className="text-orange-100 text-sm">
            Click the "Book Now" button in the top-right corner to experience the React widget!
          </div>
        </div>
      </section>

      {/* React Booking Widget - Same as /widget-new */}
      <BookingWidget />

      {/* Integration Info Panel */}
      <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40">
        <h4 className="font-semibold text-gray-900 mb-2">🚀 React Widget Integration</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>✅ Same React component as /widget-new</p>
          <p>✅ WordPress configuration simulated</p>
          <p>✅ Build process ready for wp_localize_script</p>
          <p>✅ Exact same UI/UX as admin React widget</p>
        </div>
        <div className="mt-2 text-xs text-orange-600 font-medium">
          This demonstrates the premium approach!
        </div>
      </div>
    </div>
  );
}
