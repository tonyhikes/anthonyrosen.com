import type { HatRole, hatAssets } from "../../data/many-hats-roles";

export type ClientHatRole = HatRole & { assets: ReturnType<typeof hatAssets> };

export const readRoles = (root: HTMLElement): ClientHatRole[] => {
	const node = root.querySelector<HTMLScriptElement>("script[data-hat-roles]");
	return node?.textContent ? (JSON.parse(node.textContent) as ClientHatRole[]) : [];
};

export const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `?manyHatsSlow` plays every animation and timer at half speed for review;
 * `?manyHatsSlow=6` slows everything six-fold to inspect individual frames.
 */
const slowParam = new URLSearchParams(window.location.search).get(
	"manyHatsSlow"
);
const tempo =
	slowParam === null ? 1 : Math.min(20, Math.max(1, Number(slowParam) || 2));

export const ms = (value: number) => value * tempo;

const warmed = new Map<string, Promise<void>>();

/** Fetch + decode off the critical frame; safe to call repeatedly. */
export const warm = (src: string): Promise<void> => {
	let pending = warmed.get(src);
	if (!pending) {
		const image = new Image();
		image.decoding = "async";
		image.src = src;
		pending = image.decode().catch(() => undefined);
		warmed.set(src, pending);
	}
	return pending;
};

/** Like `warm`, but lets the browser pick the right candidate from a srcset. */
export const warmSrcset = (srcset: string, sizes: string): Promise<void> => {
	let pending = warmed.get(srcset);
	if (!pending) {
		const image = new Image();
		image.decoding = "async";
		image.sizes = sizes;
		image.srcset = srcset;
		pending = image.decode().catch(() => undefined);
		warmed.set(srcset, pending);
	}
	return pending;
};

/** Point an <img> at a srcset and wait until it can paint without a hitch. */
export const swapSrcset = async (
	image: HTMLImageElement,
	srcset: string,
	src: string
) => {
	if (image.getAttribute("srcset") !== srcset) {
		image.srcset = srcset;
		image.src = src;
	}
	await ready(image);
};

/** Resolve once an <img> has its current src decoded (never rejects). */
export const ready = async (image: HTMLImageElement) => {
	if (!image.complete) {
		await new Promise<void>((resolve) => {
			image.addEventListener("load", () => resolve(), { once: true });
			image.addEventListener("error", () => resolve(), { once: true });
		});
	}
	await image.decode().catch(() => undefined);
};

/** Swap an <img> source and wait until it can paint without a hitch. */
export const swapSource = async (image: HTMLImageElement, src: string) => {
	if (!image.src.endsWith(src)) image.src = src;
	await ready(image);
};

/** Run once when `element` comes within `margin` of the viewport. */
export const whenNear = (
	element: Element,
	callback: () => void,
	margin = "600px 0px"
) => {
	if (!("IntersectionObserver" in window)) {
		setTimeout(callback, 400);
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			observer.disconnect();
			callback();
		},
		{ rootMargin: margin }
	);
	observer.observe(element);
};

/** Cancel every WAAPI animation on the given elements. */
export const cancelAll = (elements: (Element | null | undefined)[]) => {
	for (const element of elements) {
		element?.getAnimations().forEach((animation) => animation.cancel());
	}
};

export const sleep = (duration: number) =>
	new Promise<void>((resolve) => window.setTimeout(resolve, duration));

export const pad2 = (value: number) => String(value).padStart(2, "0");

/**
 * Run `init` for each matching root once, including after Astro client-side
 * navigation.
 */
export const mount = (selector: string, init: (root: HTMLElement) => void) => {
	const run = () => {
		document.querySelectorAll<HTMLElement>(selector).forEach((root) => {
			if (root.dataset.mounted === "true") return;
			root.dataset.mounted = "true";
			init(root);
		});
	};
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run, { once: true });
	} else {
		run();
	}
	document.addEventListener("astro:page-load", run);
};
