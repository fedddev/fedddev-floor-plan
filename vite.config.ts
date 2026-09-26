import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Served from GitHub Pages at https://fedddev.github.io/fedddev-floor-plan/
  base: "/fedddev-floor-plan/",
  plugins: [vue()],
  server: {
    port: 8080,
    // File change events don't reach WSL for files on /mnt/c - poll so edits are picked up
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@composables": path.resolve(__dirname, "./src/composables"),
      "@models": path.resolve(__dirname, "./src/models"),
      "@data": path.resolve(__dirname, "./src/data"),
    },
    extensions: [".js", ".ts", ".json"],
  },
  assetsInclude: ["**/*.gltf", "**/*.svg", "**/*.png", "**/*.glb"],
  css: {
    postcss: "./postcss.config.js",
  },
});
