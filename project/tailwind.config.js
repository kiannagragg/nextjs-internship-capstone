/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ---- COLORS ---- */
      colors: {
        /* Shadcn design token mappings */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* FLOE brand accent */
        brand: {
          DEFAULT: "hsl(var(--brand))",
          50: "#EEF3FE",
          100: "#D4E1FD",
          200: "#A9C3FB",
          300: "#7EA5F9",
          400: "#5387F8",
          500: "#2D6EF7",
          600: "#0B52E0",
          700: "#083DAA",
          800: "#062973",
          900: "#03143D",
        },

        /* Project / board accent palette */
        project: {
          green: "#A8FF78",
          violet: "#8B5CF6",
          pink: "#EC4899",
          teal: "#14B8A6",
          amber: "#F59E0B",
          terracotta: "#C4714A",
          red: "#EF4444",
          gray: "#6B7280",
        },
      },

      /* ---- FONTS ---- */
      fontFamily: {
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        /* Override default 'sans' to use DM Sans */
        sans: ["var(--font-body)", "sans-serif"],
      },

      /* ---- BORDER RADIUS (Shadcn) ---- */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
