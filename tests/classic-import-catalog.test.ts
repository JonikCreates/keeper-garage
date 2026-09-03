import assert from "node:assert/strict";
import test from "node:test";
import {
  getEngineOptions,
  getMaintenanceCatalog,
  getTransmissionOptions,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  type VehicleProfile,
} from "../lib/catalog";
import { getEnhancedScheduleIds, getOwnershipInsights } from "../lib/enhancedCatalog";
import {
  CLASSIC_IMPORT_INSIGHTS,
  CLASSIC_IMPORT_ISSUES,
  CLASSIC_IMPORT_PLATFORMS,
  CLASSIC_IMPORT_SCHEDULE_PROFILES,
  CLASSIC_IMPORT_SCHEDULE_ROWS,
  CLASSIC_IMPORT_SCHEDULES,
  CLASSIC_IMPORT_VARIANTS,
} from "../lib/classicImportVehicleData";
import type { VehicleRow } from "../src/supabase";
import { vehicleInsertFromProfile, vehicleProfileFromRow } from "../src/vehiclePersistence";

const profile = (overrides: Partial<VehicleProfile>): VehicleProfile => ({
  brand: "BMW",
  platform: "E30",
  year: 1990,
  trim: "325i Coupe",
  engineCode: "M20B25",
  drivetrain: "RWD",
  transmission: "5-speed manual",
  ...overrides,
});

test("the four supplied workbooks are complete and internally linked", () => {
  assert.deepEqual(CLASSIC_IMPORT_PLATFORMS.map((platform) => platform.value), ["E30", "E38", "E60", "E61", "DC5"]);
  assert.equal(CLASSIC_IMPORT_VARIANTS.length, 75);
  assert.equal(CLASSIC_IMPORT_SCHEDULE_PROFILES.length, 75);
  assert.equal(Object.keys(CLASSIC_IMPORT_SCHEDULES).length, 75);
  assert.equal(Object.keys(CLASSIC_IMPORT_SCHEDULE_ROWS).length, 2_649);
  assert.equal(CLASSIC_IMPORT_ISSUES.length, 725);
  assert.equal(CLASSIC_IMPORT_INSIGHTS.length, 95);

  const scheduleIds = new Set(CLASSIC_IMPORT_SCHEDULE_PROFILES.map((entry) => entry.scheduleId));
  assert.equal(scheduleIds.size, 75);
  assert.ok(CLASSIC_IMPORT_VARIANTS.every((variant) => scheduleIds.has(variant.scheduleId)));
  assert.ok(Object.entries(CLASSIC_IMPORT_SCHEDULES).every(([scheduleId, rows]) =>
    scheduleIds.has(scheduleId) && rows.length > 0 && rows.every((row) => CLASSIC_IMPORT_SCHEDULE_ROWS[row])));
  assert.ok(CLASSIC_IMPORT_ISSUES.every((issue) => issue.scheduleIds.length > 0
    && issue.scheduleIds.every((scheduleId) => scheduleIds.has(scheduleId))));
});

test("E30 and E38 engine eras retain exact year and transmission routing", () => {
  assert.deepEqual(getYearOptionsForTrim("E30", "318i Sedan"), [1991, 1985, 1984]);
  assert.deepEqual(getEngineOptions("E30", "318i Sedan", 1985, "5-speed manual"), ["M10B18"]);
  assert.deepEqual(getEngineOptions("E30", "318i Sedan", 1991, "5-speed manual"), ["M42B18"]);
  assert.deepEqual(getTransmissionOptions("E30", "M3 Coupe", "RWD", 1990), ["5-speed manual"]);

  assert.deepEqual(getEngineOptions("E38", "740i Sedan", 1995, "5-speed automatic"), ["M60B40"]);
  assert.deepEqual(getEngineOptions("E38", "740i Sedan", 1997, "5-speed automatic"), ["M62B44"]);
  assert.deepEqual(getEngineOptions("E38", "740i Sedan", 2000, "5-speed automatic"), ["M62TUB44"]);
  assert.ok(getMaintenanceCatalog(profile({ platform: "E30", year: 1988, trim: "325 Coupe", engineCode: "M20B27", transmission: "4-speed automatic" }))
    .some((item) => item.name === "M20 timing belt"));
});

