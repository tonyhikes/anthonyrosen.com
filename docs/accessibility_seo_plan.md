# Plan: 100 Scores Across All PageSpeed Categories

## Current State (Desktop)

| Category       | Score  |
| -------------- | ------ |
| Performance    | 100 ✅ |
| Best Practices | 100 ✅ |
| Accessibility  | 75     |
| SEO            | 91     |

---

## Accessibility (75 → 100)

### Issue Categories

#### 1. Missing Button/Link Accessible Names

Icon-only buttons (theme toggle, mobile menu) lack `aria-label` attributes.

**Files to fix:**
| File | Element | Fix |
|------|---------|-----|
| `Navbar.astro` | Theme toggle button | Add `aria-label="Toggle dark mode"` |
| `Navbar.astro` | Mobile menu button | Add `aria-label="Open menu"` |
| `Resume.astro` | Download menu button | Add `aria-expanded` for dropdown |

**Example fix:**

```html
<button id="theme-toggle" aria-label="Toggle dark mode" type="button"></button>
```

#### 2. SVG Accessibility

Decorative SVGs need `aria-hidden="true"`, meaningful SVGs need `role="img"` and `aria-label`.

**Files to audit:**

- All components with inline SVGs (Navbar, Footer, Resume, Experience, About)

**Fix pattern:**

```html
<!-- Decorative SVG -->
<svg aria-hidden="true" ...>
	<!-- Meaningful SVG (rare) -->
	<svg role="img" aria-label="Download PDF"></svg>
</svg>
```

#### 3. Color Contrast

Some text may have insufficient contrast ratios (4.5:1 for normal text, 3:1 for large text).

**Likely issues:**

- Light gray text on white backgrounds
- Dark mode contrast in some sections

**Tools to verify:**

- Chrome DevTools → "Rendering" → "Emulate vision deficiencies"
- axe DevTools extension

#### 4. Focus Indicators

Ensure all interactive elements have visible focus states.

**Check:**

- `:focus-visible` styles on buttons and links
- Skip link for keyboard users (optional but recommended)

#### 5. Heading Order

Ensure proper heading hierarchy (h1 → h2 → h3, no skipping).

---

## SEO (91 → 100)

### Missing Items

#### 1. Add `robots.txt`

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://anthonyrosen.com/sitemap.xml
```

#### 2. Generate Sitemap

Install Astro sitemap integration:

```bash
npx astro add sitemap
```

Update `astro.config.mjs`:

```js
import sitemap from "@astrojs/sitemap";

export default defineConfig({
	site: "https://anthonyrosen.com",
	integrations: [sitemap()],
});
```

#### 3. Add Structured Data (JSON-LD)

Add to `Layout.astro` for rich search results:

```html
<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Person",
		"name": "Tony Rosen",
		"jobTitle": "Marketing & Creative Project Manager",
		"url": "https://anthonyrosen.com"
	}
</script>
```

#### 4. Meta Robots Tag

Add to SEO.astro:

```html
<meta name="robots" content="index, follow" />
```

#### 5. Verify Canonical URLs

Ensure `SEO.astro` generates correct canonical URLs for all views.

---

## Task Checklist

### Accessibility

- [ ] Add `aria-label` to theme toggle buttons (Navbar.astro)
- [ ] Add `aria-label` to mobile menu button (Navbar.astro)
- [ ] Add `aria-expanded` to dropdown triggers (Resume.astro)
- [ ] Add `aria-hidden="true"` to decorative SVGs
- [ ] Audit and fix color contrast issues
- [ ] Verify focus states on all interactive elements
- [ ] Check heading hierarchy (h1 → h2 → h3)

### SEO

- [ ] Create `public/robots.txt`
- [ ] Install and configure `@astrojs/sitemap`
- [ ] Add structured data (JSON-LD) to Layout.astro
- [ ] Add `<meta name="robots" content="index, follow" />`
- [ ] Verify canonical URLs are correct

---

## Verification

After implementing, re-run PageSpeed Insights:

```
https://pagespeed.web.dev/analysis?url=https://anthonyrosen.com
```

**Target:** All categories 100 ✅
