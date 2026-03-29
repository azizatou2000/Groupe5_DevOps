/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EB',
          100: '#F5EBD0',
          200: '#EBD7A1',
          300: '#E0C372',
          400: '#D4AC3C',
          500: '#B8922E',
          600: '#8F7123',
          700: '#665118',
          800: '#3D310E',
          900: '#1F1907',
        },
        navy: {
          50: '#EEF0F4',
          100: '#D5DAE3',
          200: '#ABB5C7',
          300: '#8190AB',
          400: '#576B8F',
          500: '#1B3A6B',
          600: '#162F56',
          700: '#112340',
          800: '#0B182B',
          900: '#060C15',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
