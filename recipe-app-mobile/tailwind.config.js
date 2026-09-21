/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // BR-UI: Tokens đồng bộ với web Bếp Nhà (DESIGN.md): mực Ink, teal, nền Mist
      colors: {
        mist: '#F1F5F5',
        muted: '#97A2B0',
        star: '#FFC107',
        primary: {
          DEFAULT: '#0A2533',
          dark: '#042628',
          light: '#C6E3E5',
        },
        accent: {
          DEFAULT: '#70B9BE',
          dark: '#3DA0A7',
          light: '#BCE5E8',
        },
        cream: '#FFF1CE',
        success: '#2E7D32',
        warning: '#F9A825',
        danger: '#C62828',
        info: '#1976D2',
      },
    },
  },
  plugins: [],
};
