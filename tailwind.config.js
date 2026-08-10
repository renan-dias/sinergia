/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#006b1f',
          700: '#005316',
          800: '#166534',
          900: '#14532d',
          dark: '#003a0e'
        },
        ifred: {
          50: '#fef2f2',
          100: '#ffe1e1',
          500: '#e41e1b',
          600: '#bc0009',
          700: '#930005',
        },
        surface: '#f8f9ff',
        'surface-card': '#ffffff',
        'surface-subtle': '#f1f5f9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
