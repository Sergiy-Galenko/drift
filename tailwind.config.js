/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      fontFamily: {
        display: ['SpaceGrotesk'],
        body: ['Inter'],
        mono: ['JetBrainsMono'],
      },
    },
  },
  plugins: [],
};
