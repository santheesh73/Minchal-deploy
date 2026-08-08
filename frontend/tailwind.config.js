/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fefce8',   // Warm Cream Light
          100: '#fef9c3',  // Soft Light Yellow
          200: '#fef08a',  // Warm Cream Yellow
          300: '#fde047',  // Gold Accent
          400: '#facc15',  // Bright Gold
          500: '#ffbf00',  // User Primary Gold (#FFBF00)
          600: '#38663d',  // User Mid Forest Green (#38663D)
          700: '#2d5332',  // Darker Forest Green
          800: '#213524',  // User Deep Forest Dark Green (#213524)
          900: '#142417',  // Deepest Dark Forest Green
        },
        energy: {
          gold: '#ffbf00',       // Gold Accent
          cream: '#fef08a',      // Light Cream Accent
          green: '#38663d',      // Mid Forest Green (#38663D)
          greenDark: '#213524',  // Deep Dark Forest Green (#213524)
          orange: '#f59e0b',     // Warning / Attention
          orangeDark: '#d97706',
          purple: '#8b5cf6',     // Insights / Secondary
          purpleDark: '#7c3aed',
        },
        surface: {
          light: '#fdfcf7',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#94a3b8',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(255, 191, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}