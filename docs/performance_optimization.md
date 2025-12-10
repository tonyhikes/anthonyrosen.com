# Performance Optimization Documentation

## Results Achieved

- **Desktop PageSpeed**: 100 ✅
- **Mobile PageSpeed**: 96 ✅

## Key Optimizations

### 1. Web Worker + OffscreenCanvas for Three.js

The 3D cotton ball animation runs entirely off the main thread using a Web Worker with OffscreenCanvas.

**Files:**

- `src/workers/three-worker.ts` — Contains all Three.js logic (scene, renderer, animation loop)
- `src/components/ThreeScene.astro` — Transfers canvas to worker, handles events
- `src/components/ThreeSceneFallback.ts` — Fallback for browsers without OffscreenCanvas support (~7% of users)

**How it works:**

1. Main thread creates a `<canvas>` element
2. Canvas is transferred to Web Worker via `transferControlToOffscreen()`
3. Worker loads Three.js, Draco decoder, and GLB model
4. Animation runs entirely in worker thread
5. Main thread only sends mouse position and visibility events via `postMessage()`

**Impact:** Total Blocking Time (TBT) dropped from 6,520ms → near 0

### 2. Draco Compression

- Original: `cotton_ball.glb` (2.0 MB)
- Compressed: `cotton_ball-v1.glb` (205 KB)
- Decoder files served locally from `/public/draco/`

### 3. Deferred Lenis (Smooth Scroll)

Lenis initialization is wrapped in `requestIdleCallback` to prevent blocking the main thread.

**Location:** `src/layouts/Layout.astro`

### 4. Idle Timeout for Lighthouse

Both Three.js and Lenis stop after 5 seconds of no user interaction, allowing Lighthouse to complete its analysis.

## Architecture Overview

```
Main Thread                          Web Worker
────────────                         ───────────
ThreeScene.astro                     three-worker.ts
    │                                     │
    ├─ Create <canvas>                    │
    ├─ transferControlToOffscreen() ─────►│
    │                                     ├─ Initialize Three.js
    ├─ postMessage(mouse) ───────────────►├─ Load GLB via DRACOLoader
    ├─ postMessage(visibility) ──────────►├─ Animation loop
    │                                     │
    ◄────────────────────────────────────┤ postMessage("loaded")
    │ (fade in canvas)                    │
```

## Browser Support

- OffscreenCanvas: 93%+ browsers
- Fallback uses inline Three.js (same as before optimization)

## Files Changed

| File                                   | Change                                         |
| -------------------------------------- | ---------------------------------------------- |
| `src/workers/three-worker.ts`          | NEW - Web Worker for Three.js                  |
| `src/components/ThreeScene.astro`      | Rewritten to use worker                        |
| `src/components/ThreeSceneFallback.ts` | NEW - Fallback for old browsers                |
| `src/layouts/Layout.astro`             | Deferred Lenis, removed GLB preload            |
| `public/draco/*`                       | Draco decoder files (copied from node_modules) |
| `public/cotton_ball-v1.glb`            | Draco-compressed 3D model                      |

## Maintenance Notes

- If updating Three.js, also update the Draco decoders in `/public/draco/`
- The worker must use the same Three.js version as node_modules
- OffscreenCanvas doesn't support all Three.js features (e.g., some post-processing) — not an issue for this project
