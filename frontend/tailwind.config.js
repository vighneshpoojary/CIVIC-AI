/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CivicAI Brand Palette
        civic: {
          navy: "#102E50",
          navyDark: "#0B1F36",
          navyLight: "#1D426D",
          teal: "#087F8C",
          tealDark: "#06636D",
          tealLight: "#129DAC",
          bg: "#F4F7FA",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        // Semantic Statuses
        status: {
          critical: "#D90429",
          high: "#E63946",
          medium: "#F4A261",
          low: "#457B9D",
          resolved: "#2A9D8F",
          inProgress: "#2B6CB0",
          awaiting: "#D97706",
          rejected: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "Public Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        cardHover: "0 10px 15px -3px rgba(16, 46, 80, 0.07), 0 4px 6px -2px rgba(16, 46, 80, 0.04)",
      },
    },
  },
  plugins: [],
}
