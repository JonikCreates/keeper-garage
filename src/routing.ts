import type { LegalPageKind } from "./legal";

export type AppPage = "garage" | "maintenance" | "issues" | "profile" | LegalPageKind;

const pages: AppPage[] = ["garage", "maintenance", "issues", "profile", "terms", "privacy", "contact"];
const githubPagesBuild = import.meta.env.MODE === "github-pages";

function baseUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin);
}

export function pageHref(page: AppPage) {
  const base = baseUrl();
  if (githubPagesBuild) {
    base.hash = page;
    return `${base.pathname}${base.search}${base.hash}`;
  }
  base.pathname = `${base.pathname}${page === "garage" ? "" : page}`;
  return `${base.pathname}${base.search}`;
}

export function getPageFromLocation(): AppPage {
  const hashPage = window.location.hash.replace(/^#/, "").split(/[?&]/, 1)[0];
  if (pages.includes(hashPage as AppPage)) return hashPage as AppPage;

  const basePath = baseUrl().pathname.replace(/\/$/, "");
  const relativePath = window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length)
    : window.location.pathname;
  const pathPage = relativePath.replace(/^\/+|\/+$/g, "").split("/", 1)[0];
  return pages.includes(pathPage as AppPage) ? pathPage as AppPage : "garage";
}

export function authCallbackUrl(accountView: "profile" | "verify" | "recovery" = "profile") {
  const url = new URL("auth/callback/", baseUrl());
  url.searchParams.set("account", accountView);
  return url.toString();
}

export function authResultUrl(accountView: "profile" | "verify" | "recovery") {
  const url = new URL(pageHref("profile"), window.location.origin);
  url.searchParams.set("account", accountView);
  return url.toString();
}

export function isAuthCallbackLocation() {
  const normalized = window.location.pathname.replace(/\/+$/, "");
  return normalized.endsWith("/auth/callback");
}

export function safeShareUrl(page: AppPage = getPageFromLocation()) {
  return new URL(pageHref(page), window.location.origin).toString();
}
