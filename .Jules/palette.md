## 2025-02-18 - Mobile Menu Accessibility
**Learning:** Simple CSS class toggles for mobile menus often neglect `aria-expanded` state and keyboard focus management, leaving screen reader users unaware of state changes and keyboard users trapped.
**Action:** Encapsulate menu toggle logic in a function (e.g., `setMenuState`) that updates both visual visibility (CSS classes) and semantic state (`aria-expanded`), and always implement `Escape` key support with focus restoration.
