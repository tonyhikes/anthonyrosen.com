# Slam hero rollback note

The original “Tired of the fluff? / Hire Tony” homepage, its slam animation,
and the Three.js cotton-ball background were replaced on 2026-08-27.

The complete old implementation remains available in Git commit:

`63b515a410e3a09ac2f6f38bde1dc45fce4f7c60`

To restore it, recover these files from that commit:

- `src/components/Hero.astro`
- `src/components/SlamSection.astro`
- `src/components/ThreeScene.astro`
- `src/components/ThreeSceneFallback.ts`
- `src/workers/three-worker.ts`
- `public/cotton_ball-v1.glb`
- `public/draco/`

The old animation styles are in `src/styles/global.css` and
`tailwind.config.mjs` at the same commit. The old dependency list is preserved
in that commit’s `package.json` and `package-lock.json`.

This note intentionally preserves the recovery path without shipping dormant
animation code or 3D assets in the current website.
