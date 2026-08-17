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

test("Supabase password login and centralized account entitlements are explicit", async () => {
  const auth = await readFile(new URL("../src/useKeeperAuth.ts", import.meta.url), "utf8");
  const access = await readFile(new URL("../src/access.ts", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/AuthPanel.tsx", import.meta.url), "utf8");

  assert.match(auth, /signInWithPassword/);
  assert.match(auth, /auth\.signUp/);
  assert.match(auth, /resetPasswordForEmail/);
  assert.match(auth, /PASSWORD_RECOVERY/);
  assert.match(auth, /resend\(\{ type: "signup"/);
  assert.match(auth, /signInWithOAuth/);
  assert.match(auth, /scopes: "openid email profile"/);
  assert.doesNotMatch(auth, /apple/i);
  assert.match(auth, /linkIdentity/);
  assert.doesNotMatch(auth, /signInAnonymously/);
  assert.match(access, /AccountKind = "guest" \| "legacy" \| "setup" \| "account"/);
  assert.match(access, /identity\.provider !== "anonymous"/);
  assert.match(auth, /getUser\(\)/);
  assert.match(access, /canSaveGarage: false/);
  assert.match(access, /entitlements\.has\("authenticated_account"\)/);
  assert.match(access, /kind: "account"[\s\S]*canExport: true/);
  assert.match(panel, /Forgot Password\?/);
  assert.match(panel, /Confirm password/);
  assert.match(panel, /Terms of Service/);
  assert.match(panel, /Privacy Policy/);
});

test("auth changes clear account-specific state before a new garage loads", async () => {
  const auth = await readFile(new URL("../src/useKeeperAuth.ts", import.meta.url), "utf8");
  const garage = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const records = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");

  assert.match(auth, /setEntitlements\(new Set\(\)\);[\s\S]*setSession\(nextSession\)/);
  assert.match(auth, /const dataUser = access\.kind === "account" \|\| access\.kind === "legacy" \? user : null/);
  assert.match(garage, /state\.ownerId === user\.id \? state : initialState/);
  assert.match(records, /state\.scope === scope \? state : initialState/);
});
