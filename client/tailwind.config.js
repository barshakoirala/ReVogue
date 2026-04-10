import { COLORS, FONTS } from "./src/constants/theme.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "revogue-purple": COLORS.PURPLE,
        "revogue-gold": COLORS.GOLD,
      },
      fontFamily: {
        "revogue-serif": [FONTS.SERIF, "Georgia", "serif"],
        "revogue-script": [FONTS.SCRIPT, "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
