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
      // Recipely tokens trích từ SVG gốc: navy chủ đạo, teal accent, kem nền minh họa
      colors: {
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
