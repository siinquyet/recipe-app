/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // BR-UI: Tokens Enterprise — Inter + JetBrains Mono, BG #f6f7f9, sidebar #12151c
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#eff4ff',
        },
        enterprise: {
          app: '#f6f7f9',
          surface: '#ffffff',
          text: '#0f172a',
          subtle: '#475569',
          border: '#e5e7eb',
          sidebar: '#12151c',
          sidebarActive: '#1e2a44',
        },
        success: '#16a34a',
        warning: '#F9A825',
        danger: '#dc2626',
        info: '#1976D2',
        amberDot: '#f59e0b',
        searchBg: '#f9fafb',
        // Compat Editorial cũ (giữ để UserLayout + trang user không vỡ)
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
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '40px': '2.5rem',
      },
      boxShadow: {
        magazine: '0 50px 100px -20px rgba(10, 37, 51, 0.12), 0 30px 60px -30px rgba(0, 0, 0, 0.08)',
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card-hover': '0 2px 8px -2px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        // BR-UI: Chấm pulse cho hàng chờ live — opacity 1 → 0.4, 1.8s lặp vô hạn
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
