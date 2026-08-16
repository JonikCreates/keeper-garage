import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("new visitors start in light mode while saved dark mode remains respected", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(html, /<html lang="en" data-theme="light">/);
  assert.match(html, /meta name="theme-color" content="#0d2b46"/);
  assert.match(app, /localStorage\.getItem\("keeper-theme"\) === "dark" \? "dark" : "light"/);
});

test("Supabase social login and account access states are explicit", async () => {
  const auth = await readFile(new URL("../src/useKeeperAuth.ts", import.meta.url), "utf8");
  const access = await readFile(new URL("../src/access.ts", import.meta.url), "utf8");

  assert.match(auth, /signInWithOAuth/);
  assert.match(auth, /scopes: "openid email profile"/);
  assert.doesNotMatch(auth, /apple/i);
  assert.match(auth, /linkIdentity/);
  assert.match(access, /AccountKind = "visitor" \| "guest" \| "member"/);
  assert.match(access, /identity\.provider !== "anonymous"/);
  assert.match(auth, /getUser\(\)/);
  assert.match(access, /canSaveGarage: false/);
  assert.match(access, /canRecoverGarage: true/);
  assert.match(access, /canDownloadPdf: false/);
  assert.match(access, /kind: "member"[\s\S]*canDownloadPdf: true/);
});
