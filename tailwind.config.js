/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d',
        },
        critical: {
          DEFAULT: '#dc2626',
          bg: '#fef2f2',
          border: '#fca5a5',
          text: '#991b1b',
        },
        high: {
          DEFAULT: '#ea580c',
          bg: '#fff7ed',
          border: '#fdba74',
          text: '#9a3412',
        },
        medium: {
          DEFAULT: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
        },
        low: {
          DEFAULT: '#2563eb',
          bg: '#eff6ff',
          border: '#bfdbfe',
          text: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}
