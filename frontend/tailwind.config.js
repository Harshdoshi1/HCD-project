/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx,css,html}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#3B82F6',
            foreground: '#FFFFFF',
          },
          secondary: {
            DEFAULT: '#6B7280',
            foreground: '#FFFFFF',
          },
          destructive: {
            DEFAULT: '#EF4444',
            foreground: '#FFFFFF',
          },
        },
      },
    },
    plugins: [],
  }