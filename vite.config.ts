import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => ({
  base: mode === "github-pages" ? "/keeper-garage/" : "/",
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        "auth/callback": resolve(import.meta.dirname, "auth/callback/index.html"),
      },
    },
  },
}));
