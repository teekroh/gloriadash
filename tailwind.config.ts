import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        /** Sandy clay + shadow grey — primary app palette */
        brand: {
          DEFAULT: "#d4aa7d",
          dark: "#b88a5e",
          ink: "#272727",
          inkLight: "#3a3a3a"
        }
      }
    }
  },
  plugins: []
};

export default config;
