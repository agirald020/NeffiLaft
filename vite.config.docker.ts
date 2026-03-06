import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/app/client/src",
      "@shared": "/app/shared",
      "@assets": "/app/attached_assets",
    },
  },
  root: "/app/client",
  build: {
    outDir: "/app/dist/public",
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
