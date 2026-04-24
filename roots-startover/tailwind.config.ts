import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skyTop: "#d4e4d8",
        skyBottom: "#e8e0c8",
        grass: "#6b8e4e",
        grassDark: "#4a6b35",
        soilTop: "#8b6f47",
        soilMid: "#5c4530",
        soilDeep: "#3d2e1f",
        bark: "#5c3d28",
        barkLight: "#7a5338",
        leaf: "#6b8e4e",
        leafAutumn: "#c47b2a",
        cream: "#fdfcf7",
        ink: "#2b2b2b",
        sepia: "#8b6f47",
        paper: "#f4ede0"
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
        body: ["var(--font-nunito)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
