## 2024-05-23 - Dynamic ARIA State Management
**Learning:** Interactive components like mobile menus often have multiple closing mechanisms (button click, outside click, Escape key). It is critical to update `aria-expanded` and `aria-label` in *all* of these handlers, not just the primary toggle button, to keep assistive technology in sync with the visual state.
**Action:** When implementing or fixing disclosure widgets, audit all event listeners (click, keydown, etc.) that modify visibility and ensure they also update corresponding ARIA attributes.
