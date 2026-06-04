/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      colors: {
        ink: "#1f2933",
        leaf: "#0f766e",
        coral: "#d95f43",
        gold: "#b7791f",
        mist: "#eef4f3"
      }
    }
  },
  plugins: []
};
