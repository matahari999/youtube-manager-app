export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anthropic: {
          dark: "#141413",
          light: "#faf9f5",
          "mid-gray": "#b0aea5",
          "light-gray": "#e8e6dc",
          orange: "#d97757",
          blue: "#6a9bcc",
          green: "#788c5d",
        }
      },
      fontFamily: {
        sans: ['Lora', 'Georgia', 'serif'],
        heading: ['Poppins', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
