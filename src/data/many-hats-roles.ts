/**
 * Shared data for the Many Hats redesign directions.
 *
 * Images come from the approved V19 pack: a shared bare portrait, a complete
 * worn portrait per role, and five cap poses (A-E) per role.
 */

export type HatRoleId =
	| "marketing"
	| "product"
	| "projects"
	| "design"
	| "operations";

export type HatRole = {
	id: HatRoleId;
	label: string;
	headline: string;
	/**
	 * The desk hero's statement: the role word (in the hat's color, with
	 * the underline), the rest of the headline, and a short one-sentence
	 * subhead (one length for every screen; no employer names). Write
	 * headlines to fill 3 lines and subheads ~1.5–2.5 lines on desktop.
	 * DRAFT copy: Tony approves every headline and subhead before launch.
	 */
	hero: { word: string; rest: string; sub: string };
	description: string;
	proof: { value: string; label: string };
	details: { label: string; value: string }[];
	cta: { label: string; href: string };
	color: {
		/** Lit fabric color of the cap; also used as a full color field. */
		cap: string;
		/** Accessible text color on light paper (>= 4.5:1). */
		ink: string;
		/** Text color on a field of `cap`. */
		onCap: string;
		/** Very pale wash of the cap color. */
		tint: string;
		/** Page color while this hat is worn: the paper, faintly in the
		 * hat's hue, at the same lightness as the neutral paper. */
		paper: string;
	};
};

export const hatRoles: HatRole[] = [
	{
		id: "marketing",
		label: "Marketing",
		headline: "Marketing that earns attention.",
		hero: { word: "Marketing", rest: "that drives growth.", sub: "Campaigns across digital, email, print, and retail that turn attention into sales." },
		description:
			"Campaigns across digital, email, print, and in-store, built on a clear story and localized for audiences around the world.",
		proof: { value: "$250K", label: "annual marketing budget, managed end to end" },
		details: [
			{ label: "Worn at", value: "ACR Electronics, Kepro" },
			{ label: "Tools", value: "HubSpot, GA4, WordPress" },
			{ label: "Signature", value: "Pfizer campaigns in 25 languages, 88 countries" },
		],
		cta: { label: "See marketing work", href: "#marketing" },
		color: { cap: "#343a4f", ink: "#1f2a47", onCap: "#f1e9d8", tint: "#e9ecf3", paper: "#edeff1" },
	},
	{
		id: "product",
		label: "Product",
		headline: "Products ready for a global launch.",
		hero: { word: "Products", rest: "ready for a global launch.", sub: "Certification, packaging, and localization for launch in 20+ countries." },
		description:
			"FCC and CE certification, packaging, website, and app localization in 20+ countries. The unglamorous work that gets a product out the door.",
		proof: { value: "20+", label: "countries localized for launch" },
		details: [
			{ label: "Worn at", value: "ACR Electronics" },
			{ label: "Tools", value: "Jira, Figma, Workfront" },
			{ label: "Signature", value: "Bivy satellite messenger, certification to shelf" },
		],
		cta: { label: "See product work", href: "#marketing" },
		color: { cap: "#234231", ink: "#1f3d2f", onCap: "#f1e9d8", tint: "#e5ede7", paper: "#ecefe8" },
	},
	{
		id: "projects",
		label: "Projects",
		headline: "Projects that land on time, on budget, on brand.",
		hero: { word: "Projects", rest: "that get the details right.", sub: "Well-planned milestones and clear, proactive updates, so a deadline is never a surprise." },
		description:
			"Cross-functional teams, agencies, and freelancers moving in one direction, with clear owners, honest schedules, and no surprises at the deadline.",
		proof: { value: "30+", label: "healthcare proposals delivered" },
		details: [
			{ label: "Worn at", value: "Kepro, AAAS / Science" },
			{ label: "Tools", value: "Workfront, Jira, Trello" },
			{ label: "Signature", value: "A scheduling system that ended publication delays" },
		],
		cta: { label: "See proposal work", href: "#proposal" },
		color: { cap: "#622330", ink: "#5c1f2a", onCap: "#f1e9d8", tint: "#f2e6e4", paper: "#f3e9e5" },
	},
	{
		id: "operations",
		label: "Operations",
		headline: "Operations that quietly save money.",
		hero: { word: "Operations", rest: "that scale for less.", sub: "Modern tools and lean workflows that run content and publishing at scale, for a fraction of the cost." },
		description:
			"Workflows, vendors, and version control tuned until the work runs itself. Lower costs, with no corners cut.",
		proof: { value: "~$50K", label: "saved every year in print costs" },
		details: [
			{ label: "Worn at", value: "AAAS / Science, ACR Electronics" },
			{ label: "Tools", value: "Workfront, Microsoft 365" },
			{ label: "Signature", value: "8% lower production costs across four time zones" },
		],
		cta: { label: "See how I work", href: "#resume" },
		color: { cap: "#363839", ink: "#2f3133", onCap: "#f1e9d8", tint: "#ebebea", paper: "#efefed" },
	},
	{
		id: "design",
		label: "Design",
		headline: "Design that makes the complex clear.",
		hero: { word: "Design", rest: "that makes the complex clear.", sub: "Ads, social, and the proposals and sales enablement that win deals." },
		description:
			"Layouts, packaging, and proposals built in InDesign, Illustrator, and Figma. Trained in visual communication, sharpened by a decade at Science.",
		proof: { value: "10 yrs", label: "designing and producing at Science Magazine" },
		details: [
			{ label: "Worn at", value: "AAAS / Science, Kepro" },
			{ label: "Tools", value: "InDesign, Illustrator, Figma" },
			{ label: "Signature", value: "A mobile app launch for 30,000+ readers" },
		],
		cta: { label: "See publishing work", href: "#publishing" },
		color: { cap: "#4a304c", ink: "#4a2c4d", onCap: "#f1e9d8", tint: "#efe7ef", paper: "#f2ecf1" },
	},
];

