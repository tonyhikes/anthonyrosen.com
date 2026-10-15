/**
 * The Many Hats swap: one hat flies off the head and the next one lands.
 *
 * Works on the markup rendered by `HatStage.astro` (`data-hat-*`): the worn
 * photograph at rest; in flight, the shared hat-off frame, the loose hair
 * above the crown, the brim's shadow (desk framing) and the cap poses
 * A → B → C arriving / C → D → E leaving. The motion is the approved one
 * (same as the Masthead direction, which keeps its own copy):
 *
 * - every pose and image is decoded before the old hat lifts, so a swap
 *   never stalls mid-air and every hat flies on the same clock;
 * - poses cut exactly (a hat is never see-through), switching by distance
 *   from the head;
 * - lift-off and landing "settle" over the worn photograph instead of
 *   cutting to it (brim edge, brim shadow, hair the cap presses down);
 * - all layers are opaque across the head, so type behind never shows.
 *
 * The page's own UI (headline, colors, controls) joins in through the
 * `onLift` / `onLaunch` hooks of `toss`.
 */
import {
	cancelAll,
	ms,
	ready,
	sleep,
	swapSource,
	swapSrcset,
	warm,
	warmSrcset,
	type ClientHatRole,
} from "./shared";

export type Pose = "A" | "B" | "C" | "D" | "E";
type Box = { x: number; y: number; w: number; h: number };

export type FlightTiming = {
	/** ms from lift-off until the old hat is gone */
	exitDuration: number;
	/** ms from launch until the new hat touches down */
	entryDuration: number;
	/** ms after lift-off at which the new hat launches */
	entryStart: number;
	/** ms after lift-off at which the new hat touches down */
	landAt: number;
	/** scale a design-time duration (ms) to the current tempo */
	pace: (value: number) => number;
};

export type TossHooks = {
	/** The old hat starts to lift. Return the UI animations to wait for. */
	onLift?: (timing: FlightTiming) => Animation[];
	/** The new hat launches (it lands `entryDuration` ms later). */
	onLaunch?: (timing: FlightTiming) => Animation[];
};

const CANVAS = 1254;
const STEPS = 40;
/** The whole swap plays 20% faster than the first V19 pass. */
const PACE = 0.8;

/**
 * The approved V13 flight shape, in canvas px: x grows with d², y follows a
 * quarter sine of the distance d from the head. d is eased in time:
 * arriving d = (1 - t)^1.4 (fast from off-screen, a light brake onto the
 * head), leaving d = t^1.5 (eases off the head, then accelerates away).
 */
const ARRIVE_EASE = 1.4;
const LEAVE_EASE = 1.5;
const distance = (t: number, arriving: boolean) =>
	arriving ? Math.pow(1 - t, ARRIVE_EASE) : Math.pow(t, LEAVE_EASE);
/** progress t at which the flight reaches distance d */
const progressAt = (d: number, arriving: boolean) =>
	arriving ? 1 - Math.pow(d, 1 / ARRIVE_EASE) : Math.pow(d, 1 / LEAVE_EASE);

/** Worn photograph easing in after contact / out before lift-off (ms). */
const SETTLE_IN = 95;
const SETTLE_OUT = 160;
/** Distance from the head within which loose hair flattens / springs up. */
const HAIR_REACH = 0.22;
/** Distance from the head within which the brim's shadow fades. */
const SHADE_REACH = 0.15;

/** Pose by distance from the head (arriving turns forward early). */
const POSE_BANDS: Record<string, [number, number]> = {
	A: [0.72, Infinity],
	B: [0.45, 0.72],
	arriveC: [0, 0.45],
	leaveC: [0, 0.29],
	D: [0.29, 0.5],
	E: [0.5, Infinity],
};

