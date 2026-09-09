import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getMaintenanceCatalog, getYearOptionsForTrim, type VehicleProfile } from "../lib/catalog";
import { getEnhancedScheduleIds } from "../lib/enhancedCatalog";
import { V113_PLATFORMS, V113_VARIANTS, V113_ISSUES, V113_INSIGHTS, V113_SCHEDULE_ROWS, V113_SCHEDULES } from "../lib/v113VehicleData";

test("all ten workbooks reconcile to the imported rows and source checksums", async () => {
  const audit = JSON.parse(await readFile(new URL("../docs/v1.1.3-source-audit.json", import.meta.url), "utf8"));
  assert.equal(audit.length, 10);
  assert.equal(V113_PLATFORMS.length, 10);
  assert.equal(new Set(V113_PLATFORMS.map((p) => p.value)).size, 10);
  let maintenance = 0, profiles = 0, issues = 0, insights = 0;
  for (const file of audit) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    for (const tab of Object.values(file.trims) as Array<{maintenanceRows:number; profiles:number}>) { maintenance += tab.maintenanceRows; profiles += tab.profiles; }
    issues += file.knownIssues;
    insights += (Object.values(file.supportingRows) as number[]).reduce((a,b)=>a+b,0);
  }
  assert.equal(Object.keys(V113_SCHEDULE_ROWS).length, maintenance);
  assert.equal(V113_VARIANTS.length, profiles);
  assert.equal(V113_ISSUES.length, issues);
  assert.equal(V113_INSIGHTS.length, insights);
  assert.ok(V113_ISSUES.every((i) => i.scheduleIds.every((id) => V113_SCHEDULES[id])));
  assert.deepEqual(new Set(Object.values(V113_SCHEDULES).flat()), new Set(Object.keys(V113_SCHEDULE_ROWS)));
});

test("exact trim, engine, gearbox and package schedules stay isolated", () => {
  for (const variant of V113_VARIANTS) {
    const profile = { ...variant, year: variant.yearEnd } as VehicleProfile;
    const scheduleIds = getEnhancedScheduleIds(profile);
    assert.equal(scheduleIds.length, 1, variant.scheduleId);
    assert.equal(scheduleIds[0], variant.scheduleId);
    const schedule = getMaintenanceCatalog(profile);
    assert.equal(schedule.length, V113_SCHEDULES[variant.scheduleId].length);
    assert.ok(schedule.every((item) => item.research?.sourceWorkbook === variant.sourceWorkbook));
    assert.equal(new Set(schedule.map((item) => item.slug)).size, schedule.length);
  }
});

test("new generation/trim year bounds and factory transmissions match the workbooks", () => {
  assert.deepEqual(getYearOptionsForTrim("CORVETTE_C6", "427 Convertible"), [2013]);
  assert.deepEqual(getYearOptionsForTrim("CORVETTE_C8", "ZR1X Coupe"), [2026]);
  assert.ok(!getYearOptionsForTrim("CORVETTE_C8", "Z06 Coupe").includes(2022));
  assert.ok(!getYearOptionsForTrim("MARK_II_JZX100", "Tourer V").includes(2001));
  assert.ok(V113_VARIANTS.filter((v) => v.platform === "CRESTA_JZX100").every((v) => !v.transmission.includes("manual")));
  assert.ok(V113_VARIANTS.filter((v) => v.platform === "CORVETTE_C8" && /E-Ray|ZR1X/.test(v.trim)).every((v) => v.drivetrain === "AWD"));
});
