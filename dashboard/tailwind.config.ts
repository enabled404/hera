import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: "#050507",
          900: "#09090b",
          850: "#0e0e13",
          800: "#13131a",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "beacon-ping": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "70%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "glow-cyan": {
          "0%, 100%": { filter: "drop-shadow(0 0 12px rgba(6,182,212,0.4))" },
          "50%": { filter: "drop-shadow(0 0 24px rgba(6,182,212,0.7))" },
        },
        "enter-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "beacon-ping": "beacon-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "glow-cyan": "glow-cyan 4s ease-in-out infinite",
        "enter-down": "enter-down 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
