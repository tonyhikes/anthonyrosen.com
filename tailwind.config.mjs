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
			},
		},
	},
	plugins: [preline],
};
