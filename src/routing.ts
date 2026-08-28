import type { LegalPageKind } from "./legal";

export type AppPage = "home" | "garage" | "maintenance" | "issues" | "profile" | "payment-success" | "payment-cancelled" | LegalPageKind;

const pagePaths: Record<AppPage, string> = {
  home: "", garage: "garage", maintenance: "maintenance", issues: "issues", profile: "profile",
  "payment-success": "account/payment/success", "payment-cancelled": "account/payment/cancelled",
  terms: "terms", privacy: "privacy", contact: "contact",
};
const pages = Object.keys(pagePaths) as AppPage[];
const githubPagesBuild = import.meta.env.MODE === "github-pages";

function baseUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin);
}

export function pageHref(page: AppPage) {
  const base = baseUrl();
  if (githubPagesBuild) {
    base.hash = pagePaths[page];
    return `${base.pathname}${base.search}${base.hash}`;
  }
  base.pathname = `${base.pathname}${pagePaths[page]}`;
  return `${base.pathname}${base.search}`;
}

export function getPageFromLocation(): AppPage {
  const hashPath = window.location.hash.replace(/^#/, "").split(/[?&]/, 1)[0].replace(/^\/+|\/+$/g, "");
  const hashPage = hashPath ? pages.find((page) => pagePaths[page] === hashPath) : undefined;
  if (hashPage) return hashPage;

  const basePath = baseUrl().pathname.replace(/\/$/, "");
  const relativePath = window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length)
    : window.location.pathname;
  const path = relativePath.replace(/^\/+|\/+$/g, "");
  return pages.find((page) => pagePaths[page] === path) ?? "home";
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
