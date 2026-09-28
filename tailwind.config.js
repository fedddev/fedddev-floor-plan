/** @type {import('tailwindcss').Config} */
// Colors and fonts come from brand/tokens.css (see brand/BRAND.md). The semantic colors switch
// with the dark/light theme; the palette colors are fixed.
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fd: {
          // Semantic (theme-aware)
          bg: "var(--fd-bg)",
          surface: "var(--fd-surface)",
          text: "var(--fd-text)",
          muted: "var(--fd-text-muted)",
          "accent-cool": "var(--fd-accent-cool)",
          "accent-warm-1": "var(--fd-accent-warm-1)",
          "accent-warm-2": "var(--fd-accent-warm-2)",
          link: "var(--fd-link)",
          "link-underline": "var(--fd-link-underline)",
          "button-bg": "var(--fd-button-bg)",
          "button-text": "var(--fd-button-text)",
          // Palette (fixed)
          jungle: "var(--fd-jungle)",
          "jungle-surface": "var(--fd-jungle-surface)",
          frangipani: "var(--fd-frangipani)",
          fern: "var(--fd-fern)",
          mango: "var(--fd-mango)",
          papaya: "var(--fd-papaya)",
          lagoon: "var(--fd-lagoon)",
          hibiscus: "var(--fd-hibiscus)",
          "muted-on-fern": "var(--fd-muted-on-fern)",
        },
      },
      fontFamily: {
        sans: "var(--fd-font-body)",
        display: "var(--fd-font-display)",
        mono: "var(--fd-font-mono)",
        brand: "var(--fd-font-brand)",
      },
    },
  },
  plugins: [],
};
