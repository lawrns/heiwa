# CDN Configuration for Heiwa Booking Widget

## Overview
This document outlines the CDN configuration for optimal asset delivery and performance of the Heiwa booking widget system.

## CDN Strategy

### 1. Static Assets
- **CSS Files**: Widget stylesheets, component styles
- **JavaScript Files**: Widget scripts, React bundles
- **Images**: Room photos, icons, backgrounds
- **Fonts**: Custom typography assets

### 2. Recommended CDN Providers

#### Option 1: Cloudflare (Recommended)
```bash
# Cloudflare configuration
- Global edge network with 200+ locations
- Automatic optimization (Brotli compression, minification)
- Built-in security (DDoS protection, WAF)
- Free tier available
```

#### Option 2: AWS CloudFront
```bash
# CloudFront configuration
- Integration with AWS S3 for origin
- Lambda@Edge for dynamic optimization
- Custom SSL certificates
- Pay-per-use pricing
```

#### Option 3: Netlify CDN
```bash
# Netlify CDN (if using Netlify hosting)
- Automatic CDN for all static assets
- Edge functions for dynamic content
- Built-in optimization
- Integrated with deployment pipeline
```

## Implementation Steps

### 1. Asset Organization
```
public/
├── cdn/
│   ├── css/
│   │   ├── widget.min.css
│   │   ├── landing-page.min.css
│   │   └── components.min.css
│   ├── js/
│   │   ├── widget.min.js
│   │   ├── booking-flow.min.js
│   │   └── analytics.min.js
│   ├── images/
│   │   ├── rooms/
│   │   ├── icons/
│   │   └── backgrounds/
│   └── fonts/
│       ├── inter/
│       └── custom/
```

### 2. WordPress Plugin CDN Integration
```php
// wordpress-plugin/heiwa-booking-widget/includes/class-cdn.php
class Heiwa_Booking_CDN {
    private $cdn_url;
    
    public function __construct() {
        $this->cdn_url = get_option('heiwa_cdn_url', '');
        add_filter('heiwa_asset_url', array($this, 'get_cdn_url'));
    }
    
    public function get_cdn_url($asset_path) {
        if (empty($this->cdn_url)) {
            return HEIWA_BOOKING_PLUGIN_URL . $asset_path;
        }
        
        return rtrim($this->cdn_url, '/') . '/' . ltrim($asset_path, '/');
    }
}
```

### 3. Environment Configuration
```bash
# Production environment variables
CDN_BASE_URL=https://cdn.heiwahouse.com
CDN_VERSION=v1.0.0
CDN_CACHE_DURATION=31536000  # 1 year in seconds

# Development environment
CDN_BASE_URL=http://localhost:3005
CDN_VERSION=dev
CDN_CACHE_DURATION=0
```

### 4. Cache Headers Configuration
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/cdn/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=31536000'
          }
        ]
      }
    ];
  }
};
```

## Performance Optimizations

### 1. Asset Compression
```bash
# Gzip/Brotli compression
- CSS: ~70% size reduction
- JavaScript: ~60% size reduction
- Images: WebP format with fallbacks
```

### 2. Critical Resource Hints
```html
<!-- Preload critical assets -->
<link rel="preload" href="https://cdn.heiwahouse.com/css/widget.min.css" as="style">
<link rel="preload" href="https://cdn.heiwahouse.com/js/widget.min.js" as="script">

<!-- DNS prefetch for external resources -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.heiwahouse.com">
```

### 3. Image Optimization
```javascript
// Responsive images with CDN
const getOptimizedImageUrl = (imagePath, width, quality = 80) => {
  const cdnBase = process.env.CDN_BASE_URL;
  return `${cdnBase}/images/${imagePath}?w=${width}&q=${quality}&f=webp`;
};
```

## Monitoring and Analytics

### 1. CDN Performance Metrics
```javascript
// Track CDN performance
const trackCDNPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes('cdn.heiwahouse.com')) {
        analytics.track('cdn_asset_load', {
          asset: entry.name,
          loadTime: entry.duration,
          size: entry.transferSize
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
};
```

### 2. Cache Hit Rate Monitoring
```bash
# Cloudflare Analytics API
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

## Security Considerations

### 1. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.heiwahouse.com;
               style-src 'self' https://cdn.heiwahouse.com 'unsafe-inline';
               img-src 'self' https://cdn.heiwahouse.com data:;">
```

### 2. CORS Configuration
```javascript
// CDN CORS headers
{
  "Access-Control-Allow-Origin": "https://heiwahouse.com",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
  "Access-Control-Max-Age": "86400"
}
```

## Deployment Checklist

### Pre-deployment
- [ ] Assets minified and compressed
- [ ] CDN endpoints configured
- [ ] Cache headers set correctly
- [ ] CORS policies configured
- [ ] SSL certificates installed

### Post-deployment
- [ ] Verify asset loading from CDN
- [ ] Test cache hit rates
- [ ] Monitor performance metrics
- [ ] Validate security headers
- [ ] Check cross-origin functionality

## Rollback Procedures

### 1. Immediate Rollback
```bash
# Switch back to local assets
export CDN_BASE_URL=""
# Restart application
pm2 restart heiwa-booking-widget
```

### 2. Gradual Rollback
```javascript
// Feature flag for CDN usage
const useCDN = process.env.USE_CDN === 'true' && 
               process.env.NODE_ENV === 'production';

const getAssetUrl = (path) => {
  return useCDN ? `${CDN_BASE_URL}${path}` : `${LOCAL_BASE_URL}${path}`;
};
```

## Cost Optimization

### 1. Bandwidth Usage
- Implement smart caching strategies
- Use appropriate image formats and sizes
- Enable compression for all text assets

### 2. Request Optimization
- Bundle related assets
- Use HTTP/2 server push for critical resources
- Implement resource hints for better loading

## Maintenance

### 1. Regular Tasks
- Monitor CDN performance weekly
- Review cache hit rates monthly
- Update SSL certificates annually
- Audit asset usage quarterly

### 2. Emergency Procedures
- CDN outage response plan
- Asset corruption recovery
- Performance degradation investigation
- Security incident response
