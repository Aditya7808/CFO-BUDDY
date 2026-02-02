import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0A0A0F",
                card: "#12121A",
                green: "#10B981",
                amber: "#F59E0B",
                red: "#EF4444",
            },
        },
    },
    plugins: [],
};

export default config;