/**
 * Web exports of the approved V19 pack (`public/many-hats/all-poses-v19/`),
 * generated by `scripts/many-hats-web-v19.py`. Every image belongs to one
 * 1254 x 1254 canvas: portraits fill it; cap poses are cropped to their
 * outline and placed back by the offsets below (canvas px).
 */
const DIR = "/many-hats/web-v19";
export const HAT_CANVAS = 1254;

export const hatPortrait = {
	bare: `${DIR}/portrait-bare-1254.webp`,
	bareSrcset: `${DIR}/portrait-bare-800.webp 800w, ${DIR}/portrait-bare-1254.webp 1254w`,
	bareMono: `${DIR}/portrait-bare-mono.webp`,
	alt: "Portrait of Anthony",
	width: HAT_CANVAS,
	height: HAT_CANVAS,
	/** loose hair beyond the cap's outline: faded as a cap presses it down */
	hair: { src: `${DIR}/bare-hair.webp`, box: { x: 295, y: 116, w: 507, h: 213 } },
};

export type HatPose = "A" | "B" | "C" | "D" | "E";

/** Crop boxes of each pose on the shared canvas (same for every role). */
export const hatPoseBoxes: Record<HatPose | "rack", { x: number; y: number; w: number; h: number }> = {
	A: { x: 146, y: 113, w: 800, h: 474 },
	B: { x: 220, y: 113, w: 778, h: 481 },
	C: { x: 248, y: 115, w: 752, h: 497 },
	D: { x: 268, y: 113, w: 727, h: 475 },
	E: { x: 288, y: 111, w: 880, h: 478 },
	/** pose C padded to a square (rack thumbnails) */
	rack: { x: 248, y: -12, w: 752, h: 752 },
};

