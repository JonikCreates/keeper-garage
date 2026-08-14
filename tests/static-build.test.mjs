import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains the Keeper application", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));
  const script = assets.find((file) => file.endsWith(".js"));

  assert.match(html, /Keeper — 2016 BMW F30 Intelligence/);
  assert.match(html, /\/keeper-garage\/assets\//);
  assert.ok(script, "expected a compiled JavaScript asset");

  const bundle = await readFile(
    new URL(`../dist/assets/${script}`, import.meta.url),
    "utf8",
  );
  assert.match(bundle, /Urgent/);
  assert.match(bundle, /Be on the lookout/);
  assert.match(bundle, /2016 F30 issue library/);
  assert.match(bundle, /328i/);
  assert.match(bundle, /340i/);
  assert.match(bundle, /Continue as guest/);
  assert.match(bundle, /Email me a sign-in link/);
  assert.match(bundle, /Save to garage/);
  assert.match(bundle, /Use an account you already trust/);
  assert.match(bundle, /Connected accounts/);
  assert.match(bundle, /Your profile/);
  assert.match(bundle, /Security/);
  assert.match(bundle, /Change email/);
  assert.match(bundle, /Add phone/);
  assert.match(bundle, /Owner-only data/);
});
