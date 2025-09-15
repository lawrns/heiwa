'use client';

import React, { useEffect, useState } from 'react';
import { BookingWidget } from './BookingWidget';

// WordPress configuration interface
interface WordPressConfig {
  ajaxUrl: string;
  nonce: string;
  restBase: string;
  pluginUrl: string;
  buildId: string;
  settings: {
    apiEndpoint: string;
    apiKey: string;
    position: string;
    primaryColor: string;
    triggerText: string;
  };
}

interface StandaloneWidgetProps {
  config?: WordPressConfig;
  containerId?: string;
  className?: string;
}

/**
 * Standalone React Widget for WordPress Integration
 * 
 * This component wraps the main BookingWidget and provides WordPress-specific
 * configuration and initialization logic.
 */
export function StandaloneWidget({ 
  config, 
  containerId = 'heiwa-widget',
  className = '' 
}: StandaloneWidgetProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [wpConfig, setWpConfig] = useState<WordPressConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize WordPress configuration
    const initializeConfig = () => {
      try {
        // Get config from props or global WordPress object
        let finalConfig = config;
        
        if (!finalConfig && typeof window !== 'undefined') {
          // Try to get config from WordPress localized script
          const globalConfig = (window as any).heiwaWidgetConfig;
          if (globalConfig) {
            finalConfig = globalConfig;
          }
        }

        if (!finalConfig) {
          throw new Error('WordPress configuration not found. Ensure wp_localize_script is properly configured.');
        }

        // Validate required configuration
        if (!finalConfig.restBase || !finalConfig.nonce) {
          throw new Error('Invalid WordPress configuration. Missing required fields.');
        }

        setWpConfig(finalConfig);
        setIsConfigured(true);
        
        console.log('🎯 Heiwa Widget: WordPress configuration loaded', {
          buildId: finalConfig.buildId,
          restBase: finalConfig.restBase,
          containerId
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown configuration error';
        setError(errorMessage);
        console.error('❌ Heiwa Widget Configuration Error:', errorMessage);
      }
    };

    initializeConfig();
  }, [config, containerId]);

  // Error state
  if (error) {
    return (
      <div className="heiwa-widget-error" style={{
        padding: '20px',
        border: '2px solid #ef4444',
        borderRadius: '8px',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Heiwa Booking Widget Error
        </h4>
        <p style={{ margin: '0', fontSize: '14px' }}>
          {error}
        </p>
        <details style={{ marginTop: '10px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer' }}>Technical Details</summary>
          <pre style={{ 
            marginTop: '5px', 
            padding: '10px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            Container ID: {containerId}
            {wpConfig && `
Build ID: ${wpConfig.buildId}
REST Base: ${wpConfig.restBase}
Plugin URL: ${wpConfig.pluginUrl}`}
          </pre>
        </details>
      </div>
    );
  }

  // Loading state
  if (!isConfigured || !wpConfig) {
    return (
      <div className="heiwa-widget-loading" style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#6b7280',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }}></div>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Loading Heiwa Booking Widget...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render the main BookingWidget with WordPress configuration
  return (
    <div 
      id={containerId}
      className={`heiwa-react-widget-container ${className}`}
      data-widget-id={containerId}
      data-build-id={wpConfig.buildId}
    >
      <BookingWidget 
        className="heiwa-wordpress-widget"
      />
      
      {/* WordPress integration styles */}
      <style>{`
        .heiwa-react-widget-container {
          position: relative;
          z-index: 999999;
        }
        
        .heiwa-wordpress-widget {
          /* Ensure widget works in WordPress themes */
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* WordPress theme compatibility */
        .heiwa-react-widget-container *,
        .heiwa-react-widget-container *::before,
        .heiwa-react-widget-container *::after {
          box-sizing: border-box;
        }
        
        /* Override WordPress theme styles that might interfere - scoped to WP native elements only */
        .heiwa-react-widget-container .wp-block-button .wp-block-button__link,
        .heiwa-react-widget-container .wp-element-button,
        .heiwa-react-widget-container input[type="submit"]:not(.heiwa-allow-styling),
        .heiwa-react-widget-container input[type="button"]:not(.heiwa-allow-styling) {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          outline: inherit;
        }

        /* Ensure React component buttons retain their Tailwind styling */
        .heiwa-react-widget-container button.bg-gradient-to-r,
        .heiwa-react-widget-container button[class*="border-"],
        .heiwa-react-widget-container button[class*="p-"],
        .heiwa-react-widget-container button[class*="px-"],
        .heiwa-react-widget-container button[class*="py-"] {
          background: revert !important;
          border: revert !important;
          padding: revert !important;
        }

        /* Defensive orange gradient enforcement for brand consistency */
        .heiwa-react-widget-container button.bg-gradient-to-r.from-orange-500 {
          background-image: linear-gradient(to right, #f97316, #ea580c) !important;
        }

        .heiwa-react-widget-container button.bg-gradient-to-r.from-orange-500:hover {
          background-image: linear-gradient(to right, #ea580c, #c2410c) !important;
        }
        
        /* Ensure proper z-index stacking */
        .heiwa-booking-widget {
          z-index: 999999 !important;
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
      `}</style>
    </div>
  );
}

// Global export for WordPress
if (typeof window !== 'undefined') {
  (window as any).HeiwaStandaloneWidget = StandaloneWidget;
}

export default StandaloneWidget;
