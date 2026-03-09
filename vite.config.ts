import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: path.resolve(__dirname, "client"),

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },

    server: {
      port: Number(env.VITE_DEV_PORT) || 5010,
      host: true,
      proxy: {
        [env.VITE_API_URL || "/api"]: {
          target: env.VITE_API_TARGET || "http://localhost:8091",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});