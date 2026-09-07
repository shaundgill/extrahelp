/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F5F1',
        ink: '#1B2430',
        inksoft: '#525B66',
        line: '#DCD9CF',
        teal: {
          DEFAULT: '#1F7A6C',
          50: '#E7F3F0',
          600: '#1F7A6C',
          800: '#123F37',
        },
        amber: {
          DEFAULT: '#C17F1E',
          50: '#FBF1E1',
          600: '#C17F1E',
          800: '#6B4610',
        },
        alert: '#B4392E',
      },
      fontFamily: {
        serif: ['Iowan Old Style', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
