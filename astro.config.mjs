// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://anthonyrosen.com",
    vite: {
        plugins: [tailwindcss()],
    },

    integrations: [react(), partytown({
      config: {
        forward: ["dataLayer.push", "posthog.init", "posthog.capture", "posthog.identify", "posthog.on"],
      },
    }), sitemap()],
});