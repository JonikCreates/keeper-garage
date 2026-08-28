import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("footer uses the package version and exposes consistent legal support", async () => {
  const [pkg, vite, footer, legal, legalPage, routing] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/SiteFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/legal.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/LegalPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/routing.ts", import.meta.url), "utf8"),
  ]);

  assert.match(pkg.version, /^0\.\d+\.\d+$/);
  assert.match(vite, /__KEEPER_VERSION__:\s*JSON\.stringify\(packageJson\.version\)/);
  assert.match(vite, /VITE_CANONICAL_SITE_URL[\s\S]*https:\/\/keeperauto\.com\//);
  assert.match(footer, /Keeper v\{KEEPER_VERSION\}/);
  for (const page of ["terms", "privacy", "contact"]) {
    assert.match(footer, new RegExp(`pageHref\\("${page}"\\)`));
    assert.match(routing, new RegExp(`${page}: "${page}"`));
  }
  assert.match(legal, /support@keeperauto\.com/);
  assert.match(legal, /August 28, 2026/);
  assert.match(legalPage, /does not immediately or automatically erase the account/);
  assert.match(legalPage, /Stripe collects and processes card details/);
  assert.match(legalPage, /does not receive or store your Google password/);
});
