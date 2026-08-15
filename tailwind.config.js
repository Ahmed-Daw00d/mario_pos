/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:    '#C8102E',
          green:  '#008C45',
          gold:   '#F4D03F',
          dark:   '#1A1A2E',
          card:   '#16213E',
          navy:   '#0F3460',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
        'pulse-slow':  'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-once': 'bounceOnce 0.5s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
}
