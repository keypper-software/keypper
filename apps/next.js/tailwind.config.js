/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "black-001": "#161618",
        "black-bg": "#0d0c0e",
        background: "#161618",
        foreground: "#f5f5f5",
        "muted-foreground": "#999999",
        accent: "#0edbbd",
        "card-bg": "#121214",
        "gray-001": "#383a42",
        "gray-002": "#17181a",
        card: "#161618",
        "card-foreground": "#f5f5f5",
        popover: "#161618",
        "popover-foreground": "#f5f5f5",
        primary: "#0edbbd",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: {
          DEFAULT: "#282828",
          muted: "#19191d",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
