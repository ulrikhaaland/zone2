import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        custom: ["Avenir", "Tahoma", "sans-serif"],
      },
      colors: {
        primary: "#c13c1b",
        title: "#486895",
        title2: "#314f6b",
        subtitle: "#364759",
        whitebg: "#ededed",
        blackbg: "#050408",
        card: "#212529",
        "primary-button": "#c13c1b",
        "primary-button-dark": "#476894",
        "secondary-button-dark": "#4262ff",
        "secondary-button": "#e2f1e4",
        "primary-bg": "#ffffff",
        "secondary-bg": "#fafbfc",
        "third-bg": "#616263",
      },
    },
  },
  plugins: [],
};
export default config;
