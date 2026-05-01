/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          50: '#f3faf3',
          100: '#d9f0d9',
          200: '#b3e0b3',
          300: '#7ec87e',
          400: '#4caf50',
          500: '#2e7d32',
          600: '#1b5e20',
          700: '#144d19',
          800: '#0d3a12',
          900: '#072709',
        },
        harvest: {
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff176',
          300: '#ffee58',
          400: '#ffca28',
          500: '#ffa000',
          600: '#e65100',
        },
      },
      fontFamily: {
        sans: ['Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Verdana', 'Geneva', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
