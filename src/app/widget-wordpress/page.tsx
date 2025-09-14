'use client';

import React from 'react';
import { StandaloneWidget } from '../../components/BookingWidget/StandaloneWidget';

/**
 * WordPress Widget Entry Point
 * 
 * This page serves as the build target for creating WordPress-compatible
 * React widget bundles. It's designed to be compiled into static assets
 * that can be embedded in WordPress via wp_enqueue_script.
 */
export default function WordPressWidgetPage() {
  return (
    <div className="wordpress-widget-page">
      {/* Main widget container */}
      <StandaloneWidget 
        containerId="heiwa-wordpress-widget"
        className="wordpress-integration"
      />
      
      {/* WordPress-specific global styles */}
      <style jsx global>{`
        /* WordPress Widget Global Styles */
        .wordpress-widget-page {
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        /* Ensure widget works in any WordPress theme */
        .wordpress-integration {
          position: relative;
          z-index: 999999;
        }
        
        /* WordPress theme compatibility overrides */
        .wordpress-integration *,
        .wordpress-integration *::before,
        .wordpress-integration *::after {
          box-sizing: border-box !important;
        }
        
        /* Reset WordPress theme button styles */
        .wordpress-integration button {
          background: none !important;
          border: none !important;
          padding: 0 !important;
          font: inherit !important;
          cursor: pointer !important;
          outline: inherit !important;
          text-decoration: none !important;
          color: inherit !important;
        }
        
        /* Reset WordPress theme link styles */
        .wordpress-integration a {
          text-decoration: none !important;
          color: inherit !important;
        }
        
        /* Ensure proper spacing */
        .wordpress-integration p,
        .wordpress-integration h1,
        .wordpress-integration h2,
        .wordpress-integration h3,
        .wordpress-integration h4,
        .wordpress-integration h5,
        .wordpress-integration h6 {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* WordPress admin bar compatibility */
        @media screen and (max-width: 782px) {
          .admin-bar .heiwa-booking-widget {
            top: 46px !important;
          }
        }
        
        @media screen and (min-width: 783px) {
          .admin-bar .heiwa-booking-widget {
            top: 32px !important;
          }
        }
        
        /* Ensure widget appears above WordPress content */
        .heiwa-booking-widget {
          z-index: 999999 !important;
          position: fixed !important;
        }
        
        /* WordPress theme color scheme compatibility */
        .wordpress-integration {
          --wp-primary: #0073aa;
          --wp-secondary: #005177;
          --wp-success: #00a32a;
          --wp-warning: #dba617;
          --wp-error: #d63638;
        }
      `}</style>
    </div>
  );
}

// Global initialization for WordPress
if (typeof window !== 'undefined') {
  // Expose widget initialization function globally
  (window as any).initHeiwaWidget = function(containerId = 'heiwa-wordpress-widget', config = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Heiwa Widget: Container not found:', containerId);
      return;
    }
    
    // Check if React is available
    if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
      console.error('Heiwa Widget: React or ReactDOM not available');
      return;
    }
    
    // Create React root and render widget
    const root = window.ReactDOM.createRoot(container);
    root.render(
      window.React.createElement(StandaloneWidget, {
        containerId: containerId,
        config: config || (window as any).heiwaWidgetConfig
      })
    );
    
    console.log('Heiwa Widget: Successfully initialized in container:', containerId);
  };
  
  // Auto-initialize if WordPress config is available
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof (window as any).heiwaWidgetConfig !== 'undefined') {
      const containers = document.querySelectorAll('.heiwa-react-widget-container');
      containers.forEach(function(container) {
        const containerId = container.id || 'heiwa-wordpress-widget';
        (window as any).initHeiwaWidget(containerId);
      });
    }
  });
}
