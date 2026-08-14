import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages build contains the Keeper application", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));
  const script = assets.find((file) => file.endsWith(".js"));

  assert.match(html, /Keeper — Owner's Workshop Log/);
  assert.match(html, /\/keeper-garage\/assets\//);
  assert.ok(script, "expected a compiled JavaScript asset");

  const bundle = await readFile(
    new URL(`../dist/assets/${script}`, import.meta.url),
    "utf8",
  );
  assert.match(bundle, /Urgent/);
  assert.match(bundle, /Be on the lookout/);
  assert.match(bundle, /Owner's workshop log/);
  assert.match(bundle, /3 Series \(E36\)/);
  assert.match(bundle, /3 Series \(E46\)/);
  assert.match(bundle, /5 Series \(E39\)/);
  assert.match(bundle, /E36 preserves 25 workbook categories/);
  assert.match(bundle, /M56B25 2\.5L I6/);
  assert.match(bundle, /S54B32 3\.2L I6/);
  assert.match(bundle, /S62B50 5\.0L V8/);
  assert.match(bundle, /6-speed SMG II/);
  assert.match(bundle, /Touring rear self-leveling air suspension/);
  assert.match(bundle, /Rear axle carrier panel/);
  assert.match(bundle, /keeper-theme/);
  assert.match(bundle, /328i/);
  assert.match(bundle, /330i/);
  assert.match(bundle, /335i/);
  assert.match(bundle, /340i/);
  assert.match(bundle, /328d — Diesel/);
  assert.match(bundle, /330e — Plug-in Hybrid/);
  assert.match(bundle, /Each selection narrows the choices that follow/);
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
