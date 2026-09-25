## 2025-05-15 - Missing Security Headers in Astro/Netlify
**Vulnerability:** The application was missing standard HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, etc.) in `public/_headers`.
**Learning:** Static site generators like Astro deployed to Netlify require manual configuration of security headers in `public/_headers`, as they are not added by default.
**Prevention:** Always include a baseline `_headers` file with security headers in the `public/` directory for Netlify deployments.
