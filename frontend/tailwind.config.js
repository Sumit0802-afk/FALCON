/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', '"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ['"Plus Jakarta Sans"', '"Inter"', '"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ['"Plus Jakarta Sans"', '"Inter"', '"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ['"Plus Jakarta Sans"', '"Inter"', '"DM Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        premium: {
          main:    "#000000",
          "950":   "#05070A",
          "900":   "#080B10",
          card:    "#0D1117",
          raised:  "#111827",
        },
        accent: {
          DEFAULT: "#2F81FF",
          cyan:    "#22D3EE",
          soft:    "#4DA3FF",
        },
      },
    },
  },
  plugins: [],
};
