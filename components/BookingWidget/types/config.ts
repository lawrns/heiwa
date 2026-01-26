// Pure Next.js configuration interface for the booking widget
// Replaces WordPress-specific configuration

export interface NextJSConfig {
  buildId: string;
  settings: {
    apiEndpoint: string;
    apiKey: string;
    position: string;
    primaryColor: string;
    triggerText: string;
  };
}

// Global configuration interface
declare global {
  interface Window {
    heiwaApiConfig?: {
      settings?: {
        apiEndpoint?: string;
        apiKey?: string;
        position?: string;
        primaryColor?: string;
        triggerText?: string;
      };
    };
  }
}

// Default configuration for the booking widget
export const defaultConfig: NextJSConfig = {
  buildId: 'react-widget-heiwa-nextjs',
  settings: {
    apiEndpoint: '/api',
    apiKey: 'heiwa_nextjs_key_2024',
    position: 'right',
    primaryColor: '#f97316',
    triggerText: 'BOOK NOW'
  }
};

// Helper function to get configuration from window or use defaults
export function getWidgetConfig(): NextJSConfig {
  if (typeof window !== 'undefined' && window.heiwaApiConfig) {
    const globalSettings = window.heiwaApiConfig.settings || {};
    return {
      buildId: 'react-widget-heiwa-nextjs',
      settings: {
        apiEndpoint: globalSettings.apiEndpoint || defaultConfig.settings.apiEndpoint,
        apiKey: globalSettings.apiKey || defaultConfig.settings.apiKey,
        position: globalSettings.position || defaultConfig.settings.position,
        primaryColor: globalSettings.primaryColor || defaultConfig.settings.primaryColor,
        triggerText: globalSettings.triggerText || defaultConfig.settings.triggerText
      }
    };
  }
  return defaultConfig;
}
