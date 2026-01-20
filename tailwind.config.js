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
          blue: '#1e3a8a',
          teal: '#0d9488',
          accent: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