test("E60 sedans and E61 wagons share one family without losing body-specific fitment", () => {
  const family = getVehicleFamilyOptions("BMW").find((entry) => entry.value === "E60");
  assert.equal(family?.label, "5 Series / M5 (E60/E61)");
  assert.deepEqual(family?.platforms, ["E60", "E61"]);
  const variants = getVehicleVariantOptions("E60");
  assert.ok(variants.some((variant) => variant.platform === "E60" && variant.label === "M5 Sedan"));
  assert.ok(variants.some((variant) => variant.platform === "E61" && variant.label === "535xi Sports Wagon"));
  assert.deepEqual(getTransmissionOptions("E60", "M5 Sedan", "RWD", 2006), ["7-speed SMG III"]);
  assert.deepEqual(new Set(getTransmissionOptions("E60", "M5 Sedan", "RWD", 2008)), new Set(["7-speed SMG III", "6-speed manual"]));

  const wagon = profile({ platform: "E61", year: 2009, trim: "535xi Sports Wagon", engineCode: "N54", drivetrain: "AWD", transmission: "6-speed automatic" });
  const sedan = profile({ platform: "E60", year: 2009, trim: "535xi Sedan", engineCode: "N54", drivetrain: "AWD", transmission: "6-speed automatic" });
  assert.ok(getMaintenanceCatalog(wagon).some((item) => item.name === "Rear self-leveling air suspension / EHC"));
  assert.ok(!getMaintenanceCatalog(sedan).some((item) => item.name === "Rear self-leveling air suspension / EHC"));
  assert.ok(getOwnershipInsights(wagon).some((insight) => insight.title === "E61 Touring body systems"));
  assert.ok(!getOwnershipInsights(sedan).some((insight) => insight.title === "E61 Touring body systems"));
});

test("DC5 Type-S routes K20A2 and K20Z1 by model year while sharing the source schedule", () => {
  const early = profile({ brand: "Acura", platform: "DC5", year: 2003, trim: "RSX Type-S", engineCode: "K20A2", drivetrain: "FWD", transmission: "6-speed manual" });
  const late = profile({ brand: "Acura", platform: "DC5", year: 2006, trim: "RSX Type-S", engineCode: "K20Z1", drivetrain: "FWD", transmission: "6-speed manual" });
  assert.deepEqual(getEngineOptions("DC5", "RSX Type-S", 2003, "6-speed manual"), ["K20A2"]);
  assert.deepEqual(getEngineOptions("DC5", "RSX Type-S", 2006, "6-speed manual"), ["K20Z1"]);
  assert.deepEqual(getEnhancedScheduleIds(early), ["keeper-dc5-rsx-type-s-dc5-k20a2-6mt-2002-2004"]);
  assert.deepEqual(getEnhancedScheduleIds(late), ["keeper-dc5-rsx-type-s-dc5-k20z1-6mt-2005-2006"]);
  assert.ok(getMaintenanceCatalog(early).some((item) => item.name === "Engine oil & filter"));
  assert.ok(getMaintenanceCatalog(late).some((item) => item.name === "Engine oil & filter"));
});

test("representative imported profiles survive garage persistence", () => {
  const profiles = [
    profile({ platform: "E38", year: 2001, trim: "750iL Sedan", engineCode: "M73B54", transmission: "5-speed automatic" }),
    profile({ platform: "E60", year: 2008, trim: "M5 Sedan", engineCode: "S85B50", transmission: "6-speed manual" }),
    profile({ platform: "E61", year: 2007, trim: "530xi Sports Wagon", engineCode: "N52", drivetrain: "AWD", transmission: "6-speed manual" }),
    profile({ brand: "Acura", platform: "DC5", year: 2005, trim: "RSX Type-S", engineCode: "K20Z1", drivetrain: "FWD", transmission: "6-speed manual" }),
  ];
  for (const [index, vehicle] of profiles.entries()) {
    const inserted = vehicleInsertFromProfile(vehicle, {
      ownerId: "00000000-0000-4000-8000-000000000001",
      nickname: `Workbook import ${index}`,
      mileage: 1,
      isPrimary: false,
    });
    const row: VehicleRow = {
      ...inserted,
      id: `00000000-0000-4000-8000-0000000000${index + 10}`,
      created_at: "2026-09-03T00:00:00Z",
      updated_at: "2026-09-03T00:00:00Z",
    };
    assert.deepEqual(vehicleProfileFromRow(row), vehicle);
  }
});
