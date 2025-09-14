# React Widget Integration for WordPress

This document outlines the approach for integrating the React booking widget into WordPress, providing the exact same UI/UX as the admin React widget while maintaining WordPress compatibility.

## 🎯 Objective

Replace the vanilla JavaScript WordPress widget with the React widget to achieve:
- **Exact same UI/UX** as `/widget-new/` and admin React widget
- **WordPress compatibility** with shortcodes and theme integration
- **Premium user experience** with modern React components
- **Seamless integration** with existing WordPress functionality

## 🚀 Integration Approach

### 1. WordPress Plugin Structure

```
wordpress-plugin/heiwa-booking-widget/
├── assets/
│   ├── build/                    # React build output
│   │   ├── index.css            # Compiled React styles
│   │   ├── index.js             # Compiled React bundle
│   │   └── static/              # Static assets
│   ├── css/                     # Fallback styles
│   └── images/                  # Widget images
├── includes/
│   ├── class-shortcode.php      # Updated for React integration
│   ├── class-api-connector.php  # API endpoints
│   └── class-widget.php         # Widget functionality
└── heiwa-booking-widget.php     # Main plugin file
```

### 2. Shortcode Implementation

Update `class-shortcode.php` to enqueue React build files:

```php
private function enqueue_assets() {
    // Enqueue React build CSS
    wp_enqueue_style(
        'heiwa-react-widget',
        HEIWA_BOOKING_PLUGIN_URL . 'assets/build/index.css',
        array(),
        HEIWA_WIDGET_BUILD_ID
    );

    // Enqueue React build JavaScript
    wp_enqueue_script(
        'heiwa-react-widget',
        HEIWA_BOOKING_PLUGIN_URL . 'assets/build/index.js',
        array(), // React is bundled, no external deps needed
        HEIWA_WIDGET_BUILD_ID,
        true
    );

    // Localize script with WordPress data and API config
    wp_localize_script('heiwa-react-widget', 'heiwaWidgetConfig', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('heiwa_booking_nonce'),
        'restBase' => esc_url_raw(rest_url('heiwa/v1')),
        'pluginUrl' => HEIWA_BOOKING_PLUGIN_URL,
        'buildId' => HEIWA_WIDGET_BUILD_ID,
        'settings' => array(
            'apiEndpoint' => get_option('heiwa_booking_settings')['api_endpoint'] ?? '',
            'apiKey' => get_option('heiwa_booking_settings')['api_key'] ?? '',
            'position' => get_option('heiwa_booking_settings')['widget_position'] ?? 'right',
            'primaryColor' => get_option('heiwa_booking_settings')['primary_color'] ?? '#ec681c',
            'triggerText' => get_option('heiwa_booking_settings')['trigger_text'] ?? 'BOOK NOW',
        )
    ));
}
```

### 3. React Component Adaptation

Create `StandaloneWidget.tsx` for WordPress integration:

```typescript
'use client';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
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

// Global WordPress configuration (populated by wp_localize_script)
declare global {
  interface Window {
    heiwaWidgetConfig?: WordPressConfig;
    heiwaWidgetAssets?: WidgetAssets;
  }
}

// Standalone widget for WordPress integration
export function StandaloneWidget({ containerId = 'heiwa-widget' }: StandaloneWidgetProps) {
  useEffect(() => {
    // Configure API endpoints for WordPress environment
    if (window.heiwaWidgetConfig) {
      console.log('Heiwa Widget: WordPress config loaded', window.heiwaWidgetConfig.buildId);
    }
  }, []);

  return <BookingWidget />;
}

// Auto-initialize when script loads (for WordPress integration)
if (typeof window !== 'undefined') {
  // Expose global initialization function for WordPress
  window.HeiwaBookingWidget = {
    init: (widgetId: string, settings: any) => {
      const container = document.getElementById(widgetId || 'heiwa-widget');
      if (container) {
        const root = createRoot(container);
        root.render(<StandaloneWidget containerId={widgetId} />);
      }
    }
  };
}
```

### 4. Build Process

Update `next.config.js` for standalone build:

```javascript
module.exports = {
  // Existing configuration...
  
  // Add standalone output for WordPress integration
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  
  // Generate unique build ID
  generateBuildId: async () => {
    return 'react-build-' + Date.now()
  }
}
```

Create build script `scripts/build-widget.sh`:

```bash
#!/bin/bash

echo "Building React widget for WordPress..."

# Build Next.js app in standalone mode
npm run build

# Copy build output to WordPress plugin directory
echo "Copying build files to WordPress plugin..."
mkdir -p wordpress-plugin/heiwa-booking-widget/assets/build

# Copy React build files
cp -r .next/static wordpress-plugin/heiwa-booking-widget/assets/build/
cp .next/standalone/index.html wordpress-plugin/heiwa-booking-widget/assets/build/

# Extract and copy CSS files
find .next -name "*.css" -exec cp {} wordpress-plugin/heiwa-booking-widget/assets/build/ \;

echo "Widget build complete! Files copied to WordPress plugin."
```

### 5. Shortcode Usage

```php
// Basic usage
[heiwa_booking]

// With custom options
[heiwa_booking 
    position="right" 
    primary_color="#f97316"
    trigger_text="BOOK NOW"
]

// Landing page with React widget
[heiwa_landing_page widget_type="react"]
```

## ✅ Benefits of React Integration

### 1. **🎨 Exact Same Look & Feel**
- Identical UI/UX to `/widget-new/` and admin React widget
- Modern React components with Tailwind CSS
- Responsive design and animations
- Professional surf-themed styling

### 2. **🔧 WordPress Integration**
- Seamless shortcode support
- Theme compatibility
- Plugin ecosystem integration
- WordPress admin settings

### 3. **📦 Self-Contained**
- No external dependencies beyond React bundle
- Optimized build with code splitting
- Fast loading and performance
- Minimal footprint

### 4. **🎯 Enhanced Features**
- Advanced booking flow with React state management
- Real-time validation and error handling
- Smooth animations and transitions
- Accessibility compliance

### 5. **⚡ Performance**
- Optimized React build
- Lazy loading of components
- Efficient bundle size
- Fast rendering

### 6. **🔒 Security**
- WordPress handles authentication and permissions
- Secure API integration
- Nonce validation
- Sanitized data handling

## 🚀 Implementation Steps

1. **Build the React widget:**
   ```bash
   npm run build:widget
   ```

2. **Verify files are copied:**
   ```
   wordpress-plugin/heiwa-booking-widget/assets/build/
   ├── index.css
   ├── index.js
   └── static/
   ```

3. **Update WordPress plugin:**
   - Upload updated plugin files
   - Activate React widget mode in settings
   - Test shortcode integration

4. **Test in WordPress:**
   - Add shortcode `[heiwa_booking]`
   - Verify React widget loads correctly
   - Test booking flow end-to-end

## 📊 Comparison: Vanilla JS vs React Widget

| Feature | Vanilla JS Widget | React Widget |
|---------|------------------|--------------|
| UI/UX Quality | Basic styling | Premium design |
| Responsiveness | Limited | Fully responsive |
| Animations | Basic CSS | Smooth React transitions |
| State Management | jQuery/DOM | React state |
| Code Maintainability | Complex | Clean & modular |
| Performance | Good | Optimized |
| User Experience | Functional | Premium |

## 🎯 Demo

Visit `/widget-premium/` to see the React widget integration in action:
- Same React component as `/widget-new/`
- WordPress configuration simulated
- Exact same UI/UX as admin React widget
- Build process ready for production

This approach provides the premium user experience you want while maintaining full WordPress compatibility!
