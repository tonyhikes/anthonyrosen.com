import type Lenis from "lenis";
import type * as THREE from "three";

declare global {
    interface Window {
        lenis?: Lenis;
        heroModel?: THREE.Group;
    }
}

export { };
