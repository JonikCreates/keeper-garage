import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  COMMUNITY_WORKBOOK_INSIGHTS,
  COMMUNITY_WORKBOOK_ISSUES,
  COMMUNITY_WORKBOOK_PLATFORMS,
  COMMUNITY_WORKBOOK_SCHEDULE_PROFILES,
  COMMUNITY_WORKBOOK_SCHEDULE_ROWS,
  COMMUNITY_WORKBOOK_SCHEDULES,
  COMMUNITY_WORKBOOK_VARIANTS,
} from "../lib/communityWorkbookVehicleData";
import {
  KNOWN_ISSUES,
  getMaintenanceCatalog,
  getTransmissionOptions,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  matchesApplicability,
  type VehicleProfile,
} from "../lib/catalog";
import { getEnhancedScheduleIds, getOwnershipInsights } from "../lib/enhancedCatalog";
import type { VehicleRow } from "../src/supabase";
import { vehicleInsertFromProfile, vehicleProfileFromRow } from "../src/vehiclePersistence";

const profile = (overrides: Partial<VehicleProfile>): VehicleProfile => ({
  brand: "Nissan",
  platform: "S13_180SX",
  year: 1989,
  trim: "180SX Type I/II",
  engineCode: "CA18DET",
  drivetrain: "RWD",
  transmission: "5-speed manual",
  ...overrides,
});

const maintenanceByName = (vehicle: VehicleProfile, name: string) =>
  getMaintenanceCatalog(vehicle).find((item) => item.name === name);

test("all five supplied workbooks remain complete and connected after normalization", () => {
  assert.deepEqual(COMMUNITY_WORKBOOK_PLATFORMS, [
    { value: "S13_180SX", brand: "Nissan", label: "180SX (S13)", yearStart: 1989, yearEnd: 1998 },
    { value: "S13_240SX", brand: "Nissan", label: "240SX (S13)", yearStart: 1989, yearEnd: 1994 },
    { value: "S14_SILVIA", brand: "Nissan", label: "Silvia (S14)", yearStart: 1993, yearEnd: 1998 },
    { value: "S14_240SX", brand: "Nissan", label: "240SX (S14)", yearStart: 1995, yearEnd: 1998 },
    { value: "981", brand: "Porsche", label: "Boxster / Cayman (981)", yearStart: 2013, yearEnd: 2016 },
    { value: "987", brand: "Porsche", label: "Boxster / Cayman (987)", yearStart: 2005, yearEnd: 2012 },
    { value: "E70_35D", brand: "BMW", label: "X5 xDrive35d (E70)", yearStart: 2009, yearEnd: 2013 },
  ]);
  assert.equal(COMMUNITY_WORKBOOK_VARIANTS.length, 88);
  assert.equal(COMMUNITY_WORKBOOK_SCHEDULE_PROFILES.length, 88);
  assert.equal(Object.keys(COMMUNITY_WORKBOOK_SCHEDULES).length, 88);
  assert.equal(Object.keys(COMMUNITY_WORKBOOK_SCHEDULE_ROWS).length, 296);
  assert.equal(COMMUNITY_WORKBOOK_ISSUES.length, 462);
  assert.equal(COMMUNITY_WORKBOOK_INSIGHTS.length, 204);

  const counts = Object.fromEntries(Object.entries(Object.groupBy(COMMUNITY_WORKBOOK_VARIANTS, (variant) => variant.platform))
    .map(([platform, records]) => [platform, records?.length ?? 0]));
  assert.deepEqual(counts, { S13_180SX: 18, S13_240SX: 7, S14_SILVIA: 18, S14_240SX: 6, "981": 14, "987": 22, E70_35D: 3 });
  assert.ok(Object.values(COMMUNITY_WORKBOOK_SCHEDULES).every((rowKeys) => rowKeys.length >= 20));
  assert.ok(Object.values(COMMUNITY_WORKBOOK_SCHEDULES).flat().every((rowKey) => COMMUNITY_WORKBOOK_SCHEDULE_ROWS[rowKey]));
  assert.ok(COMMUNITY_WORKBOOK_ISSUES.every((issue) => issue.scheduleIds.every((scheduleId) => COMMUNITY_WORKBOOK_SCHEDULES[scheduleId])));
  assert.ok(COMMUNITY_WORKBOOK_INSIGHTS.every((insight) => insight.title && insight.summary && insight.sourceWorkbook));
});

test("S13 and S14 market, engine, transmission, HICAS, body, and special-edition splits stay exact", () => {
  const ca18 = profile({});
  assert.deepEqual(getEnhancedScheduleIds(ca18), ["research-s13-180sx-180-ca18-89-90-5mt"]);
  assert.equal(maintenanceByName(ca18, "Engine oil & filter")?.oem.mileage, 3107);
  assert.match(maintenanceByName(ca18, "Manual transmission fluid")?.research?.fluidSpecification ?? "", /GL-4/i);

  const convertible = profile({
    platform: "S13_240SX",
    year: 1994,
    trim: "240SX SE/LE Convertible",
    engineCode: "KA24DE",
    transmission: "4-speed automatic",
  });
  assert.deepEqual(getTransmissionOptions(convertible.platform, convertible.trim, convertible.drivetrain, convertible.year), ["4-speed automatic"]);
  assert.deepEqual(getEnhancedScheduleIds(convertible), ["research-s13-240sx-240-convertible-92-94-4at"]);
  assert.ok(getMaintenanceCatalog(convertible).some((item) => /convertible/i.test(`${item.name} ${item.description} ${item.research?.notes}`)));

  const nismo = profile({
    platform: "S14_SILVIA",
    year: 1994,
    trim: "NISMO 270R",
    engineCode: "SR20DET",
    transmission: "5-speed manual",
  });
  assert.deepEqual(getTransmissionOptions(nismo.platform, nismo.trim, nismo.drivetrain, nismo.year), ["5-speed manual"]);
  assert.deepEqual(getEnhancedScheduleIds(nismo), ["research-s14-silvia-nismo-270r-1994"]);
  assert.ok(getMaintenanceCatalog(nismo).some((item) => /270R/i.test(`${item.description} ${item.research?.notes} ${item.research?.verification}`)));

  const us240 = getVehicleFamilyOptions("Nissan").filter((family) => /240SX/.test(family.label));
  assert.deepEqual(us240.map((family) => family.value), ["S13_240SX", "S14_240SX"]);
  assert.ok(getVehicleVariantOptions("S14_SILVIA").some((variant) => variant.trim === "Autech Version K's MF-T"));
});

