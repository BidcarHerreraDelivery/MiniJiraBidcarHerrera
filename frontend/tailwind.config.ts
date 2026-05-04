import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    /* ─── Border radius — design system values ──────────────────────────────── */
    borderRadius: {
      none:    '0',
      sm:      '0.25rem',  // 4px  — checkboxes, micro-elementos
      DEFAULT: '0.5rem',   // 8px  — botones, inputs, tarjetas
      md:      '0.75rem',  // 12px — columnas Kanban, widgets
      lg:      '1rem',     // 16px — contenedores principales
      xl:      '1.5rem',   // 24px — modales
      full:    '9999px',   // avatares, pills
    },
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      /* ─── Design system color tokens ──────────────────────────────────────── */
      colors: {
        /* Shadcn/Radix UI compatibility — referenced by generated components */
        border:      "var(--border)",
        input:       "var(--input)",
        ring:        "var(--ring)",
        background:  "var(--background)",
        foreground:  "var(--on-surface)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        /* ── Surfaces ─────────────────────────────────────────────────────── */
        surface:                   "var(--surface)",
        "surface-dim":             "var(--surface-dim)",
        "surface-bright":          "var(--surface-bright)",
        "surface-container-lowest":"var(--surface-container-lowest)",
        "surface-container-low":   "var(--surface-container-low)",
        "surface-container":       "var(--surface-container)",
        "surface-container-high":  "var(--surface-container-high)",
        "surface-container-highest":"var(--surface-container-highest)",
        "surface-tint":            "var(--surface-tint)",
        "surface-variant":         "var(--surface-variant)",

        /* ── On-surface / text ────────────────────────────────────────────── */
        "on-surface":         "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-background":      "var(--on-background)",

        /* ── Inverse ──────────────────────────────────────────────────────── */
        "inverse-surface":    "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "inverse-primary":    "var(--inverse-primary)",

        /* ── Outlines ─────────────────────────────────────────────────────── */
        outline:          "var(--outline)",
        "outline-variant": "var(--outline-variant)",

        /* ── Primary ──────────────────────────────────────────────────────── */
        primary: {
          DEFAULT:   "var(--primary)",
          foreground:"var(--on-primary)",
          container: "var(--primary-container)",
        },
        "on-primary":           "var(--on-primary)",
        "primary-container":    "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "primary-fixed":        "var(--primary-fixed)",
        "primary-fixed-dim":    "var(--primary-fixed-dim)",
        "on-primary-fixed":     "var(--on-primary-fixed)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",

        /* ── Secondary ────────────────────────────────────────────────────── */
        secondary: {
          DEFAULT:   "var(--secondary)",
          foreground:"var(--on-secondary)",
          container: "var(--secondary-container)",
        },
        "on-secondary":           "var(--on-secondary)",
        "secondary-container":    "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        "secondary-fixed":        "var(--secondary-fixed)",
        "secondary-fixed-dim":    "var(--secondary-fixed-dim)",
        "on-secondary-fixed":     "var(--on-secondary-fixed)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",

        /* ── Tertiary ─────────────────────────────────────────────────────── */
        tertiary:                 "var(--tertiary)",
        "on-tertiary":            "var(--on-tertiary)",
        "tertiary-container":     "var(--tertiary-container)",
        "on-tertiary-container":  "var(--on-tertiary-container)",
        "tertiary-fixed":         "var(--tertiary-fixed)",
        "tertiary-fixed-dim":     "var(--tertiary-fixed-dim)",
        "on-tertiary-fixed":      "var(--on-tertiary-fixed)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",

        /* ── Error ────────────────────────────────────────────────────────── */
        error:              "var(--error)",
        "on-error":         "var(--on-error)",
        "error-container":  "var(--error-container)",
        "on-error-container":"var(--on-error-container)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
