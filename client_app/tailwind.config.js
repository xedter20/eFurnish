/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        base: "#BA8A5B",
        "base-light": "#D8BDA2",
        "base-dark": "#7B5733",
        accent: "#5A8ABA",

        charcoal: "#3a3a3a",
        cream: "#f9f1e7",
        keppel: "#2ec1ac",
        lightCoral: "#e97171",
        lightGray: "#f4f5f7",
        grayStone: "#b0b0b0",
        steelGray: "#898989",
        cadetGray: "#9f9f9f",
        paleGray: "#D9D9D9",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        Montserrat: ["Montserrat", "sans-serif"],
        Poppins: ["Poppins", "sans-serif"],
      },
      backgroundClip: {
        text: "text",
      },
      textFillColor: {
        transparent: "transparent",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("daisyui"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".gradient-text": {
          "background-image":
            "linear-gradient(to right, #ffffff, #cacaca, #b88e2f)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
    require("tailwindcss-animate"),
  ],
};
