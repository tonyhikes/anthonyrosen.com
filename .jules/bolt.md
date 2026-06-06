## 2025-05-18 - [On-Demand Rendering for Three.js]
**Learning:** Continuous `requestAnimationFrame` loops for interactive 3D backgrounds waste significant CPU/GPU resources when the scene is static. By calculating the delta of movement and stopping the loop when "settled" (delta < 0.001), we can drastically reduce resource usage without affecting UX.
**Action:** Always implement a "settled" check and stop/restart logic for interactive animations that settle into a static state.