const flightPath = (arriving: boolean, reach: number, scale: number, lift: number) => {
	const frames: Keyframe[] = [];
	for (let i = 0; i <= STEPS; i += 1) {
		const d = distance(i / STEPS, arriving);
		const x = (arriving ? -1 : 1) * reach * d * d * scale;
		const y = -lift * Math.sin((Math.min(d, 1) * Math.PI) / 2) * scale;
		frames.push({ transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` });
	}
	return frames;
};

/** Exact on/off cuts for a pose (never a fade). */
const poseVisibility = (pose: Pose, arriving: boolean): Keyframe[] => {
	const [near, far] = POSE_BANDS[pose === "C" ? (arriving ? "arriveC" : "leaveC") : pose];
	const a = progressAt(Math.min(far, 1), arriving);
	const b = progressAt(near, arriving);
	const from = Math.max(0, Math.min(a, b));
	const to = Math.min(1, Math.max(a, b));
	const frames: Keyframe[] = [];
	const add = (offset: number, opacity: number) => frames.push({ offset, opacity });
	add(0, from <= 0 ? 1 : 0);
	if (from > 0) {
		add(from, 0);
		add(from, 1);
	}
	if (to < 1) {
		add(to, 1);
		add(to, 0);
	}
	add(1, to >= 1 ? 1 : 0);
	return frames;
};

export const createHatStage = (root: HTMLElement) => {
	const find = <T extends Element>(selector: string) => root.querySelector<T>(selector);
	const stage = find<HTMLElement>("[data-hat-stage]") as HTMLElement;
	const bare = find<HTMLImageElement>("[data-hat-bare]") as HTMLImageElement;
	const worn = find<HTMLImageElement>("[data-hat-worn]") as HTMLImageElement;
	const hair = find<HTMLImageElement>("[data-hat-hair]") as HTMLImageElement;
	const shade = find<HTMLImageElement>("[data-hat-shade]");
	const shadeClip = find<HTMLElement>("[data-hat-shade-clip]");
	const sizes = stage.dataset.sizes ?? "";
	const boxes = JSON.parse(stage.dataset.boxes ?? "{}") as Record<Pose, Box>;
	// the desk framing draws the head smaller on the same canvas: the arc and
	// minimum reach shrink with it, so the flight keeps its shape
	const headScale = Number(stage.dataset.headScale) || 1;
	const LIFT = 340 * headScale;
	const FLOOR = 1550 * headScale;
	const sprites = (set: "exit" | "entry") =>
		Array.from(stage.querySelectorAll<HTMLImageElement>(`[data-hat-flight="${set}"]`)).map(
			(image) => ({ image, pose: image.dataset.pose as Pose })
		);
	const leaving = sprites("exit");
	const arriving = sprites("entry");
	const pace = (value: number) => ms(value * PACE);

	const fly = (
		set: { image: HTMLImageElement; pose: Pose }[],
		inbound: boolean,
		reach: number,
		scale: number,
		duration: number
	) =>
		set.flatMap(({ image, pose }) => [
			image.animate(flightPath(inbound, reach, scale, LIFT), { duration, fill: "forwards" }),
			image.animate(poseVisibility(pose, inbound), { duration, fill: "forwards" }),
		]);

	/** Loose hair above the crown springs up as a cap lifts and flattens as
	 * the next one comes down (never pokes out above it). */
	const fadeHair = (inbound: boolean, duration: number) => {
		const at = progressAt(HAIR_REACH, inbound);
		const frames: Keyframe[] = inbound
			? [{ opacity: 1 }, { opacity: 1, offset: at, easing: "cubic-bezier(.4,0,.6,1)" }, { opacity: 0 }]
			: [{ opacity: 0, easing: "cubic-bezier(.4,0,.6,1)" }, { opacity: 1, offset: at }, { opacity: 1 }];
		return [hair.animate(frames, { duration, fill: "forwards" })];
	};

	/** The brim's shadow rides with the cap and is on the face only for the
	 * last stretch of distance. */
	const flyShade = (inbound: boolean, reach: number, scale: number, duration: number) => {
		if (!shade) return [];
		const at = progressAt(SHADE_REACH, inbound);
		const opacity: Keyframe[] = inbound
			? [{ opacity: 0 }, { opacity: 0, offset: at, easing: "cubic-bezier(.3,0,.5,1)" }, { opacity: 1 }]
			: [{ opacity: 1, easing: "cubic-bezier(.5,0,.7,1)" }, { opacity: 0, offset: at }, { opacity: 0 }];
		return [
			shade.animate(flightPath(inbound, reach, scale, LIFT), { duration, fill: "forwards" }),
			shade.animate(opacity, { duration, fill: "forwards" }),
		];
	};

	/** The hat-off layers, loaded on first need (not with the page). */
	const loadBare = () =>
		Promise.all([
			(bare.getAttribute("srcset")
				? ready(bare)
				: swapSrcset(bare, bare.dataset.srcset ?? "", bare.dataset.src ?? "")
			).then(() => {
				// the brim's shadow is clipped to the hat-off silhouette: reuse
				// the very file the browser picked, so nothing loads twice
				if (shadeClip && !shadeClip.style.getPropertyValue("--mask")) {
					shadeClip.style.setProperty("--mask", `url("${bare.currentSrc}")`);
				}
			}),
			swapSource(hair, hair.dataset.src ?? ""),
			shade ? swapSource(shade, shade.dataset.src ?? "") : undefined,
		]);

	const warmRole = (role: ClientHatRole) =>
		Promise.all([
			warmSrcset(role.assets.wornSrcset, sizes),
			...(["A", "B", "C", "D", "E"] as Pose[]).map((pose) => warm(role.assets.poses[pose])),
		]);

	/** Canvas px the hat must travel, each way, to clear the section. */
	const reachFor = () => {
		const box = stage.getBoundingClientRect();
		const bounds = root.getBoundingClientRect();
		const scale = box.width / CANVAS;
		if (scale <= 0) return { scale: 0, out: FLOOR, in: FLOOR };
		const right = (bounds.right - box.left) / scale - boxes.E.x + 24;
		const left = boxes.A.x + boxes.A.w + (box.left - bounds.left) / scale + 24;
		return { scale, out: Math.max(FLOOR, right), in: Math.max(FLOOR, left) };
	};

	/** Jump straight to a role (reduced motion, or recovering). */
	const showInstantly = async (to: ClientHatRole) => {
		cancelAll([...leaving, ...arriving].map(({ image }) => image));
		cancelAll([shade, hair, worn, bare]);
		await swapSrcset(worn, to.assets.wornSrcset, to.assets.worn);
		worn.style.opacity = "1";
		bare.style.opacity = "0";
		stage.classList.remove("is-flying");
	};

	const toss = async (from: ClientHatRole, to: ClientHatRole, hooks: TossHooks = {}) => {
		await Promise.all([
			loadBare(),
			...leaving.map(({ image, pose }) => swapSource(image, from.assets.poses[pose])),
			...arriving.map(({ image, pose }) => swapSource(image, to.assets.poses[pose])),
			// the worn <img> still shows the old hat: decode the next one
			// off-screen so the swap below is instant
			warmSrcset(to.assets.wornSrcset, sizes),
		]);
		stage.classList.add("is-flying");

		const { scale, out, in: reachIn } = reachFor();
		const exitDuration = pace(700);
		const entryDuration = pace(760);
		const entryStart = exitDuration * 0.55;
		const timing: FlightTiming = {
			exitDuration,
			entryDuration,
			entryStart,
			landAt: entryStart + entryDuration,
			pace,
		};

		// Hat off: pose C and the brim's shadow take over exactly where the
		// worn cap sits, the worn photograph eases out over them, then the
		// hat lifts.
		const leavingC = leaving.find(({ pose }) => pose === "C")?.image;
		const fadeIn = [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }];
		const unsettle = [
			worn.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], {
				duration: pace(SETTLE_OUT),
				easing: "cubic-bezier(.4,0,.6,1)",
				fill: "forwards",
			}),
			bare.animate(fadeIn, { duration: pace(SETTLE_OUT), fill: "forwards" }),
			...[leavingC, shade].map((image) =>
				image?.animate(fadeIn, { duration: pace(SETTLE_OUT), fill: "forwards" })
			),
		];
		await unsettle[0].finished;
		bare.style.opacity = "1";
		worn.style.opacity = "0";
		unsettle.forEach((animation) => animation?.cancel());

		// Hold `finished` promises as they are created: cancel() swaps in a
		// new one that never settles.
		const exitAnimations = [
			...fly(leaving, false, out, scale, exitDuration),
			...flyShade(false, out, scale, exitDuration),
			...fadeHair(false, exitDuration),
			...(hooks.onLift?.(timing) ?? []),
		];
		const exitDone = Promise.all(exitAnimations.map((animation) => animation.finished));

		// hidden since the lift: swap the worn photograph to the next hat
		const landedArt = swapSrcset(worn, to.assets.wornSrcset, to.assets.worn);
		await Promise.all([sleep(entryStart), landedArt]);
		const arrival = fly(arriving, true, reachIn, scale, entryDuration);
		const entryAnimations = [
			...arrival,
			...flyShade(true, reachIn, scale, entryDuration),
			...fadeHair(true, entryDuration),
			...(hooks.onLaunch?.(timing) ?? []),
		];
		const entryDone = Promise.all(entryAnimations.map((animation) => animation.finished));

		// Contact: the worn photograph eases in over pose C, then the flying
		// cap and the hat-off frame ease away beneath it.
		await Promise.all(arrival.map((animation) => animation.finished));
		const arrivedC = arriving.find(({ pose }) => pose === "C")?.image;
		const fadeOut = [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }];
		const settle = [
			worn.animate([{ opacity: 0 }, { opacity: 1, offset: 0.6 }, { opacity: 1 }], {
				duration: pace(SETTLE_IN),
				easing: "cubic-bezier(.3,0,.3,1)",
				fill: "forwards",
			}),
			bare.animate(fadeOut, { duration: pace(SETTLE_IN), fill: "forwards" }),
			arrivedC?.animate(fadeOut, { duration: pace(SETTLE_IN), fill: "forwards" }),
		];
		await settle[0].finished;
		worn.style.opacity = "1";
		bare.style.opacity = "0";
		settle.forEach((animation) => animation?.cancel());
		cancelAll(arriving.map(({ image }) => image));

		await Promise.all([exitDone, entryDone]);
		cancelAll([...leaving.map(({ image }) => image), shade, hair]);
		stage.classList.remove("is-flying");
	};

	return { stage, pace, loadBare, warmRole, toss, showInstantly };
};
