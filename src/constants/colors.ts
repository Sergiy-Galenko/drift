export const colors = {
  base: '#0D0D0D',
  surface: '#161616',
  elevated: '#1F1F1F',
  volt: '#C8FF00',
  fire: '#FF4D1C',
  ice: '#00D1FF',
  textPrimary: '#F0F0F0',
  textMuted: '#6B6B6B',
  textGhost: '#2E2E2E',
  stroke: '#242424',
} as const;

export type ColorToken = keyof typeof colors;
