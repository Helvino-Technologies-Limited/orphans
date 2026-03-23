/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bbdeff',
          300: '#8dc8ff',
          400: '#57a8ff',
          500: '#3182f6',
          600: '#1a6aed',
          700: '#1558d9',
          800: '#1748b0',
          900: '#193f8b',
        },
        accent: { 500: '#f97316' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        lg: '0 4px 16px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
