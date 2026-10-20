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
        navy: {
          950: '#050811',
          900: '#0a0f1d',
          850: '#0e1629',
          800: '#141e36',
          700: '#1e2c4f',
          600: '#2c3e6b',
        },
        brand: {
          primary: '#3b82f6',
          accent: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        },
        risk: {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444',
          inconclusive: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
