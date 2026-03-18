import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-light": "var(--surface-light)",
        "foreground-muted": "var(--foreground-muted)",
        muted: "var(--muted)",
        border: "var(--border)",
        sale: "var(--sale)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        "accent-dark": "var(--accent-dark)",
        success: "var(--success)",
        warning: "var(--warning)",
        highlight: "var(--highlight)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["4rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        "heading-lg": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "600" }],
        "heading": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "heading-sm": ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],
        "overline": ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      screens: {
        sm: "640px",
        md: "750px",
        lg: "990px",
        xl: "1280px",
      },
      borderRadius: {
        "premium": "12px",
        "premium-lg": "16px",
        "premium-xl": "20px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(45,42,38,0.06), 0 1px 2px rgba(45,42,38,0.04)",
        "card-hover": "0 8px 25px rgba(45,42,38,0.08), 0 2px 8px rgba(45,42,38,0.04)",
        "elevated": "0 4px 15px rgba(45,42,38,0.07), 0 1px 4px rgba(45,42,38,0.04)",
        "modal": "0 20px 60px rgba(45,42,38,0.15), 0 4px 20px rgba(45,42,38,0.08)",
        "soft": "0 2px 8px rgba(45,42,38,0.05)",
        "inner-soft": "inset 0 1px 3px rgba(45,42,38,0.06)",
      },
      spacing: {
        "section": "5rem",
        "section-lg": "7rem",
        "section-sm": "3rem",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        "300": "300ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        "premium": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        marquee: "marquee 30s linear infinite",
        "scale-in": "scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};
export default config;
