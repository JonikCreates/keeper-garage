import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("forum themes keep the requested color identities", async () => {
  const css = await readFile(new URL("../src/mechanical.css", import.meta.url), "utf8");
  const dark = css.match(/:root\s*\{([\s\S]*?)\r?\n\}/)?.[1] ?? "";
  const light = css.match(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\r?\n\}/)?.[1] ?? "";

  assert.match(dark, /--canvas: #0b0c0d/);
  assert.match(dark, /--acid: #e32828/);
  assert.match(light, /--panel: #ffffff/);
  assert.match(light, /--acid: #0868b5/);
  assert.match(css, /\.forum-banner/);
  assert.match(css, /\.maintenance-list details:hover/);
});

test("the support address is visible in account and security surfaces", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const legal = await readFile(new URL("../src/legal.ts", import.meta.url), "utf8");
  const security = await readFile(new URL("../SECURITY.md", import.meta.url), "utf8");

  assert.match(app, /mailto:support@keeperauto\.com/);
  assert.match(legal, /supportEmail: "support@keeperauto\.com"/);
  assert.match(security, /support@keeperauto\.com/);
});
