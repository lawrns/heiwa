/**
 * Design Tokens - Centralized styling constants
 * Ensures consistency across all components per TOON protocol
 * 
 * Usage:
 * import { spacing, typography, colors, shadows, transitions } from '@/lib/design-tokens'
 */

// Spacing Scale - Use these values consistently throughout the app
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  section: '80px',
  sectionLg: '120px',
} as const;

// Typography Scale - Consistent font sizes and weights
export const typography = {
  // Labels: 12px, medium weight
  label: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '1.4',
  },
  // Helper text: 12px, regular weight
  helperText: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.4',
  },
  // Form inputs: 14px, regular weight
  input: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  // Buttons: 14px, medium weight
  button: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '1.5',
  },
  // Small buttons: 13px, medium weight
  buttonSmall: {
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: '1.5',
  },
  // Body text: 14px, regular weight
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.6',
  },
  // Small body: 13px, regular weight
  bodySmall: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '1.5',
  },
  // Headings
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '1.2',
  },
  h2: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '1.2',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '1.3',
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '1.3',
  },
  h5: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.4',
  },
  h6: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.4',
  },
} as const;

// Form Defaults - Consistent form element sizing
export const formDefaults = {
  inputHeight: '40px',
  inputBorderRadius: '10px',
  inputPaddingX: '12px',
  inputPaddingY: '8px',
  labelToInputGap: '6px',
  formGroupGap: '16px',
  ctaMarginTop: '24px',
} as const;

// Button Defaults - Consistent button sizing
export const buttonDefaults = {
  borderRadius: '10px',
  defaultHeight: '40px',
  touchTargetHeight: '44px',
  defaultPaddingX: '20px',
  defaultPaddingY: '10px',
  lgPaddingX: '24px',
  lgPaddingY: '12px',
  smPaddingX: '16px',
  smPaddingY: '8px',
} as const;

// Touch Targets - WCAG 2.5.5 compliant
export const touchTargets = {
  minimum: '44px',
  default: '40px',
  small: '36px',
} as const;

// Colors - Standardized color palette
export const colors = {
  // Primary accent
  accent: '#ec681c',
  accentLight: '#f77b2f',
  accentDark: '#d65d16',
  
  // Status colors
  success: '#16a34a',
  successLight: '#dcfce7',
  successDark: '#15803d',
  
  error: '#dc2626',
  errorLight: '#fee2e2',
  errorDark: '#b91c1c',
  
  warning: '#d97706',
  warningLight: '#fef3c7',
  warningDark: '#b45309',
  
  info: '#2563eb',
  infoLight: '#eff6ff',
  infoDark: '#1d4ed8',
  
  // Neutrals
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Text
  textDefault: '#1a1a1a',
  textMuted: '#5a5a5a',
  textLight: '#757575',
  
  // Backgrounds
  bgDefault: '#ffffff',
  bgAlt: '#f9f7f4',
  bgLight: '#fafafa',
} as const;

// Shadows - Elevation system
export const shadows = {
  subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// Border Radius - Consistent rounding
export const borderRadius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// Transitions - Animation timing
export const transitions = {
  micro: '150ms ease-out',
  standard: '300ms ease-out',
  slow: '500ms ease-out',
  inOut: '300ms ease-in-out',
} as const;

// Icons - Icon sizing and spacing
export const icons = {
  gap: '8px',
  sizeRelative: 0.9, // 0.9x relative to adjacent text
  sizes: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },
} as const;

// Animations - Animation values
export const animations = {
  cardHoverLift: '-4px',
  imageZoom: '105%',
  buttonActive: '0.98',
  buttonHoverLift: '-1px',
} as const;

// Breakpoints - Responsive design
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale - Consistent layering
export const zIndex = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
} as const;
