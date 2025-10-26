/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0b1220",
          800: "#111932",
          600: "#1c2742",
        },
        accent: {
          500: "#4f46e5",
          400: "#818cf8",
          300: "#a5b4fc",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      boxShadow: {
        floating: "0 25px 50px -12px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
