/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './public/index.html',
    './src/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        'gradient-start': '#2ecc71',
        'gradient-end': '#3498db',
        'text-primary': '#2c3e50',
      }
    }
  },
  plugins: [],
}

