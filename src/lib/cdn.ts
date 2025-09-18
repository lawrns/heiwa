/**
 * CDN Utility for Asset Delivery Optimization
 * Handles CDN URL generation, cache busting, and performance optimization
 */

interface CDNConfig {
  baseUrl: string;
  version: string;
  cacheDuration: number;
  enableCompression: boolean;
  enableWebP: boolean;
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
}

class CDNService {
  private config: CDNConfig;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.config = {
      baseUrl: process.env.CDN_BASE_URL || (this.isProduction ? 'https://cdn.heiwahouse.com' : ''),
      version: process.env.CDN_VERSION || 'v1.0.0',
      cacheDuration: parseInt(process.env.CDN_CACHE_DURATION || '31536000'), // 1 year
      enableCompression: true,
      enableWebP: true
    };
  }

  /**
   * Get CDN URL for static assets
   */
  getAssetUrl(path: string, cacheBust: boolean = true): string {
    // Remove leading slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Use local assets in development or if CDN is not configured
    if (!this.config.baseUrl || !this.isProduction) {
      const localUrl = `/${cleanPath}`;
      return cacheBust ? this.addCacheBuster(localUrl) : localUrl;
    }

    // Build CDN URL
    const cdnUrl = `${this.config.baseUrl}/${cleanPath}`;
    return cacheBust ? this.addCacheBuster(cdnUrl) : cdnUrl;
  }

  /**
   * Get optimized image URL with CDN transformations
   */
  getImageUrl(path: string, options: ImageOptions = {}): string {
    const {
      width,
      height,
      quality = 80,
      format = 'auto'
    } = options;

    // Use local images in development
    if (!this.config.baseUrl || !this.isProduction) {
      return this.getAssetUrl(path);
    }

    // Build transformation parameters
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 80) params.set('q', quality.toString());
    if (format !== 'auto') params.set('f', format);

    const baseUrl = this.getAssetUrl(path, false);
    const queryString = params.toString();
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Get CSS file URL with compression
   */
  getCSSUrl(filename: string): string {
    const path = `css/${filename}`;
    return this.getAssetUrl(path);
  }

  /**
   * Get JavaScript file URL with compression
   */
  getJSUrl(filename: string): string {
    const path = `js/${filename}`;
    return this.getAssetUrl(path);
  }

  /**
   * Get font file URL
   */
  getFontUrl(filename: string): string {
    const path = `fonts/${filename}`;
    return this.getAssetUrl(path);
  }

  /**
   * Add cache busting parameter
   */
  private addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${this.config.version}`;
  }

  /**
   * Generate preload links for critical resources
   */
  generatePreloadLinks(assets: Array<{ path: string; type: 'style' | 'script' | 'font' | 'image' }>): string[] {
    return assets.map(asset => {
      const url = this.getAssetUrl(asset.path);
      const crossorigin = asset.type === 'font' ? ' crossorigin' : '';
      return `<link rel="preload" href="${url}" as="${asset.type}"${crossorigin}>`;
    });
  }

  /**
   * Generate DNS prefetch links
   */
  generateDNSPrefetchLinks(): string[] {
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.heiwahouse.com'
    ];

    if (this.config.baseUrl) {
      const cdnDomain = new URL(this.config.baseUrl).hostname;
      domains.push(cdnDomain);
    }

    return domains.map(domain => `<link rel="dns-prefetch" href="//${domain}">`);
  }

  /**
   * Get cache headers for static assets
   */
  getCacheHeaders(): Record<string, string> {
    if (!this.isProduction) {
      return {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
    }

    return {
      'Cache-Control': `public, max-age=${this.config.cacheDuration}, immutable`,
      'CDN-Cache-Control': `max-age=${this.config.cacheDuration}`,
      'Vary': 'Accept-Encoding',
      'X-Content-Type-Options': 'nosniff'
    };
  }

  /**
   * Check if CDN is available
   */
  async checkCDNHealth(): Promise<{ available: boolean; latency?: number }> {
    if (!this.config.baseUrl) {
      return { available: false };
    }

    try {
      const startTime = Date.now();
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const latency = Date.now() - startTime;
      return {
        available: response.ok,
        latency
      };
    } catch (error) {
      console.warn('CDN health check failed:', error);
      return { available: false };
    }
  }

  /**
   * Get responsive image srcset
   */
  getResponsiveImageSrcSet(path: string, widths: number[]): string {
    return widths
      .map(width => `${this.getImageUrl(path, { width })} ${width}w`)
      .join(', ');
  }

  /**
   * Get configuration for debugging
   */
  getConfig(): CDNConfig & { isProduction: boolean } {
    return {
      ...this.config,
      isProduction: this.isProduction
    };
  }
}

// Create singleton instance
export const cdn = new CDNService();

/**
 * React hook for CDN assets
 */
export function useCDN() {
  return {
    getAssetUrl: cdn.getAssetUrl.bind(cdn),
    getImageUrl: cdn.getImageUrl.bind(cdn),
    getCSSUrl: cdn.getCSSUrl.bind(cdn),
    getJSUrl: cdn.getJSUrl.bind(cdn),
    getFontUrl: cdn.getFontUrl.bind(cdn),
    getResponsiveImageSrcSet: cdn.getResponsiveImageSrcSet.bind(cdn)
  };
}

/**
 * WordPress PHP helper functions (for documentation)
 */
export const wordpressCDNHelpers = `
<?php
// WordPress CDN helper functions
function heiwa_get_cdn_url($asset_path) {
    $cdn_base = get_option('heiwa_cdn_base_url', '');
    $version = get_option('heiwa_cdn_version', 'v1.0.0');
    
    if (empty($cdn_base) || !is_production()) {
        return HEIWA_BOOKING_PLUGIN_URL . $asset_path;
    }
    
    return rtrim($cdn_base, '/') . '/' . ltrim($asset_path, '/') . '?v=' . $version;
}

function heiwa_get_image_url($image_path, $width = null, $quality = 80) {
    $url = heiwa_get_cdn_url('images/' . $image_path);
    
    if ($width && is_production()) {
        $url .= (strpos($url, '?') !== false ? '&' : '?');
        $url .= "w={$width}&q={$quality}&f=webp";
    }
    
    return $url;
}

function heiwa_enqueue_cdn_assets() {
    $css_url = heiwa_get_cdn_url('css/widget.min.css');
    $js_url = heiwa_get_cdn_url('js/widget.min.js');
    
    wp_enqueue_style('heiwa-widget', $css_url, array(), null);
    wp_enqueue_script('heiwa-widget', $js_url, array(), null, true);
}

function is_production() {
    return defined('WP_ENV') && WP_ENV === 'production';
}
?>
`;

export default cdn;
