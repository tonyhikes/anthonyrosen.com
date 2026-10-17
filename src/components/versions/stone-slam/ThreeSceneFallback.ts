// Fallback for browsers without OffscreenCanvas support
// This runs the original inline Three.js logic

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const container = document.getElementById("canvas-container");
const canvas = document.getElementById("three-canvas") as HTMLCanvasElement;

if (container && canvas) {
	let isVisible = true;
	let animationFrameId: number | null = null;
	let hasUserInteracted = false;
	let isSlammedOut = false;

	// Scene
	const scene = new THREE.Scene();

	// Camera
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 5;

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		alpha: true,
		antialias: true,
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;

	// Environment
	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	const roomEnv = new RoomEnvironment();
	scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
	pmremGenerator.dispose();

	// Lights
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(5, 5, 5);
	scene.add(directionalLight);

	const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
	backLight.position.set(-5, -5, -5);
	scene.add(backLight);

	// Model
	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("/draco/");
	loader.setDRACOLoader(dracoLoader);

	let group: THREE.Group | null = null;

	loader.load(
		"/cotton_ball-v1.glb",
		(gltf) => {
			const model = gltf.scene;

			const box = new THREE.Box3().setFromObject(model);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());

			const maxDim = Math.max(size.x, size.y, size.z);
			const scale = 4.0 / maxDim;
			model.scale.setScalar(scale);
			model.position.sub(center.multiplyScalar(scale));

			group = new THREE.Group();
			group.add(model);
			scene.add(group);

			container.classList.remove("opacity-0");
			container.classList.add("opacity-100");
			checkAndUpdateVisibility();
		},
		undefined,
		(error) => {
			console.error("Fallback: Error loading model:", error);
		}
	);

	// Mouse
	let mouseX = 0;
	let mouseY = 0;
	let lastMouseTime = 0;
	const halfX = window.innerWidth / 2;
	const halfY = window.innerHeight / 2;

	document.addEventListener(
		"mousemove",
		(e) => {
			hasUserInteracted = true;
			const now = performance.now();
			if (now - lastMouseTime < 16) return;
			lastMouseTime = now;
			mouseX = (e.clientX - halfX) / halfX;
			mouseY = (e.clientY - halfY) / halfY;
		},
		{ passive: true }
	);

	["scroll", "click", "keydown", "touchstart"].forEach((evt) => {
		document.addEventListener(
			evt,
			() => {
				hasUserInteracted = true;
			},
			{ passive: true, once: true }
		);
	});

	function animate() {
		if (!isVisible) {
			animationFrameId = null;
			return;
		}
		animationFrameId = requestAnimationFrame(animate);

		if (group) {
			group.rotation.y += 0.05 * (mouseX * Math.PI - group.rotation.y);
			group.rotation.x += 0.05 * (mouseY * 0.5 - group.rotation.x);
			group.position.x += 0.05 * (-mouseX * 0.6 - group.position.x);
			group.position.y += 0.05 * (mouseY * 0.6 - group.position.y);
		}
		renderer.render(scene, camera);
	}

	function startAnimation() {
		if (animationFrameId === null && isVisible) animate();
	}

	function stopAnimation() {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	}

	function checkAndUpdateVisibility() {
		const shouldBeVisible =
			!document.hidden &&
			!container.classList.contains("opacity-0") &&
			!isSlammedOut;
		if (shouldBeVisible && !isVisible) {
			isVisible = true;
			startAnimation();
		} else if (!shouldBeVisible && isVisible) {
			isVisible = false;
			stopAnimation();
		}
	}

	// Idle timeout
	setTimeout(() => {
		if (!hasUserInteracted) {
			isVisible = false;
			stopAnimation();
		}
	}, 5000);

	// Resize
	let resizeTimeout: ReturnType<typeof setTimeout>;
	window.addEventListener(
		"resize",
		() => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			}, 100);
		},
		{ passive: true }
	);

	// Events
	window.addEventListener("slam-impact", () => {
		container.classList.remove("opacity-100");
		container.classList.add("opacity-0");
		isSlammedOut = true;
		checkAndUpdateVisibility();
	});

	window.addEventListener("slam-reset", () => {
		container.classList.remove("opacity-0");
		container.classList.add("opacity-100");
		isSlammedOut = false;
		hasUserInteracted = true;
		checkAndUpdateVisibility();
	});

	document.addEventListener("visibilitychange", () => {
		checkAndUpdateVisibility();
	});

	window.addEventListener("view-change", (e: Event) => {
		const viewId = (e as CustomEvent).detail;
		if (viewId !== "home") {
			isVisible = false;
			stopAnimation();
			container.classList.remove("opacity-100");
			container.classList.add("opacity-0");
		} else {
			hasUserInteracted = true;
			isSlammedOut = false;
			container.classList.remove("opacity-0");
			container.classList.add("opacity-100");
			checkAndUpdateVisibility();
		}
	});

	// Start
	animate();
}
