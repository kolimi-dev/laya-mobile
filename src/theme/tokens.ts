/**
 * Laya (లయ) Mobile — Design System Tokens
 * Calm Minimalist Theme System (Dark & Light Matte Palettes)
 */

export const darkColors = {
  // Backgrounds & Surfaces (Solid Matte, Zero Glassmorphism)
  bgDark: '#0E0F12',
  bgCard: '#16171B',
  bgCardHover: '#1C1D22',
  bgInput: '#121316',
  borderSubtle: '#26272E',
  borderActive: '#363842',

  // Restrained, Grounded Accents
  primary: '#38BDF8',
  primaryHover: '#0284C7',
  done: '#22C55E',
  progress: '#38BDF8',
  ignored: '#71717A',
  ignoredBg: '#1B1C22',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Text Hierarchy
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',

  // Group Badges
  groupPersonal: '#94A3B8',
  groupWork: '#38BDF8',
};

export const lightColors: typeof darkColors = {
  bgDark: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgCardHover: '#F1F5F9',
  bgInput: '#F1F5F9',
  borderSubtle: '#E2E8F0',
  borderActive: '#CBD5E1',

  primary: '#0284C7',
  primaryHover: '#0369A1',
  done: '#16A34A',
  progress: '#0284C7',
  ignored: '#64748B',
  ignoredBg: '#F1F5F9',
  warning: '#D97706',
  danger: '#DC2626',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',

  groupPersonal: '#64748B',
  groupWork: '#0284C7',
};

export const colors = darkColors;
export type ColorPalette = typeof darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radiuses = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
};

export const typography = {
  brandTitle: 20,
  heading: 17,
  subheading: 14,
  body: 13,
  caption: 11,
};
