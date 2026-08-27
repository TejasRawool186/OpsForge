import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d10",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "#141417",
          foreground: "#f3f4f6",
          subtle: "#18181d",
          border: "#23232a",
        },
        sidebar: {
          DEFAULT: "#0f0f13",
          border: "#1f1f26",
        },
        muted: {
          DEFAULT: "#1e1e24",
          foreground: "#8e8e99",
        },
        border: "#23232a",
        input: "#141417",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 10px 0 rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
