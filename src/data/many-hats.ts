export type HatRole = {
	id: "marketing";
	label: string;
	headline: string;
	description: string;
	cta: string;
	accent: string;
	ink: string;
	wash: string;
	enterHatSrc: string;
	prelandHatSrc: string;
	exitHatSrc: string;
	wornPatchSrc: string;
	hatAlt: string;
	headAnchor: {
		x: string;
		y: string;
		size: string;
	};
};

export const manyHatsPortrait = {
	src: "/many-hats/final3.webp",
	alt: "Anthony seated at a desk with a laptop and notepad",
};

/**
 * The worn patch and bare portrait share a 1024 x 1535 photo-space canvas.
 * The head anchor is measured once from the approved fitted-cap render.
 */
export const manyHatsRoles: HatRole[] = [
	{
		id: "marketing",
		label: "Marketing",
		headline: "Marketing that earns attention.",
		description:
			"Clarify your story, reach the right audience, and turn interest into measurable growth.",
		cta: "Explore Marketing",
		accent: "#163b70",
		ink: "#10233e",
		wash: "#edf3fb",
		enterHatSrc: "/many-hats/marketing-enter.webp",
		prelandHatSrc: "/many-hats/marketing-preland.webp",
		exitHatSrc: "/many-hats/marketing-exit.webp",
		wornPatchSrc: "/many-hats/marketing-worn-patch.webp",
		hatAlt: "Blank navy cotton-twill cap",
		headAnchor: {
			x: "55.9%",
			y: "17.85%",
			size: "21.8%",
		},
	},
];
