export const COLORS = {
  brand: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },
  depaul: {
    blue: '#005EB8',
    lightBlue: '#E8F3FF',
    red: '#C8102E',
  },
  status: {
    active:   { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
    pending:  { bg: '#fef9c3', text: '#854d0e', dot: '#ca8a04' },
    expired:  { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' },
    removed:  { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    rejected: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    verified: { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
    approved: { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  },
  category: {
    FOOD:     { bg: '#fef3c7', emoji: '🍕', label: 'Food' },
    DRINKS:   { bg: '#dbeafe', emoji: '🥤', label: 'Drinks' },
    APPAREL:  { bg: '#f3e8ff', emoji: '👕', label: 'Apparel' },
    SUPPLIES: { bg: '#ecfdf5', emoji: '📚', label: 'Supplies' },
    OTHER:    { bg: '#f3f4f6', emoji: '🎁', label: 'Other' },
  },
  gray: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
  bg: {
    primary:   '#ffffff',
    secondary: '#f9fafb',
    card:      '#ffffff',
  },
  error:   '#ef4444',
  success: '#16a34a',
  warning: '#f59e0b',
  info:    '#3b82f6',
};

export const FONTS = {
  regular:  { fontFamily: 'System', fontWeight: '400' },
  medium:   { fontFamily: 'System', fontWeight: '500' },
  semibold: { fontFamily: 'System', fontWeight: '600' },
  bold:     { fontFamily: 'System', fontWeight: '700' },
  heading:  { fontFamily: 'System', fontWeight: '800' },
  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
  },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const CARD_STYLE = {
  backgroundColor: COLORS.white,
  borderRadius: RADIUS.lg,
  padding: SPACING.base,
  ...SHADOWS.sm,
  borderWidth: 1,
  borderColor: COLORS.gray[100],
};

export const INPUT_STYLE = {
  borderWidth: 1.5,
  borderColor: COLORS.gray[200],
  borderRadius: RADIUS.md,
  paddingHorizontal: SPACING.base,
  paddingVertical: SPACING.md,
  fontSize: FONTS.sizes.base,
  color: COLORS.gray[900],
  backgroundColor: COLORS.white,
};

export const BTN_PRIMARY = {
  backgroundColor: COLORS.brand[600],
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};

export const BTN_SECONDARY = {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: COLORS.brand[600],
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};

export const BTN_DANGER = {
  backgroundColor: 'transparent',
  borderWidth: 1.5,
  borderColor: COLORS.error,
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.xl,
  alignItems: 'center',
  justifyContent: 'center',
};
