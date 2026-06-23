export const Colors = {
  bgBase: '#0A0A0A',
  bgSurface: '#131313',
  bgElevated: '#1C1C1C',
  bgInteractive: '#222222',
  accentVolt: '#C8FF00',
  accentFire: '#FF3D1A',
  accentIce: '#00D4FF',
  accentAmber: '#FFB800',
  textPrimary: '#EFEFEF',
  textSecondary: '#A0A0A0',
  textMuted: '#555555',
  textGhost: '#282828',
  stroke: '#202020',
  strokeStrong: '#333333',
  overlay: 'rgba(0,0,0,0.72)',
  voteYes: '#00D4FF',
  voteNo: '#FF3D1A',
  repGhost: '#555555',
  repLow: '#FF3D1A',
  repMid: '#FFB800',
  repHigh: '#C8FF00',
  repLegend: '#00D4FF',
} as const;

export const S = {
  px: 1,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2: 24,
  x3: 32,
  x4: 40,
  x5: 48,
  x6: 56,
  x7: 64,
  x8: 80,
} as const;

export const F = {
  size: {
    micro: 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    x2: 30,
    x3: 38,
    x4: 48,
    hero: 56,
  },
  family: {
    displayBlack: 'SpaceGrotesk_800ExtraBold',
    displayBold: 'SpaceGrotesk_700Bold',
    bodyMedium: 'Inter_500Medium',
    bodyRegular: 'Inter_400Regular',
    bodySemi: 'Inter_600SemiBold',
    monoMedium: 'JetBrainsMono_600SemiBold',
    monoBold: 'JetBrainsMono_700Bold',
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.65,
  },
} as const;

export const R = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
