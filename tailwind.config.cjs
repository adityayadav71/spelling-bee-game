module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3F20",
        secondary: "#345830",
        accent: "#94ECBE"
      },
      boxShadow: {
        speakerShadow: "0px 0px 85.5px 15px rgba(110, 178, 87, 0.25)",
        speakerShadowEnhanced: "0px 0px 85.5px 30px rgba(110, 178, 87, 0.25)"
      },
      animation: {
        error: "error 1s ease-in-out both"
      }
    },
  },
  plugins: [],
}
