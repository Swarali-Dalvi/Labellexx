/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#ECE6D9',
          300: '#DFD7C4',
        },
        charcoal: {
          900: '#1E232A',
          800: '#2A303C',
          700: '#3D4554',
          600: '#525C6E',
          500: '#6B768B',
          400: '#949EB2',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        pastel: {
          mint: '#D1FAE5',
          mintBorder: '#86EFAC',
          mintText: '#065F46',
          coral: '#FFE4E6',
          coralBorder: '#FDA4AF',
          coralText: '#9F1239',
          amber: '#FEF3C7',
          amberBorder: '#FCD34D',
          amberText: '#92400E',
          blue: '#E0F2FE',
          blueBorder: '#BAE6FD',
          blueText: '#075985',
          purple: '#F3E8FF',
          purpleBorder: '#E9D5FF',
          purpleText: '#6B21A8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(30, 35, 42, 0.04), 0 1px 2px rgba(30, 35, 42, 0.02)',
        'soft-md': '0 4px 12px -2px rgba(30, 35, 42, 0.06), 0 2px 6px -1px rgba(30, 35, 42, 0.03)',
        'soft-lg': '0 10px 25px -5px rgba(30, 35, 42, 0.08), 0 8px 10px -6px rgba(30, 35, 42, 0.03)',
        'soft-xl': '0 20px 35px -10px rgba(30, 35, 42, 0.10), 0 10px 15px -5px rgba(30, 35, 42, 0.04)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      }
    },
  },
  plugins: [],
}
