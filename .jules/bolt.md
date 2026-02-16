## 2026-02-16 - Scroll Event Throttling
**Learning:** High-frequency event listeners (like `scroll` and `resize`) in Astro components can cause layout thrashing if they perform DOM queries or calculations on every tick.
**Action:** Always throttle these listeners using `requestAnimationFrame` with a `ticking` flag, and cache DOM element references outside the handler to improve performance.
