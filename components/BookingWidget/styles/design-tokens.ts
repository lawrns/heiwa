/**
 * Booking Widget Design Tokens
 * Centralized design system for consistent styling across all booking widget components
 * 
 * TOON Protocol Compliant - Pixel-Perfect UI Standards
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
  
  // TOON-compliant spacing scale
  spacing: {
    xs: '4px',    // 0.25rem
    sm: '8px',    // 0.5rem
    md: '12px',   // 0.75rem
    lg: '16px',   // 1rem
    xl: '24px',   // 1.5rem
    xxl: '32px',  // 2rem
  },
  
  // TOON-compliant typography
  typography: {
    fontSizes: {
      xs: '12px',   // Labels, helper text
      sm: '13px',   // Secondary buttons
      base: '14px', // Primary buttons, inputs
      lg: '16px',   // Headings
      xl: '20px',   // Large headings
      '2xl': '24px', // Section titles
      '3xl': '30px', // Page titles
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
  
  // Button-specific tokens (TOON-compliant)
  button: {
    minHeight: '40px',
    paddingX: '16px',
    paddingY: '10px',
    borderRadius: '10px',
    fontSize: {
      primary: '14px',
      secondary: '13px',
    },
    fontWeight: 500,
    opticalOffset: '-0.5px',
  },
  
  // Input-specific tokens (TOON-compliant)
  input: {
    height: '40px',
    paddingX: '12px',
    paddingY: '8px',
    borderRadius: '10px',
    fontSize: '14px',
  },
  
  // Form layout tokens (TOON-compliant)
  form: {
    labelSpacing: '6px',
    elementGap: '16px',
    groupSpacing: '24px',
    ctaMarginTop: '24px',
    containerPadding: '16px',
  },
  
  // Interaction tokens (TOON-compliant)
  interactions: {
    hoverTranslateY: '-1px',
    activeScale: '0.98',
    transitionDuration: '150ms',
    transitionEasing: 'ease-out',
  },
  
  // Focus state tokens (TOON-compliant) - Requirement 8.4
  focus: {
    ringWidth: '2px',
    ringColor: 'rgba(236, 104, 28, 0.2)', // orange-500/20
    borderColor: '#ec681c', // orange-500
    outlineOffset: '0px',
  },
  
  // Icon tokens (TOON-compliant)
  icons: {
    textGap: '8px',
    sizeRatio: 0.9,
  },
  
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '10px',  // Updated to match TOON standard
    xl: '16px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    // Hover shadow for buttons
    hover: '0 4px 12px rgba(0, 0, 0, 0.15)',
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

