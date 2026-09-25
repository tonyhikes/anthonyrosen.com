## 2024-05-23 - Interactive Visibility Patterns
**Learning:** Interactive components (Navbar mobile menu, Resume dropdowns) rely on toggling the `hidden` class but often miss accompanying ARIA attributes (`aria-expanded`) and keyboard support (Escape key).
**Action:** When modifying interactive components, always implement a state synchronizer function (e.g., `setMenuState(isOpen)`) that updates both visual classes and semantic attributes, and ensure Escape key support is added.
