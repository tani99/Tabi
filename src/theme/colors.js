/**
 * Tabi Travel App Color Theme
 * 
 * This file contains all the colors used throughout the application,
 * organized by semantic meaning for easy maintenance and consistency.
 * Travel-themed colors inspired by adventure and exploration.
 */

export const colors = {
  // Primary Colors - Travel-inspired warm orange
  primary: {
    main: '#FF6B35',      // Primary orange for buttons, links, and accents
    light: '#FF8A65',     // Lighter shade of primary
    dark: '#E55A2B',      // Darker shade of primary
  },

  // Text Colors
  text: {
    primary: '#1E293B',   // Main text color (dark slate)
    secondary: '#64748B', // Secondary text color (medium slate)
    tertiary: '#475569',  // Tertiary text color (lighter slate)
    inverse: '#FFFFFF',   // Text on dark backgrounds
    disabled: '#94A3B8',  // Disabled text color (light gray)
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',   // Main background color
    secondary: '#F8FAFC', // Secondary background (light gray)
    tertiary: '#F1F5F9',  // Tertiary background (lighter gray)
  },

  // Border Colors
  border: {
    primary: '#E2E8F0',   // Main border color
    secondary: '#CBD5E1', // Secondary border color
    light: '#F1F5F9',     // Light border color
    focus: '#94A3B8',     // Border color when focused (warm gray)
    error: '#EF4444',     // Border color for error states
  },

  // Status Colors
  status: {
    success: {
      main: '#059669',    // Success emerald green
      light: '#047857',   // Lighter success emerald green
      background: '#ECFDF5', // Success background
      border: '#A7F3D0',  // Success border
    },
    error: {
      main: '#EF4444',    // Error red
      light: '#DC2626',   // Lighter error red
      background: '#FEF2F2', // Error background
      border: '#FECACA',  // Error border
    },
    warning: {
      main: '#F59E0B',    // Warning orange
      background: '#FFFBEB', // Warning background
      border: '#FED7AA',  // Warning border
    },
  },

  // Shorthand colors for common use cases
  success: '#059669',     // Success emerald green shorthand
  error: {
    main: '#EF4444',      // Error red shorthand
    light: '#FEE2E2',     // Light error red for backgrounds
  },

  // Button Colors
  button: {
    primary: {
      background: '#FF6B35',
      text: '#FFFFFF',
      border: '#FF6B35',
    },
    secondary: {
      background: '#FFFFFF',
      text: '#FF6B35',
      border: '#E2E8F0',
    },
    disabled: {
      background: '#CBD5E1',
      text: '#64748B',
      border: '#CBD5E1',
    },
  },

  // Input Colors
  input: {
    background: '#F8FAFC',
    border: '#E2E8F0',
    borderFocus: '#94A3B8',
    borderError: '#EF4444',
    placeholder: '#64748B',
    text: '#1E293B',
  },

  // Gmail Button Colors
  gmail: {
    background: '#FFFFFF',
    border: '#E2E8F0',
    borderPressed: '#CBD5E1',
    backgroundPressed: '#F1F5F9',
    icon: '#EA4335',      // Gmail red
    text: '#1E293B',
  },

  // Icon Colors
  icon: {
    primary: '#1E293B',
    secondary: '#64748B',
    success: '#10B981',
    error: '#EF4444',
    logout: '#EF4444',
  },

  // Shadow Colors
  shadow: {
    primary: '#000000',
    default: '#000000',
  },

  // Navigation Colors
  navigation: {
    background: '#FFFFFF',
  },
};

// Legacy color mappings for backward compatibility
export const legacyColors = {
  // These are direct mappings to the new color system
  // for components that haven't been updated yet
  '#1E293B': colors.text.primary,
  '#64748B': colors.text.secondary,
  '#475569': colors.text.tertiary,
  '#FF6B35': colors.primary.main,
  '#FFFFFF': colors.background.primary,
  '#F8FAFC': colors.background.secondary,
  '#F1F5F9': colors.background.tertiary,
  '#E2E8F0': colors.border.primary,
  '#CBD5E1': colors.border.secondary,
  '#EF4444': colors.status.error.main,
  '#10B981': colors.status.success.main,
  '#059669': colors.status.success.light,
  '#DC2626': colors.status.error.light,
  '#EA4335': colors.gmail.icon,
};

export default colors;
