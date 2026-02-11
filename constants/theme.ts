/**
 * Humgo Design System - inDrive-style UI
 * Consistent across Expo Go (Android/iOS) and Web
 */

import { Platform, StyleSheet } from 'react-native';

// ════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ════════════════════════════════════════════════════════════════
export const Colors = {
  // Primary Brand
  primary: '#1FBF75',
  primaryDark: '#159A5A',
  primaryLight: '#E8F8F0',
  secondary: '#22C55E',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F2F4F7',
  backgroundTertiary: '#F9FAFB',
  inputBackground: '#F2F4F7',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Semantic
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#1FBF75',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Map Markers
  markerPickup: '#3B82F6',
  markerDropoff: '#EF4444',
  markerUser: '#1FBF75',

  // Chat
  chatSent: '#1FBF75',
  chatReceived: '#F2F4F7',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',

  // Status badges
  statusPending: '#9CA3AF',
  statusActive: '#1FBF75',
  statusCompleted: '#374151',
  statusCancelled: '#EF4444',

  // Theme-specific colors for useThemeColor hook compatibility
  light: {
    text: '#0F172A',
    background: '#FFFFFF',
    tint: '#1FBF75',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#1FBF75',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#1FBF75',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#1FBF75',
  },
};

// ════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ════════════════════════════════════════════════════════════════
export const Typography = {
  // Font weights
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ════════════════════════════════════════════════════════════════
// SPACING
// ════════════════════════════════════════════════════════════════
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// ════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ════════════════════════════════════════════════════════════════
export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 18,
  '3xl': 24,
  full: 9999,
};

// ════════════════════════════════════════════════════════════════
// SHADOWS
// ════════════════════════════════════════════════════════════════
export const Shadows = StyleSheet.create({
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 10,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  }),
});

// ════════════════════════════════════════════════════════════════
// COMPONENT DIMENSIONS
// ════════════════════════════════════════════════════════════════
export const Dimensions = {
  // Buttons
  buttonHeight: 52,
  buttonHeightLg: 56,
  buttonHeightSm: 44,

  // Inputs
  inputHeight: 52,

  // Icons
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,

  // Logo
  logoSize: 96,

  // Bottom sheet
  bottomSheetHandle: {
    width: 40,
    height: 4,
  },

  // Avatar
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,
  avatarXl: 96,

  // Vehicle card
  vehicleCardWidth: 100,
  vehicleCardHeight: 100,
};

// ════════════════════════════════════════════════════════════════
// FONTS (System defaults)
// ════════════════════════════════════════════════════════════════
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});

// ════════════════════════════════════════════════════════════════
// COMMON STYLES
// ════════════════════════════════════════════════════════════════
export const CommonStyles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Cards
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  cardFlat: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Buttons
  buttonPrimary: {
    height: Dimensions.buttonHeight,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonPrimaryText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonSecondary: {
    height: Dimensions.buttonHeight,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonSecondaryText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
  },
  buttonDanger: {
    height: Dimensions.buttonHeight,
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDangerText: {
    color: Colors.error,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightSemibold,
  },

  // Inputs
  input: {
    height: Dimensions.inputHeight,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },

  // Text
  heading1: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
  },
  heading2: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.tight,
  },
  heading3: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeightRegular,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeightRegular,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeightRegular,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeightRegular,
    color: Colors.textTertiary,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '100%',
  },

  // Row layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Floating action button
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },

  // Badge
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.primary,
  },
});

