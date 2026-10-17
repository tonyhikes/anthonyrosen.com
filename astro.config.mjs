// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://anthonyrosen.com",
    vite: {
        plugins: [tailwindcss()],
    },

    integrations: [
        react(),
        sitemap({
            // Version previews are noindexed drafts; keep them out of the sitemap.
            filter: (page) => !page.includes("/versions"),
        }),
    ],

    // Performance optimizations
    build: {
        inlineStylesheets: "always", // Remove stylesheet round trips on the critical path
    },
    compressHTML: true, // Minify HTML output
});
