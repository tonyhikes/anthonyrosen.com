/** @type {import('tailwindcss').Config} */
import preline from "preline/plugin";

export default {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"./node_modules/preline/preline.js",
	],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
			},
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				slam: "slam 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
			},
			keyframes: {
				slam: {
					"0%": { transform: "scale(3)", opacity: "0" },
					"50%": { opacity: "1", transform: "scale(0.95)" },
					"75%": { transform: "scale(1.05)" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
			},
		},
	},
	plugins: [preline],
};
