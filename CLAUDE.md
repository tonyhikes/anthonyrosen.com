# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tony Rosen's portfolio website - a single-page application built with Astro, featuring a 3D Three.js hero background, smooth scrolling with Lenis, and comprehensive analytics integration.

**Tech Stack:**
- **Framework:** Astro 5 with React integration
- **Styling:** Tailwind CSS 4 (with Preline UI plugin)
- **3D Graphics:** Three.js (runs in Web Worker via OffscreenCanvas)
- **Animations:** Anime.js + custom CSS animations
- **Smooth Scroll:** Lenis
- **Analytics:** PostHog, Google Analytics 4, LinkedIn Insight Tag, RB2B
- **Performance:** Partytown (for offloading analytics to Web Workers)

## Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321

# Build & Deploy
npm run build            # Build production site to ./dist/
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint (uses legacy flat config)
npm run format           # Format code with Prettier

# Astro CLI
npm run astro ...        # Run Astro CLI commands
npm run astro -- --help  # Get help with Astro CLI
```

## Architecture

### View Switching System

This is a **single-page application** with client-side view switching (not Astro's built-in routing). All content lives on one page (`/`) and switches views via hash URLs:

- `/` or `/#home` - Home view (Hero + SlamSection + ImpactCharts + Experience)
- `/#resume` - Resume view
- `/#portfolio` - Portfolio view
- `/#styleguide` - Style guide view
- `/#colophon` - Colophon view

**How it works:**
1. Navbar dispatches `view-change` custom events
2. `index.astro` listens for these events and shows/hides view containers
3. Each view change triggers analytics pageviews (GA4 + PostHog)
4. Hash changes update browser history without page reload

### 3D Background System

**Two rendering paths** (based on browser support):

1. **Web Worker Path** (Modern browsers with OffscreenCanvas):
   - `ThreeScene.astro` transfers canvas control to `three-worker.ts`
   - Three.js runs entirely in a Web Worker (non-blocking)
   - Main thread sends mouse position updates to worker
   - Worker handles all rendering, model loading, and animation

2. **Fallback Path** (Older browsers):
   - `ThreeSceneFallback.ts` runs Three.js on main thread
   - Same visual result, but less performant

**3D Asset:** `/public/cotton_ball-v1.glb` (loaded via GLTFLoader with Draco compression)

**Visibility states:**
- Shows on home view only
- Hides during "slam" interactions
- Starts idle after 5 seconds without user interaction (for Lighthouse)

### Performance Optimizations

1. **Lenis Smooth Scrolling:**
   - Deferred initialization using `requestIdleCallback`
   - Auto-pauses after 5 seconds of inactivity (helps Lighthouse)
   - Stops when tab is hidden
   - Restarts on any user interaction

2. **Analytics (Partytown):**
   - Google Analytics, PostHog, LinkedIn Tag, and RB2B run in Web Workers
   - Configured in `astro.config.mjs` with forwarded functions

3. **Font Loading:**
   - Google Fonts (Inter) preconnected
   - Anime.js modulepreloaded

### Custom Animations

Defined in `src/styles/global.css`:

- **`slam`** - Scale-up entrance animation (0.6s, used in SlamSection)
- **`shake`** - Shake animation (0.5s, multi-directional)
- **`pulse-slow`** - Slow pulse (3s infinite, used in Hero scroll indicator)

Custom utility class:
- `.slam-text` - Text shadow effect for slam interactions

### Analytics Integration

**Four tracking services** (all via Partytown):

1. **Google Analytics 4** (`G-7LRLJTJG4L`)
2. **PostHog** (configured in `PostHog.astro`)
3. **LinkedIn Insight Tag** (`LinkedInTag.astro`)
4. **RB2B** (B2B visitor identification, `RB2B.astro`)

**Virtual pageviews:** Each view switch tracks as a pageview with custom path/title.

### Dark Mode

- **Strategy:** Class-based (`class="dark"`)
- **Storage:** `localStorage.theme`
- **Fallback:** System preference (`prefers-color-scheme`)
- **Init:** Inline script in `Layout.astro` prevents flash of wrong theme
- **Icons:** Dual favicons for light/dark mode

### Privacy & Compliance

- **Cookie Banner:** `CookieBanner.astro` (shown on first visit)
- **Privacy Policy:** `/privacy` page (`src/pages/privacy.astro`)
- Cookie consent controls analytics opt-in/opt-out

## File Structure

```
src/
├── components/
│   ├── Hero.astro              # Sticky hero section with scroll indicator
│   ├── ThreeScene.astro        # 3D canvas (Web Worker path)
│   ├── ThreeSceneFallback.ts   # 3D fallback (main thread)
│   ├── SlamSection.astro       # Interactive "slam" animation section
│   ├── ImpactCharts.astro      # Data visualization component
│   ├── Experience.astro        # Work experience timeline
│   ├── Resume.astro            # Resume view
│   ├── Portfolio.astro         # Portfolio view
│   ├── StyleGuide.astro        # Design system documentation
│   ├── Colophon.astro          # Site credits
│   ├── Navbar.astro            # Navigation (triggers view switching)
│   ├── Footer.astro            # Footer component
│   ├── CookieBanner.astro      # GDPR cookie consent
│   ├── PostHog.astro           # PostHog analytics init
│   ├── LinkedInTag.astro       # LinkedIn Insight Tag
│   ├── RB2B.astro              # RB2B tracking script
│   └── SEO.astro               # Meta tags component
├── layouts/
│   └── Layout.astro            # Main layout (includes Lenis, theme, analytics)
├── pages/
│   ├── index.astro             # Main SPA page (all views)
│   └── privacy.astro           # Privacy policy page
├── styles/
│   └── global.css              # Custom animations, Lenis styles, utilities
├── workers/
│   └── three-worker.ts         # Three.js Web Worker for 3D rendering
└── global.d.ts                 # TypeScript global declarations

public/
├── cotton_ball-v1.glb          # 3D model asset
└── favicon-{dark,light}.png    # Theme-aware favicons
```

## Important Patterns

### Handling Undefined Data

Components like `ImpactCharts.astro` defensively handle potentially undefined data to prevent runtime errors. Always check for null/undefined before accessing nested properties.

### Accessibility

- **Contrast ratios:** Use `text-slate-400` (not `text-slate-500`) in dark mode for sufficient contrast
- **Heading hierarchy:** Semantic headings (h1-h6), avoid skipping levels
- **Footer labels:** Use `<p>` tags, not `<h4>`, for non-heading footer labels

### Scroll Interactions

The Hero section fades out as user scrolls (opacity calculated from scroll position). This is coordinated with:
- Lenis smooth scrolling
- `sticky-hero` positioning (fixed → absolute when scrolled past)
- Content layer with `margin-top: 100vh` to reveal fixed hero

### Slam Interactions

The "slam" effect is a coordinated animation across multiple components:
1. User triggers slam (button click in SlamSection)
2. Custom `slam` event dispatched
3. Hero content hides
4. ThreeScene hides
5. After animation completes, `reset-hero` event shows them again

## ESLint Configuration

Uses **legacy flat config** mode via environment variable: `ESLINT_USE_FLAT_CONFIG=false`

This is set in the `lint` script and required for the current ESLint setup to work correctly.

## Deployment

Site URL: `https://anthonyrosen.com` (configured in `astro.config.mjs`)

The site includes sitemap generation via `@astrojs/sitemap` integration.
