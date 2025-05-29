/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' if you prefer OS-level dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4A90E2', // A nice blue
          DEFAULT: '#4A90E2',
          dark: '#357ABD',
        },
        secondary: {
          light: '#F5A623', // A warm orange
          DEFAULT: '#F5A623',
          dark: '#D48F1F',
        },
        background: {
          light: '#FFFFFF',
          dark: '#1A202C', // A dark gray
        },
        card: {
          light: '#F9FAFB', // Off-white for light mode cards
          dark: '#2D3748',  // Slightly lighter gray for dark mode cards
        },
        text: {
          light: '#1F2937', // Dark gray for light mode text
          dark: '#E2E8F0',  // Light gray for dark mode text
        },
        'text-muted': {
          light: '#6B7280',
          dark: '#A0AEC0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Using Inter as a modern sans-serif font
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}