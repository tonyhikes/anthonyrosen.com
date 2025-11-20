# Deployment Walkthrough: anthonyrosen.com

**Status:** ✅ Live
**Main Domain:** [anthonyrosen.com](https://anthonyrosen.com)
**Redirect:** [tonyrosen.com](https://tonyrosen.com) -> [anthonyrosen.com](https://anthonyrosen.com)

## What We Did

1.  **Git Initialization**:
    - Converted the local project into a Git repository.
    - Connected it to GitHub: `https://github.com/tonyhikes/anthonyrosen.com.git`.
    - Force-pushed the code to overwrite an old project history.

2.  **Vercel Deployment**:
    - Imported the repository into Vercel.
    - Vercel automatically built and deployed the Astro site.

3.  **Bug Fix**:
    - **Issue**: Footer was not visible on the live site.
    - **Fix**: Added `relative z-50` to the footer component to ensure it sits above other layers.
    - **Verification**: Pushed the fix to GitHub, which triggered an automatic Vercel redeploy.

4.  **Domain Configuration**:
    - Configured `anthonyrosen.com` on Spaceship.com with Vercel's DNS records.
    - Configured `tonyrosen.com` to redirect to the main domain.

## How to Update Your Site

In the future, whenever you want to update your website:

1.  Make changes in your code.
2.  Run these commands in your terminal:
    ```bash
    git add .
    git commit -m "Description of your changes"
    git push
    ```
3.  Vercel will see the new code and update the live site automatically!
