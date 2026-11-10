/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0d14',
          800: '#111622',
          700: '#1a2234',
          600: '#253046',
        },
        brand: {
          purple: '#9333ea',
          violet: '#7c3aed',
          cyan: '#06b6d4',
          blue: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
