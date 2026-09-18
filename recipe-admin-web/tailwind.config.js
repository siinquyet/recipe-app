/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // BR-UI: Tokens Stitch "Vietnamese Culinary Editorial" — khớp file DESIGN.md
      colors: {
        primary: {
          DEFAULT: '#0A2533',
          dark: '#042628',
          light: '#C6E3E5',
        },
        ink: '#0A2533',
        deepteal: '#13696D',
        accent: {
          DEFAULT: '#70B9BE',
          dark: '#3DA0A7',
          light: '#BCE5E8',
        },
        cream: '#FFF1CE',
        mist: '#F1F5F5',
        surface: '#F7F9FF',
        muted: '#97A2B0',
        stargold: '#FFC107',
        success: '#2E7D32',
        warning: '#F9A825',
        danger: '#C62828',
        info: '#1976D2',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '40px': '2.5rem',
      },
      boxShadow: {
        magazine: '0 50px 100px -20px rgba(10, 37, 51, 0.12), 0 30px 60px -30px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
