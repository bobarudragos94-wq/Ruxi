import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#005dac",
        "primary-container": "#1976d2",
        "primary-fixed": "#d4e3ff",
        "primary-fixed-dim": "#a5c8ff",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#001c3a",
        "on-primary-fixed-variant": "#004786",
        secondary: "#006e1c",
        "secondary-container": "#91f78e",
        "secondary-fixed": "#94f990",
        "secondary-fixed-dim": "#78dc77",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00731e",
        "on-secondary-fixed": "#002204",
        tertiary: "#505e68",
        "tertiary-fixed": "#d6e5ef",
        "on-tertiary-fixed": "#0f1d25",
        background: "#f7f9fb",
        "on-background": "#191c1e",
        surface: "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#414752",
        outline: "#717783",
        "outline-variant": "#c1c6d4",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
