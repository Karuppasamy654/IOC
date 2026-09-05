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
        dark: {
          900: "#090d16",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155"
        },
        brand: {
          50: "#eef2ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669"
        },
        rose: {
          500: "#f43f5e",
          600: "#e11d48"
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.35)'
      }
    },
  },
  plugins: [],
}
