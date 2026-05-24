import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild", // 使用 esbuild 替代 terser，避免内存问题
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,bin}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "Stellarium Mobile",
        short_name: "Stellarium",
        description: "专业级移动端星象馆",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "any",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "./icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
