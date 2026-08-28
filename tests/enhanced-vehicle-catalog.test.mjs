import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function generatedJson(source, exportName, nextExport) {
  const expression = new RegExp(`export const ${exportName}[^=]*= ([\\s\\S]*?);\\r?\\n\\r?\\nexport const ${nextExport}`);
  const match = source.match(expression);
  assert.ok(match, `${exportName} should be generated as inspectable JSON`);
  return JSON.parse(match[1]);
}

test("all Enhanced Vehicles workbooks produce catalog-driven platforms and exact schedules", async () => {
  const generated = await readFile(new URL("../lib/enhancedVehicleData.ts", import.meta.url), "utf8");
  const platforms = generatedJson(generated, "ENHANCED_PLATFORMS", "ENHANCED_VARIANTS");
  const variants = generatedJson(generated, "ENHANCED_VARIANTS", "ENHANCED_SCHEDULE_PROFILES");
  const profiles = generatedJson(generated, "ENHANCED_SCHEDULE_PROFILES", "ENHANCED_SCHEDULE_ROWS");
  const rows = generatedJson(generated, "ENHANCED_SCHEDULE_ROWS", "ENHANCED_SCHEDULES");
  const schedules = generatedJson(generated, "ENHANCED_SCHEDULES", "ENHANCED_ISSUES");

  assert.match(generated, /Generated from the 33 user-provided Enhanced Vehicles workbooks/);
  assert.ok(platforms.length >= 42);
  assert.ok(variants.length >= 450);
  assert.ok(profiles.length >= 389);
  assert.ok(Object.keys(schedules).length >= 385);
  assert.ok(Object.keys(rows).length >= 2_200, "repeated workbook rows should remain normalized into a shared library");

  for (const platform of ["VW_MK7", "VW_MK8", "E82", "F22", "F32", "G20", "G80", "AUDI_B8", "AUDI_C7", "S550", "AP1", "AP2", "XE10", "Z33", "Z34", "R35", "ZN6_SCION", "ZC6", "ZN6_TOYOTA", "A90", "W463"]) {
    assert.ok(platforms.some((candidate) => candidate.value === platform), `${platform} should be selectable`);
    assert.ok(variants.some((candidate) => candidate.platform === platform), `${platform} should have an exact variant`);
  }

  assert.equal(platforms.find((candidate) => candidate.value === "ZN6_SCION")?.label, "FR-S");
  assert.equal(platforms.find((candidate) => candidate.value === "ZN6_TOYOTA")?.label, "86");
  assert.ok(variants.some((candidate) => candidate.platform === "ZN6_TOYOTA" && candidate.trim === "GT86"));

  for (const [scheduleId, rowKeys] of Object.entries(schedules)) {
    assert.ok(profiles.some((profile) => profile.scheduleId === scheduleId), `${scheduleId} should have fitment metadata`);
    assert.ok(rowKeys.length >= 25, `${scheduleId} should retain a useful maintenance baseline`);
    assert.ok(rowKeys.every((key) => rows[key]), `${scheduleId} should resolve every normalized row`);
  }

  assert.ok(Object.values(rows).some((row) => row.name === "Engine oil & filter" && row.primaryUrl?.startsWith("https://")));
  assert.ok(Object.values(rows).some((row) => row.specification && row.amount));
});

test("enhanced known issues retain exact fitment, evidence, symptoms, actions, and clarification", async () => {
  const generated = await readFile(new URL("../lib/enhancedVehicleData.ts", import.meta.url), "utf8");
  const issues = generatedJson(generated, "ENHANCED_ISSUES", "ENHANCED_INSIGHTS");

  assert.ok(issues.length >= 1_100);
  assert.ok(issues.every((issue) => issue.platform && issue.issue && issue.evidenceLabel));
  assert.ok(issues.every((issue) => issue.symptoms && issue.preventativeAction));
  assert.ok(issues.some((issue) => issue.evidence === "Safety recall" && issue.urgency === "urgent"));
  assert.ok(issues.some((issue) => issue.scheduleIds.length > 1), "duplicate issue rows should merge without losing exact schedule fitment");
  assert.ok(issues.some((issue) => /not .*fixed|not .*interval|condition/i.test(`${issue.verification} ${issue.clarification}`)));
});

test("Keeper surfaces richer research alongside the centralized lifetime entitlement", async () => {
  const catalog = await readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8");
  const enhanced = await readFile(new URL("../lib/enhancedCatalog.ts", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const entitlements = await readFile(new URL("../src/keeperEntitlements.ts", import.meta.url), "utf8");
  const access = await readFile(new URL("../src/access.ts", import.meta.url), "utf8");

  for (const brand of ["Volkswagen", "Audi", "Ford", "Honda", "Lexus", "Nissan", "Toyota", "Scion", "Mercedes-Benz"]) {
    assert.match(catalog, new RegExp(`value: "${brand}"`));
  }
  assert.match(catalog, /Platform identifiers are catalog data, not a closed code enum/);
  assert.match(enhanced, /guidance: "factory" \| "preventive" \| "factory-and-preventive" \| "condition"/);
  assert.match(app, /Guidance type/);
  assert.match(app, /Fluid \/ specification/);
  assert.match(app, /Important clarification/);
  assert.match(app, /Ownership intelligence/);
  assert.match(app, /CONFIGURED_PROFILE_KEY = "keeper-configured-vehicle"/);
  assert.match(app, /sessionStorage\.setItem\(CONFIGURED_PROFILE_KEY, JSON\.stringify\(profile\)\)/);
  assert.match(entitlements, /KEEPER_UNLOCK_ENTITLEMENT = "keeper_unlock_v1"/);
  assert.match(entitlements, /KEEPER_UNLIMITED_ENTITLEMENT = "keeper_unlimited_v1"/);
  assert.match(entitlements, /maxVehicles: 3/);
  assert.match(access, /"Keeper Unlimited"[\s\S]*"Keeper Unlock"[\s\S]*"Keeper Free"/);
});
