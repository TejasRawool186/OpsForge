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
          active: "#201828",
          border: "#1f1f26",
        },
        popover: {
          DEFAULT: "#141417",
          foreground: "#f3f4f6",
        },
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#0d0d10",
        },
        secondary: {
          DEFAULT: "#1e1e24",
          foreground: "#9ca3af",
        },
        muted: {
          DEFAULT: "#18181d",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#262630",
          foreground: "#f3f4f6",
        },
        border: "#23232a",
        input: "#18181d",
        ring: "#6366f1",
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
        glow: "0 0 20px -5px rgba(168, 85, 247, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
