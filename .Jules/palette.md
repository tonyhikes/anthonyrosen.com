## 2025-05-18 - Accessibility of Custom Dropdowns
**Learning:** Manual dropdown implementations (using simple `classList.toggle('hidden')`) often miss critical accessibility attributes like `aria-expanded` and keyboard interactions (Escape key closing). This creates a poor experience for screen reader and keyboard users.
**Action:** Always include a helper function to toggle state that updates BOTH the visual class AND the `aria-expanded` attribute. Add an `Escape` key listener to close the dropdown. Check for this pattern in other interactive components (like mobile menus).
