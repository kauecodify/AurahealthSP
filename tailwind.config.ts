import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#1e3a5f",
        },
        alert: {
          bg: "#fef2f2",
          border: "#fecaca",
          text: "#991b1b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
