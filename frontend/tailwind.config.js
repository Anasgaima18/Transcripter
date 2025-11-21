/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "SF Pro Display",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
            },
            colors: {
                background: "#050511", // Deep Dark Blue/Black
                foreground: "#F8FAFC",
                primary: {
                    DEFAULT: "#00F0FF", // Neon Cyan
                    foreground: "#050511",
                },
                secondary: {
                    DEFAULT: "#7000FF", // Deep Purple
                    foreground: "#F8FAFC",
                },
                muted: {
                    DEFAULT: "#0A0A23", // Slightly lighter dark blue
                    foreground: "#94A3B8",
                },
                card: {
                    DEFAULT: "#0A0A23",
                    foreground: "#F8FAFC",
                },
                border: "rgba(255, 255, 255, 0.1)",
                input: "rgba(255, 255, 255, 0.05)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
                'neon-purple': '0 0 20px rgba(112, 0, 255, 0.5)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            keyframes: {
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "pulse-glow": {
                    "0%, 100%": { opacity: "1", transform: "scale(1)" },
                    "50%": { opacity: "0.8", transform: "scale(1.05)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.5s ease-out",
                "slide-up": "slide-up 0.6s ease-out",
                "pulse-glow": "pulse-glow 3s infinite ease-in-out",
                "float": "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
}
