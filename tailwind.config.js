/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ember: { black: "#171513", charcoal: "#24211E" },
        ivory: "#F4EFE6",
        sand: "#D8CDBD",
        // Copper is 3.4:1 on Ember Black: fine for borders/icons/large text only.
        // copper-soft is a lightened tint of the same hue for small accent text.
        copper: { DEFAULT: "#B85C32", soft: "#E08A62" },
        terracotta: "#7C3825",
      },
      fontFamily: {
        display: ["var(--font-garamond)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
