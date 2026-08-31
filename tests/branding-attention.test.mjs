import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("Needs Attention uses one reusable stacked summary layout", async () => {
  const component = await readFile(new URL("../src/OwnershipDashboard.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/mechanical.css", import.meta.url), "utf8");

  assert.match(component, /<summary className="attention-summary">[\s\S]*?<span>\{priorityLabels\[item\.priority\]\}<\/span>[\s\S]*?<strong>\{item\.name\}<\/strong>[\s\S]*?<small>\{recommendationLabel\(item\.recommendationType\)\}<\/small>[\s\S]*?<\/summary>/);
  assert.match(css, /\.attention-summary \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) 18px;[^}]*gap:/);
  assert.match(css, /\.attention-summary > div \{[^}]*display: grid;[^}]*gap:/);
  assert.match(css, /\.attention-summary strong \{[^}]*overflow-wrap: anywhere;/);
  assert.match(css, /\.attention-summary::after/);
  assert.match(css, /\.attention-collapsible\[open\] > \.attention-summary::after/);
});

test("Keeper branding switches by background and watermarks cannot intercept UI", async () => {
  const brand = await readFile(new URL("../src/KeeperBrand.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/mechanical.css", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/HomePage.tsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const auth = await readFile(new URL("../src/AuthPanel.tsx", import.meta.url), "utf8");
  const exporter = await readFile(new URL("../src/maintenanceExport.ts", import.meta.url), "utf8");

  assert.match(brand, /onLight: "\/branding\/keeper-mark-black\.png"/);
  assert.match(brand, /onDark: "\/branding\/keeper-mark-white\.png"/);
  assert.match(css, /--keeper-watermark-opacity:/);
  assert.match(css, /--keeper-watermark-tile:/);
  assert.match(css, /\.site-shell::before, \.home-shell::before \{[\s\S]*?pointer-events: none;[\s\S]*?background-repeat: repeat;/);
  assert.match(home, /<KeeperBrand[\s\S]*?<KeeperLogo className="home-hero-logo"/);
  assert.match(app, /<KeeperBrand[\s\S]*?<KeeperLogo className="personal-garage-logo"/);
  assert.match(auth, /<KeeperLogo className="auth-brand-logo"/);
  assert.match(exporter, /KEEPER_LOGO_ASSETS\.onLight/);
  assert.match(exporter, /document\.addImage\(keeperLogo/);
  assert.match(exporter, /context\.drawImage\(keeperLogo/);
  for (const source of [home, app]) {
    assert.match(source, /Enthusiast maintenance intelligence/);
    assert.match(source, /KNOWLEDGE \+ ORGANIZATION \+ VEHICLE HISTORY/);
    assert.doesNotMatch(source, /Owner-built maintenance intelligence/);
  }
  assert.match(home, /Keeper is a digital ownership guide and service record for enthusiast cars\. It tells you what your specific car needs, what problems to watch for, keeps track of everything you’ve done, and helps you understand what comes next\./);

  for (const asset of [
    "keeper-mark-black.png",
    "keeper-mark-white.png",
    "keeper-mark-white-orange.png",
    "keeper-mark-white-black.png",
  ]) {
    const path = new URL(`../public/branding/${asset}`, import.meta.url);
    const bytes = await readFile(path);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.ok((await stat(path)).size > 100_000);
  }
});

test("service-date ordering remains the source of truth for recent maintenance", async () => {
  const hook = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");
  const intelligence = await readFile(new URL("../src/ownershipIntelligence.ts", import.meta.url), "utf8");
  assert.match(hook, /right\.completed_at\.localeCompare\(left\.completed_at\)/);
  assert.match(intelligence, /right\.completedAt\.localeCompare\(left\.completedAt\) \|\| right\.mileage - left\.mileage/);
});
