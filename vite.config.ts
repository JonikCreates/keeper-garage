import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

function normalizeSiteUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("VITE_SITE_URL must use http or https.");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function keeperMetadata(siteUrl: string): Plugin {
  return {
    name: "keeper-site-metadata",
    transformIndexHtml(html) {
      return html.replaceAll("__KEEPER_SITE_URL__", siteUrl);
    },
  };
}

export default defineConfig(({ mode }) => {
  const githubPages = mode === "github-pages";
  const env = loadEnv(mode, process.cwd(), "");
  const configuredSiteUrl = env.VITE_SITE_URL?.trim();

  if (process.env.CF_PAGES === "1" && !configuredSiteUrl) {
    throw new Error("Cloudflare Pages requires VITE_SITE_URL for canonical and social URLs.");
  }

  const siteUrl = normalizeSiteUrl(configuredSiteUrl || "https://keeperauto.com/");

  return {
    base: githubPages ? "/keeper-garage/" : "/",
    plugins: [react(), keeperMetadata(siteUrl)],
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
  };
});
