/** @type {import('tailwindcss').Config} */
  export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          brand: {
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
          },
        },
        fontFamily: {
          sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        },
        boxShadow: {
          soft: "0 4px 24px 0 rgba(99,102,241,0.08)",
          card: "0 1px 4px 0 rgba(0,0,0,0.06)",
        },
      },
    },
    plugins: [],
  };