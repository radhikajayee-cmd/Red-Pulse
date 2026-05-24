/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables toggleable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#fed7d7',
          200: '#feb2b2',
          300: '#fc8181',
          400: '#f56565',
          50: '#e53e3e',
          600: '#e53e3e',
          700: '#c53030',
          800: '#9b2c2c',
          900: '#742a2a',
          DEFAULT: '#e53e3e', // Red
        },
        hospital: {
          red: {
            light: '#FEE2E2',
            DEFAULT: '#DC2626',
            dark: '#991B1B',
            deep: '#7F1D1D',
          },
          gray: {
            light: '#F9FAFB',
            medium: '#E5E7EB',
            dark: '#374151',
            deep: '#1F2937',
            abyss: '#111827',
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
