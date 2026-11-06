// The homepage designs this site has shipped over time. Shared by the
// /versions gallery and the version switcher shown on archived previews so the
// list stays in one place. First entry is the current live homepage; the rest
// are archived, reconstructed previews.

export type SiteVersion = {
	/** Stable key used to mark the current version in the switcher. */
	key: string;
	/** Chronological version number: v1 is the oldest, the highest is current. */
	version: number;
	name: string;
	status: "live" | "archived";
	era: string;
	href: string;
	thumb: string;
	blurb: string;
};

// Listed newest-first (the live design first) for the gallery; `version` gives
// the chronological number (v1 = oldest).
export const siteVersions: SiteVersion[] = [
	{
		key: "many-hats-desk",
		version: 3,
		name: "Many Hats Desk",
		status: "live",
		era: "2025 – present",
		href: "/",
		thumb: "/version-thumbs/many-hats-desk.png",
		blurb:
			"The current homepage: a statement whose role word, underline and color switch with each hat, beside Anthony at his desk and a glass hat dock.",
	},
	{
		key: "hi-im-anthony",
		version: 2,
		name: "Hi, I'm Anthony",
		status: "archived",
		era: "earlier 2025",
		href: "/versions/hi-im-anthony",
		thumb: "/version-thumbs/hi-im-anthony.png",
		blurb:
			"A quiet serif greeting with a waving hand — “Hi. I’m Anthony.” — that ran for a while before the desk hero.",
	},
	{
		key: "stone-slam",
		version: 1,
		name: "Stone Slam",
		status: "archived",
		era: "2024 – early 2025",
		href: "/versions/stone-slam",
		thumb: "/version-thumbs/stone-slam.png",
		blurb:
			"The “Tired of the fluff?” hero with a fixed 3D cotton-ball scene and a headline that slams into place as you scroll.",
	},
];

/** Versions oldest → newest (v1, v2, …), for timeline-style lists. */
export const siteVersionsByNumber: SiteVersion[] = [...siteVersions].sort(
	(a, b) => a.version - b.version
);
