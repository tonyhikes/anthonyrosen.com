## 2026-02-13 - Mobile Navigation Pattern Flaw
**Learning:** The mobile menu closing logic relied on specific CSS classes (`.nav-link`) attached to anchor tags. This caused the "Contact" link (which lacked this class) to navigate without closing the menu, leaving the user in a confusing state.
**Action:** When implementing mobile menus, attach the "close menu" event listener to *all* anchor tags within the menu container (`menu.querySelectorAll('a')`) rather than a subset of specific classes. This ensures robust behavior for all current and future links.

## 2026-02-13 - Disclosure Widget Accessibility Gap
**Learning:** Multiple interactive components (Mobile Menu, Resume Download) used `hidden` class toggling but failed to update the corresponding `aria-expanded` attribute, leaving screen reader users unaware of the state change.
**Action:** Always couple visual state toggling (e.g., `classList.toggle('hidden')`) with ARIA state updates in a single helper function to prevent desynchronization.
