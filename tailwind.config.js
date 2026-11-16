/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        realm: {
          bg: '#08090d',
          dark: '#0d0f15',
          card: '#11141e',
          cardHover: '#161a27',
          border: '#222738',
          borderHover: '#3d4460',
          bronze: '#1f1812',
          bronzeBorder: '#a17036',
          bronzeHover: '#33271d'
        },
        gold: {
          light: '#fde68a',
          DEFAULT: '#f5ba42',
          dark: '#b45309',
          glow: 'rgba(245, 186, 66, 0.35)',
        }
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(245, 186, 66, 0.2)',
        'gold-pill': 'inset 0 1px 0 rgba(255, 235, 180, 0.25), 0 4px 15px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
