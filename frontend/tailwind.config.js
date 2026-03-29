/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ajout d'une nuance "nuit profonde" pour votre identité visuelle
        'king-dark': '#020617',
      },
    },
  },
  plugins: [],
}