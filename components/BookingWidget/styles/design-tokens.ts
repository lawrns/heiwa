/**
 * Booking Widget Design Tokens
 * Centralized design system for consistent styling across all booking widget components
 */

export const bookingWidgetTokens = {
  colors: {
    // Primary Brand Colors
    primary: '#ec681c', // orange-600
    primaryHover: '#ea580c', // orange-700
    primaryLight: '#fff7ed', // orange-50
    primaryBorder: '#fb923c', // orange-400
    
    // Neutral Grays
    background: '#f9fafb', // gray-50
    cardBackground: '#ffffff', // white
    border: '#e5e7eb', // gray-200
    borderHover: '#d1d5db', // gray-300
    textPrimary: '#111827', // gray-900
    textSecondary: '#4b5563', // gray-600
    textTertiary: '#6b7280', // gray-500
    
    // Status Colors
    success: '#16a34a', // green-600
    successLight: '#dcfce7', // green-50
    error: '#dc2626', // red-600
    errorLight: '#fee2e2', // red-50
    warning: '#d97706', // amber-600
    info: '#2563eb', // blue-600
  },
  
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
  },
  
  typography: {
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
  
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

