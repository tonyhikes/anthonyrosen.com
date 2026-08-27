# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tony Rosen's portfolio website - a single-page application built with Astro, featuring a simple editorial hero, smooth scrolling with Lenis, and comprehensive analytics integration.

**Tech Stack:**

- **Framework:** Astro 5 with React integration
- **Styling:** Tailwind CSS 4 (with Preline UI plugin)
- **Animations:** Lightweight CSS and browser-native animations
- **Smooth Scroll:** Lenis
- **Analytics:** PostHog, Google Analytics 4, LinkedIn Insight Tag, RB2B
- **Performance:** Deferred analytics and interaction-first loading

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

- `/` or `/#home` - Home view (ManyHatsHero + ImpactCharts + Experience)
- `/#resume` - Resume view
- `/#portfolio` - Portfolio view
- `/#styleguide` - Style guide view
- `/#colophon` - Colophon view

**How it works:**

1. Navbar dispatches `view-change` custom events
2. `index.astro` listens for these events and shows/hides view containers
3. Each view change triggers analytics pageviews (GA4 + PostHog)
4. Hash changes update browser history without page reload

### Home Experience

- `ManyHatsHero.astro` is the simple full-viewport introduction.
- The experimental `ManyHats.astro` section is preserved in the repository but is not currently mounted on the homepage.
- The former slam hero and Three.js background were removed. The rollback path is documented in `docs/archive/slam-hero-rollback.md`.

### Performance Optimizations

The site is optimized for fast loading and excellent Core Web Vitals scores:

1. **Critical CSS Inlining:**
   - Essential styles inlined in `<head>` to eliminate render-blocking CSS
   - Main stylesheet loads asynchronously
   - Lenis critical styles inlined to prevent FOUC

2. **Deferred JavaScript Loading:**
   - All analytics scripts (PostHog, Google Analytics, LinkedIn Tag, RB2B) defer using `requestIdleCallback`
   - Lenis smooth scrolling initialization deferred until after page load
   - Reduces Total Blocking Time (TBT) from 4,100ms to ~60ms on mobile

3. **Lenis Smooth Scrolling:**
   - Deferred initialization using `requestIdleCallback`
   - Auto-pauses after 5 seconds of inactivity (helps Lighthouse)
   - Stops when tab is hidden
   - Restarts on any user interaction

4. **Font Loading:**
   - Inter is self-hosted and uses non-blocking font-display behavior.

5. **Cache Headers:**
   - Static assets cached for 1 year with `immutable` flag (via `public/_headers`)
   - HTML pages revalidate on each request
   - Configured for Netlify/Vercel deployment

### Hero Motion

The simple hero uses a restrained CSS hand wave and a subtle scroll-based background-color transition. It respects `prefers-reduced-motion`.

### Analytics Integration

**Four tracking services** (loaded only after analytics consent):

1. **Google Analytics 4** (`G-7LRLJTJG4L`)
2. **PostHog** (configured in `PostHog.astro`)
3. **LinkedIn Insight Tag** (`LinkedInTag.astro`)
4. **RB2B** (B2B visitor identification, `RB2B.astro`)

**Virtual pageviews:** Each view switch tracks as a pageview with custom path/title.

**Job-search events:** `contact_click`, `resume_download`, `linkedin_click`, and `portfolio_open` are sent to GA4 and PostHog by `JobSearchAnalytics.astro`.

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
│   ├── ManyHatsHero.astro      # Simple editorial homepage hero
│   ├── ManyHats.astro          # Preserved experiment; not currently mounted
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
│   ├── JobSearchAnalytics.astro # GA4/PostHog job-search events
│   └── SEO.astro               # Meta tags component
├── layouts/
│   └── Layout.astro            # Main layout (includes Lenis, theme, analytics)
├── pages/
│   ├── index.astro             # Main SPA page (all views)
│   └── privacy.astro           # Privacy policy page
├── styles/
│   └── global.css              # Shared styles and Lenis styles
└── global.d.ts                 # TypeScript global declarations

public/
├── many-hats/                  # Optimized imagery for the work overview
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

The hero transitions gently from warm cream to pale blue as the visitor scrolls. Keep its reduced-motion behavior intact when changing the section.

## ESLint Configuration

Uses **legacy flat config** mode via environment variable: `ESLINT_USE_FLAT_CONFIG=false`

This is set in the `lint` script and required for the current ESLint setup to work correctly.

## Deployment

Site URL: `https://anthonyrosen.com` (configured in `astro.config.mjs`)

The site includes sitemap generation via `@astrojs/sitemap` integration.
