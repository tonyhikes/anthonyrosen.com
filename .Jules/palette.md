## 2025-02-18 - Clickable Hero Scroll Indicator
**Learning:** Hero sections often have visual "Scroll" cues that look interactive but aren't. Users expect them to function as navigation.
**Action:** Always wrap scroll indicators (text/arrows) in `<button>` elements with `aria-label` and implement smooth scrolling to the main content. Ensure `pointer-events-auto` is applied if the hero overlay captures clicks.
