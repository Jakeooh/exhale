/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          text: 'var(--color-primary-text)',
        },
        secondary: 'var(--color-secondary)',
        highlight: 'var(--color-highlight)',
        aqi: {
          good: 'var(--aqi-good)',
          moderate: 'var(--aqi-moderate)',
          sensitive: 'var(--aqi-sensitive)',
          unhealthy: 'var(--aqi-unhealthy)',
          'very-unhealthy': 'var(--aqi-very-unhealthy)',
          hazardous: 'var(--aqi-hazardous)',
        },
      },
      borderRadius: {
        '20': '20px',
        card: '20px',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'haze-pulse': 'breathe 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pop': 'pop 0.25s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)' },
          '50%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
