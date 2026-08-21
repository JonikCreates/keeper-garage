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
  assert.match(auth, /signOut\(\{ scope: "global" \}\)/);
  assert.match(auth, /signOut\(\{ scope: "local" \}\)/);
  assert.match(auth, /scopes: "openid email profile"/);
  assert.doesNotMatch(auth, /apple/i);
  assert.match(auth, /linkIdentity/);
  assert.doesNotMatch(auth, /signInAnonymously/);
  assert.match(access, /AccountKind = "guest" \| "legacy" \| "setup" \| "account"/);
  assert.match(access, /identity\.provider !== "anonymous"/);
  assert.match(auth, /getUser\(\)/);
  assert.match(access, /canSaveGarage: false/);
  assert.match(access, /entitlements\.has\("authenticated_account"\)/);
  assert.match(access, /kind: "account"[\s\S]*canExport: plan\.canExport/);
  assert.match(panel, /Forgot Password\?/);
  assert.match(panel, /Confirm Password/);
  assert.match(panel, /Welcome back/);
  assert.match(panel, /Sign In to Existing Account/);
  assert.match(panel, /Continue with Google/);
  assert.match(auth, /prepare_legacy_garage_claim/);
  assert.match(auth, /claim_legacy_garage/);
  assert.match(panel, /Terms of Service/);
  assert.match(panel, /Privacy Policy/);
});

test("authentication uses an isolated PKCE callback instead of URL token detection", async () => {
  const client = await readFile(new URL("../src/supabase.ts", import.meta.url), "utf8");
  const callback = await readFile(new URL("../src/authCallback.ts", import.meta.url), "utf8");
  const callbackHtml = await readFile(new URL("../auth/callback/index.html", import.meta.url), "utf8");

  assert.match(client, /flowType: "pkce"/);
  assert.match(client, /detectSessionInUrl: false/);
  assert.match(callback, /exchangeCodeForSession\(code\)/);
  assert.ok(callback.indexOf("history.replaceState") < callback.indexOf("exchangeCodeForSession"), "callback URL must be cleaned before exchange");
  assert.match(callbackHtml, /noindex, nofollow/);
  assert.doesNotMatch(client, /access_token|refresh_token|provider_token/);
});

test("Cloudflare headers and public share URLs exclude session material", async () => {
  const headers = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const routing = await readFile(new URL("../src/routing.ts", import.meta.url), "utf8");
  const vite = await readFile(new URL("../vite.config.ts", import.meta.url), "utf8");

  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /Referrer-Policy: no-referrer/);
  assert.match(headers, /\/auth\/callback\/\*/);
  assert.match(headers, /Cache-Control: no-store/);
  assert.match(routing, /safeShareUrl/);
  assert.doesNotMatch(routing, /access_token|refresh_token|provider_token/);
  assert.match(vite, /sourcemap: false/);
});

test("auth changes clear account-specific state before a new garage loads", async () => {
  const auth = await readFile(new URL("../src/useKeeperAuth.ts", import.meta.url), "utf8");
  const garage = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const records = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");

  assert.match(auth, /setEntitlements\(new Set\(\)\);[\s\S]*setSession\(nextSession\)/);
  assert.match(auth, /access\.kind === "account" \|\| access\.kind === "legacy"\s*\? user\s*: null/);
  assert.match(garage, /state\.ownerId === user\.id \? state : initialState/);
  assert.match(records, /state\.scope === scope \? state : initialState/);
  assert.match(auth, /setDataVersion\(\(version\) => version \+ 1\)/);
});
