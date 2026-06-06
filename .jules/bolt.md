## 2025-05-19 - Three.js On-Demand Rendering
**Learning:** The Three.js worker loop was running continuously (`requestAnimationFrame`) even when static, consuming unnecessary GPU resources. Implemented an "on-demand" loop that stops when movement settles (deltas < 0.001) and restarts on `mousemove`/`resize`.
**Action:** Apply this same pattern to `ThreeSceneFallback.ts` (main thread fallback) in future optimizations to ensure consistent performance across all browsers.
