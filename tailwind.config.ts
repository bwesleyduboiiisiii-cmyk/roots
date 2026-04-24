import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f4ede0",
        polaroid: "#fdfcf7",
        ink: "#2b2b2b",
        sepia: "#8b6f47",
      },
      fontFamily: {
        handwritten: ['"Caveat"', "cursive"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Nunito"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        polaroid: "0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
        "polaroid-hover": "0 12px 28px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
