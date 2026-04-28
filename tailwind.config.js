/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: "#FF9900",
          "orange-dark": "#e47911",
          navy: "#131921",
          "navy-light": "#232f3e",
          blue: "#007185",
          "blue-light": "#008296",
          yellow: "#FEBD69",
          "yellow-light": "#f3a847",
          green: "#067D62",
          red: "#CC0C39",
          star: "#FFA41C",
          text: "#0F1111",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