test("981 and 987 variants receive transmission-, generation-, body-, and GT-specific maintenance", () => {
  const base981 = profile({ brand: "Porsche", platform: "981", year: 2015, trim: "Cayman Base", engineCode: "MA1.22", transmission: "7-speed PDK" });
  const gt4 = profile({ brand: "Porsche", platform: "981", year: 2016, trim: "Cayman GT4", engineCode: "MA1-derived", transmission: "6-speed manual" });
  assert.equal(maintenanceByName(base981, "Spark plugs")?.oem.mileage, 36000);
  assert.equal(maintenanceByName(gt4, "Spark plugs")?.oem.mileage, 28000);
  assert.ok(maintenanceByName(base981, "PDK clutch fluid"));
  assert.equal(maintenanceByName(gt4, "PDK clutch fluid"), undefined);

  assert.deepEqual(getTransmissionOptions("981", "Boxster Spyder", "RWD", 2016), ["6-speed manual"]);
  assert.deepEqual(new Set(getTransmissionOptions("987", "Boxster Spyder — 987.2", "RWD", 2011)), new Set(["6-speed manual", "7-speed PDK"]));

  const early987 = profile({ brand: "Porsche", platform: "987", year: 2007, trim: "Boxster S — 987.1 3.4L", engineCode: "M97.21", transmission: "6-speed manual" });
  const late987 = profile({ brand: "Porsche", platform: "987", year: 2011, trim: "Boxster S — 987.2", engineCode: "MA1.21", transmission: "7-speed PDK" });
  const earlyIssues = KNOWN_ISSUES.filter((issue) => matchesApplicability(early987, issue.appliesTo));
  const lateIssues = KNOWN_ISSUES.filter((issue) => matchesApplicability(late987, issue.appliesTo));
  assert.ok(earlyIssues.some((issue) => /IMS bearing/i.test(issue.issue)));
  assert.ok(earlyIssues.some((issue) => /bore scoring/i.test(issue.issue)));
  assert.ok(!lateIssues.some((issue) => /IMS bearing/i.test(issue.issue)));
  assert.ok(maintenanceByName(late987, "Automatic / PDK clutch fluid"));
  assert.equal(maintenanceByName(early987, "Automatic / PDK clutch fluid"), undefined);
  assert.ok(getOwnershipInsights(late987).some((insight) => insight.slug === "987-official-spyder-and-cayman-r-fitment"));
});

test("E70 production periods preserve diesel, xDrive, campaign, fluid, and persistence behavior", () => {
  const e70 = profile({
    brand: "BMW",
    platform: "E70_35D",
    year: 2011,
    trim: "xDrive35d",
    engineCode: "M57Y",
    drivetrain: "xDrive",
    transmission: "6-speed automatic",
  });
  assert.deepEqual(getEnhancedScheduleIds(e70), ["research-e70-35d-35d-2011"]);
  assert.equal(maintenanceByName(e70, "Engine oil & filter")?.oem.mileage, 10000);
  assert.match(maintenanceByName(e70, "Engine oil & filter")?.research?.fluidSpecification ?? "", /LL-04/i);
  assert.equal(maintenanceByName(e70, "GA6HP26Z automatic transmission fluid & pan/filter")?.community.mileage, 50000);
  assert.ok(maintenanceByName(e70, "ATC700 transfer-case fluid"));
  assert.ok(maintenanceByName(e70, "SCR supply module"));
  assert.ok(KNOWN_ISSUES.some((issue) => matchesApplicability(e70, issue.appliesTo) && /SCR supply/i.test(issue.issue)));

  const inserted = vehicleInsertFromProfile(e70, {
    ownerId: "00000000-0000-4000-8000-000000000001",
    nickname: "E70 workbook test",
    mileage: 100000,
    isPrimary: false,
  });
  const row: VehicleRow = {
    ...inserted,
    id: "00000000-0000-4000-8000-000000000002",
    created_at: "2026-08-28T00:00:00Z",
    updated_at: "2026-08-28T00:00:00Z",
  };
  assert.deepEqual(vehicleProfileFromRow(row), e70);
});

test("the database fitment migration includes every newly selectable workbook configuration", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260828200000_validate_catalog_fitments.sql", import.meta.url), "utf8");
  assert.match(migration, /keeper-catalog-count: 2088/);
  assert.match(migration, /keeper-catalog-sha256: 8b5329e9eea82c4d811ca11ac114d4ab46811d5ab6de73daa0bf442b8c8a5fd7/);
  for (const expected of [
    '"model": "180SX (S13)"',
    '"model": "Silvia (S14)"',
    '"model": "Boxster / Cayman (981)"',
    '"model": "Boxster / Cayman (987)"',
    '"model": "X5 xDrive35d (E70)"',
    '"trim": "Boxster Spyder — 987.2"',
  ]) assert.ok(migration.includes(expected), `migration should contain ${expected}`);
});
