import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("forum themes keep the requested color identities", async () => {
  const css = await readFile(new URL("../src/mechanical.css", import.meta.url), "utf8");
  const dark = css.match(/:root\s*\{([\s\S]*?)\r?\n\}/)?.[1] ?? "";
  const light = css.match(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\r?\n\}/)?.[1] ?? "";

  assert.match(dark, /--canvas: #0b0c0d/);
  assert.match(dark, /--acid: #f47b20/);
  assert.match(light, /--panel: #ffffff/);
  assert.match(light, /--acid: #0868b5/);
  assert.match(css, /\.forum-banner/);
  assert.match(css, /\.maintenance-list details:hover/);
});

test("every interface font stack uses self-hosted Poppins", async () => {
  const files = ["styles.css", "mechanical.css", "home.css", "footer.css"];
  const css = (await Promise.all(files.map((file) => readFile(new URL(`../src/${file}`, import.meta.url), "utf8")))).join("\n");
  const declarations = css.match(/font-family:\s*[^;]+/g) ?? [];

  assert.ok(declarations.length > 0);
  assert.ok(declarations.every((declaration) => declaration.includes('"Poppins"')));
  for (const font of ["Regular", "SemiBold", "Bold", "ExtraBold", "Black"]) {
    await access(new URL(`../public/fonts/poppins/Poppins-${font}.ttf`, import.meta.url));
  }
});
