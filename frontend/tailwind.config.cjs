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
          dark: '#4F46E5', // Indigo 700
        },
        dark: {
          bg: '#0F172A', // Slate 900
          surface: '#1E293B', // Slate 800
          border: '#334155', // Slate 700
          text: '#F1F5F9', // Slate 100
          muted: '#94A3B8', // Slate 400
        },
      },
    },
  },
  plugins: [],
};