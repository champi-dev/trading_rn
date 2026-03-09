/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: '#09090B',
          secondary: '#111113',
          tertiary: '#1C1C22',
          elevated: '#232329',
        },
        // Surfaces
        surface: {
          glass: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
        },
        // Borders
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.15)',
        },
        // Text
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          tertiary: '#52525B',
          inverse: '#09090B',
        },
        // Accent colors — refined palette
        accent: {
          green: '#22C55E',
          'green-dim': 'rgba(34, 197, 94, 0.12)',
          'green-muted': 'rgba(34, 197, 94, 0.25)',
          red: '#EF4444',
          'red-dim': 'rgba(239, 68, 68, 0.12)',
          'red-muted': 'rgba(239, 68, 68, 0.25)',
          blue: '#3B82F6',
          'blue-dim': 'rgba(59, 130, 246, 0.12)',
          purple: '#8B5CF6',
          'purple-dim': 'rgba(139, 92, 246, 0.12)',
          gold: '#F59E0B',
          'gold-dim': 'rgba(245, 158, 11, 0.12)',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '22px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        hero: ['42px', { lineHeight: '48px' }],
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