/** CSS placing a crop on the stage, in % of the canvas. */
export const poseStyle = (box: { x: number; y: number; w: number; h: number }) =>
	`left: ${(box.x / HAT_CANVAS) * 100}%; top: ${(box.y / HAT_CANVAS) * 100}%; width: ${(box.w / HAT_CANVAS) * 100}%;`;

/** Square box where a rack thumbnail sits on the head, in stage %. */
export const hatHeadAnchor = {
	x: `${((hatPoseBoxes.rack.x + hatPoseBoxes.rack.w / 2) / HAT_CANVAS) * 100}%`,
	y: `${((hatPoseBoxes.rack.y + hatPoseBoxes.rack.h / 2) / HAT_CANVAS) * 100}%`,
	size: `${(hatPoseBoxes.rack.w / HAT_CANVAS) * 100}%`,
};

export type HatFraming = "close" | "desk";

/**
 * The V21 at-the-desk framing (`scripts/many-hats-web-desk-v21.py`): the
 * same 1254 canvas, with every close-up image resized to 523px and placed at
 * [418, 68] on the desk photograph. Cap crops are reused at the same
 * transform, so only their boxes change.
 */
const DESK_DIR = "/many-hats/web-desk-v21";
export const HAT_DESK = { scale: 523 / HAT_CANVAS, left: 418, top: 68 };

const toDesk = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => ({
	x: HAT_DESK.left + x * HAT_DESK.scale,
	y: HAT_DESK.top + y * HAT_DESK.scale,
	w: w * HAT_DESK.scale,
	h: h * HAT_DESK.scale,
});

export const hatDeskPortrait = {
	...hatPortrait,
	bare: `${DESK_DIR}/desk-off-1254.webp`,
	bareSrcset: `${DESK_DIR}/desk-off-800.webp 800w, ${DESK_DIR}/desk-off-1000.webp 1000w, ${DESK_DIR}/desk-off-1254.webp 1254w`,
	alt: "Anthony at his desk",
	hair: { src: `${DESK_DIR}/desk-hair.webp`, box: { x: 588, y: 116, w: 164, h: 35 } },
};

/**
 * The brim's shadow on the desk portrait, as pure shade (cropped, desk
 * canvas px). It flies with the arriving cap and fades in just before
 * contact, so the shadow settles with the hat instead of popping in.
 */
export const hatDeskShade = {
	src: `${DESK_DIR}/brim-shade.webp`,
	box: { x: 524, y: 243, w: 311, h: 94 },
};

export const hatDeskPoseBoxes = Object.fromEntries(
	Object.entries(hatPoseBoxes).map(([pose, box]) => [pose, toDesk(box)])
) as typeof hatPoseBoxes;

export const hatAssets = (id: HatRoleId, framing: HatFraming = "close") => ({
	worn: framing === "desk" ? `${DESK_DIR}/${id}-desk-1254.webp` : `${DIR}/${id}-worn-1254.webp`,
	wornSrcset:
		framing === "desk"
			? `${DESK_DIR}/${id}-desk-800.webp 800w, ${DESK_DIR}/${id}-desk-1000.webp 1000w, ${DESK_DIR}/${id}-desk-1254.webp 1254w`
			: `${DIR}/${id}-worn-800.webp 800w, ${DIR}/${id}-worn-1254.webp 1254w`,
	wornMono: `${DIR}/${id}-worn-mono.webp`,
	poses: {
		A: `${DIR}/${id}-a.webp`,
		B: `${DIR}/${id}-b.webp`,
		C: `${DIR}/${id}-c.webp`,
		D: `${DIR}/${id}-d.webp`,
		E: `${DIR}/${id}-e.webp`,
	} as Record<HatPose, string>,
	rack: `${DIR}/${id}-rack.webp`,
});

/** JSON for a component's client script, safe to inline in a <script>. */
export const serializeHatRoles = (framing: HatFraming = "close") =>
	JSON.stringify(
		hatRoles.map((role) => ({ ...role, assets: hatAssets(role.id, framing) }))
	).replace(/</g, "\\u003c");
