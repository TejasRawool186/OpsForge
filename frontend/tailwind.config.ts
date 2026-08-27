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
        background: "#080c14",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
          subtle: "#131d33",
          border: "#1e293b",
        },
        popover: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#06b6d4", // Neon Cyan
          foreground: "#080c14",
          glow: "rgba(6, 182, 212, 0.4)",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#38bdf8",
          foreground: "#080c14",
        },
        status: {
          critical: "#f43f5e", // Rose
          high: "#f59e0b",     // Amber
          medium: "#eab308",   // Yellow
          low: "#38bdf8",      // Sky
          investigating: "#818cf8", // Indigo
          approval: "#f59e0b", // Amber
          mitigated: "#34d399", // Mint
          resolved: "#10b981", // Emerald
          closed: "#64748b",   // Slate
        },
        border: "#1e293b",
        input: "#1e293b",
        ring: "#06b6d4",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(6, 182, 212, 0.35)",
        "glow-rose": "0 0 20px -5px rgba(244, 63, 94, 0.45)",
        "glow-amber": "0 0 20px -5px rgba(245, 158, 11, 0.45)",
        "glow-emerald": "0 0 20px -5px rgba(16, 185, 129, 0.45)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon": "beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        beacon: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "50%": { transform: "scale(1.3)", opacity: "0.2" },
          "100%": { transform: "scale(0.95)", opacity: "0.8" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        }
      },
    },
  },
  plugins: [],
};
export default config;
