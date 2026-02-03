/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        upca: {
          blue: '#163352', // Dark navy blue from logo
          yellow: '#f1b21c', // Vibrant yellow from logo
          accent: '#1e40af',
        },
      },
    },
  },
  plugins: [],
}
