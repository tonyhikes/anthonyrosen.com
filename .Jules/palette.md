## 2025-02-24 - Accessible Toggle State Synchronization
**Learning:** Interactive components like mobile menus and dropdowns often rely solely on CSS classes (e.g., `hidden`) for visibility, neglecting semantic attributes (`aria-expanded`) which are critical for screen readers.
**Action:** When implementing toggle functionality, create a state management helper (e.g., `setMenuState(isOpen)`) that updates both the visual class and the `aria-expanded` attribute simultaneously to ensure consistency.
