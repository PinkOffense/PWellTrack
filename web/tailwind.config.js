/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C5CFC', light: '#A78BFA', dark: '#5B3FD4' },
        accent: { DEFAULT: '#FF7EB3', light: '#FFB3D1' },
        surface: '#F8F6FF',
        txt: { DEFAULT: '#2D2250', secondary: '#7B7394', muted: '#B0A8C9' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
