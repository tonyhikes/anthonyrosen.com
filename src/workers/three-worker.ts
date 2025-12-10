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

function init(offscreenCanvas: OffscreenCanvas, width: number, height: number) {
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
		antialias: true,
	});
	renderer.setSize(width, height, false);
	renderer.setPixelRatio(Math.min(2, self.devicePixelRatio || 1));
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

	animationFrameId = requestAnimationFrame(animate);

	if (group) {
		const targetRotY = mouseX * Math.PI;
		const targetRotX = mouseY * 0.5;

		group.rotation.y += 0.05 * (targetRotY - group.rotation.y);
		group.rotation.x += 0.05 * (targetRotX - group.rotation.x);

		const targetPosX = -mouseX * 0.6;
		const targetPosY = mouseY * 0.6;

		group.position.x += 0.05 * (targetPosX - group.position.x);
		group.position.y += 0.05 * (targetPosY - group.position.y);
	}

	renderer.render(scene, camera);
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
			init(data.canvas, data.width, data.height);
			break;

		case "mouse":
			mouseX = data.x;
			mouseY = data.y;
			break;

		case "resize":
			if (camera && renderer) {
				camera.aspect = data.width / data.height;
				camera.updateProjectionMatrix();
				renderer.setSize(data.width, data.height, false);
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
