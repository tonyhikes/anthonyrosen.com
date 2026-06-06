/// <reference lib="webworker" />

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

let canvas: OffscreenCanvas;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let group: THREE.Group | null = null;

let mouseX = 0;
let mouseY = 0;
let isVisible = true;
let animationFrameId: number | null = null;

function init(offscreenCanvas: OffscreenCanvas, width: number, height: number, isMobile: boolean) {
	canvas = offscreenCanvas;

	// Scene
	scene = new THREE.Scene();

	// Camera
	camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.z = 5;

	// Renderer
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		alpha: true,
		antialias: !isMobile, // Disable antialias on mobile for performance
	});
	renderer.setSize(width, height, false);
	// Limit pixel ratio on mobile to reduce fragment shader cost
	renderer.setPixelRatio(isMobile ? 1.0 : Math.min(2, self.devicePixelRatio || 1));
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

	// Load model
	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("/draco/");
	loader.setDRACOLoader(dracoLoader);

	loader.load(
		"/cotton_ball-v1.glb",
		(gltf) => {
			const model = gltf.scene;

			// Center and scale
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

			// Notify main thread model is loaded
			self.postMessage({ type: "loaded" });

			// Start animation
			animate();
		},
		undefined,
		(error) => {
			console.error("Worker: Error loading model:", error);
		}
	);
}

function animate() {
	if (!isVisible) {
		animationFrameId = null;
		return;
	}

	let isSettled = false;

	if (group) {
		const targetRotY = mouseX * Math.PI;
		const targetRotX = mouseY * 0.5;

		const oldRotY = group.rotation.y;
		const oldRotX = group.rotation.x;

		group.rotation.y += 0.05 * (targetRotY - oldRotY);
		group.rotation.x += 0.05 * (targetRotX - oldRotX);

		const targetPosX = -mouseX * 0.6;
		const targetPosY = mouseY * 0.6;

		const oldPosX = group.position.x;
		const oldPosY = group.position.y;

		group.position.x += 0.05 * (targetPosX - oldPosX);
		group.position.y += 0.05 * (targetPosY - oldPosY);

		// PERFORMANCE OPTIMIZATION: Check if movement is negligible
		// If the object has settled, we can stop the render loop to save CPU/GPU
		const delta = Math.max(
			Math.abs(group.rotation.y - oldRotY),
			Math.abs(group.rotation.x - oldRotX),
			Math.abs(group.position.x - oldPosX),
			Math.abs(group.position.y - oldPosY)
		);

		if (delta < 0.001) {
			isSettled = true;
		}
	}

	renderer.render(scene, camera);

	if (!isSettled || !group) {
		animationFrameId = requestAnimationFrame(animate);
	} else {
		animationFrameId = null;
	}
}

function startAnimation() {
	if (animationFrameId === null && isVisible) {
		animate();
	}
}

function stopAnimation() {
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
}

self.onmessage = (e: MessageEvent) => {
	const { type, data } = e.data;

	switch (type) {
		case "init":
			init(data.canvas, data.width, data.height, data.isMobile);
			break;

		case "mouse":
			mouseX = data.x;
			mouseY = data.y;
			startAnimation();
			break;

		case "resize":
			if (camera && renderer) {
				camera.aspect = data.width / data.height;
				camera.updateProjectionMatrix();
				renderer.setSize(data.width, data.height, false);
				startAnimation();
			}
			break;

		case "visibility":
			isVisible = data.visible;
			if (isVisible) {
				startAnimation();
			} else {
				stopAnimation();
			}
			break;
	}
};
