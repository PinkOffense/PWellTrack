export const colors = {
  // Primary palette — soft purple / lavender
  primary: '#7C5CFC',
  primaryLight: '#A78BFA',
  primaryDark: '#5B3FD4',
  primaryGradient: ['#7C5CFC', '#A78BFA'] as const,

  // Accent — warm coral / peach
  accent: '#FF7EB3',
  accentLight: '#FFB3D1',
  accentGradient: ['#FF7EB3', '#FF9A9E'] as const,

  // Status
  success: '#34D399',
  successLight: '#A7F3D0',
  warning: '#FBBF24',
  warningLight: '#FDE68A',
  danger: '#F87171',
  dangerLight: '#FECACA',
  info: '#60A5FA',
  infoLight: '#BFDBFE',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F6FF',
  card: '#FFFFFF',
  cardShadow: 'rgba(124, 92, 252, 0.08)',
  border: '#E8E3F3',
  textPrimary: '#2D2250',
  textSecondary: '#7B7394',
  textMuted: '#B0A8C9',
  placeholder: '#C4BDD9',
  overlay: 'rgba(45, 34, 80, 0.5)',

  // Species colors
  dog: '#FF9F43',
  cat: '#A78BFA',
  exotic: '#34D399',
};

export const shadows = {
  card: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
};
