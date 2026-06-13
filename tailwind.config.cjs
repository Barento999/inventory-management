/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo 600
          light: '#818CF8', // Indigo 500
        },
      },
    },
  },
  plugins: [],
};