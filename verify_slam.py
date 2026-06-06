from playwright.sync_api import sync_playwright
import time

def verify_slam():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to page...")
        page.goto("http://localhost:4321")

        # Wait for initial load
        page.wait_for_load_state("networkidle")

        # Get the slam target element
        slam_target = page.locator("#slam-target")

        # Check initial state (should be invisible or opacity 0)
        # Note: The inline style has opacity: 0
        initial_opacity = slam_target.evaluate("el => el.style.opacity")
        print(f"Initial opacity: {initial_opacity}")

        # Scroll down to trigger the animation
        # The section is #hire-section. We need it to be at the top of the viewport.
        # We can scroll to the element.
        print("Scrolling to trigger animation...")
        hire_section = page.locator("#hire-section")
        hire_section.scroll_into_view_if_needed()

        # We need to ensure it's at the top. scroll_into_view might just bring it into view.
        # Let's force scroll to a large value just in case, or use evaluate to scroll.
        # The logic says rect.top <= 10.

        # Let's try scrolling step by step to simulate user behavior
        for i in range(10):
            page.mouse.wheel(0, 500)
            time.sleep(0.1)

        # Wait for animation
        print("Waiting for animation...")
        time.sleep(2) # Animation duration is around 600ms + delays

        # Check final state
        final_opacity = slam_target.evaluate("el => el.style.opacity")
        print(f"Final opacity: {final_opacity}")

        # Take screenshot
        page.screenshot(path="slam_verification.png")
        print("Screenshot saved to slam_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_slam()
