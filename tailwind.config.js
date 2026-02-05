/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
        animation: {
      marquee: "marquee 30s linear infinite",
    },
    keyframes: {
      marquee: {
        "0%": { transform: "translateX(0%)" },
        "100%": { transform: "translateX(-50%)" },
      },
    },
      colors: {
        brand: {
          orange: '#F97316', 
          black: '#0a0a0a', 
          charcoal: '#1c1c1c',
          gray: '#6b7280',
          light: '#FAFAFA',
          cream: '#F2F0E9', 
          surface: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(249, 115, 22, 0.15)',
      }
    },
  },
  plugins: [],
}