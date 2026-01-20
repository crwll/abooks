/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#DFFF00',
        'accent-hover': '#C8E600',
        dark: {
          bg: '#000000',
          surface1: '#0D0D0D',
          surface2: '#1C1C1E',
          surface3: '#2C2C2E',
          text: {
            primary: '#FFFFFF',
            secondary: '#8E8E93',
            tertiary: '#636366',
          },
          divider: '#38383A',
        },
        light: {
          bg: '#FFFFFF',
          surface1: '#F9F9F9',
          surface2: '#F2F2F7',
          surface3: '#E5E5EA',
          text: {
            primary: '#000000',
            secondary: '#6E6E73',
            tertiary: '#AEAEB2',
          },
          divider: '#D1D1D6',
        },
      },
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
