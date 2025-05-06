// tailwind.config.js

import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  // Usar la clase 'dark' en vez de la preferencia del sistema
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Paletas de color
      colors: {
        // Café-Purple original
        "cafe-purple": {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Polkadot-Pink
        "polkadot-pink": {
          50: "#ffe6f1",
          100: "#ffb3d2",
          200: "#ff80b3",
          300: "#ff4d94",
          400: "#ff1a75",
          500: "#E6007A",
          600: "#cc006c",
          700: "#b2005e",
          800: "#99004f",
          900: "#7f0040",
        },
      },
      // Escalas personalizadas para hover/active más suaves
      scale: {
        102: "1.02",
        98: "0.98",
      },
    },
  },
  plugins: [
    typography,
    // aquí puedes añadir otros plugins en el futuro
  ],
};
