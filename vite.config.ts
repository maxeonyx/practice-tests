import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: "/",
  plugins: [
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Kira · Nursing revision",
        short_name: "Kira",
        description: "Your nursing revision, one useful step at a time.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f7f7f2",
        theme_color: "#193f37",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
      },
    }),
  ],
});
