import assert from "node:assert/strict";
import test from "node:test";
import {
  BRAND_OPTIONS,
  KNOWN_ISSUES,
  getEngineOptions,
  getMaintenanceCatalog,
  getTransmissionOptions,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  matchesApplicability,
  type VehicleProfile,
} from "../lib/catalog";
import { getEnhancedScheduleIds, getOwnershipInsights } from "../lib/enhancedCatalog";
import {
  TYPE_R_INSIGHTS,
  TYPE_R_ISSUES,
  TYPE_R_PLATFORMS,
  TYPE_R_SCHEDULE_PROFILES,
  TYPE_R_SCHEDULE_ROWS,
  TYPE_R_SCHEDULES,
  TYPE_R_VARIANTS,
} from "../lib/typeRVehicleData";
import type { VehicleRow } from "../src/supabase";
import { vehicleInsertFromProfile, vehicleProfileFromRow } from "../src/vehiclePersistence";

const de5: VehicleProfile = {
  brand: "Acura",
  platform: "DE5",
  year: 2025,
  trim: "Integra Type S",
  engineCode: "K20C1",
  drivetrain: "FWD",
  transmission: "6-speed manual",
};

const fl5: VehicleProfile = {
  brand: "Honda",
  platform: "FL5",
  year: 2024,
  trim: "Civic Type R",
  engineCode: "K20C1",
  drivetrain: "FWD",
  transmission: "6-speed manual",
};

test("DE5 and FL5 workbook imports are complete and internally linked", () => {
  assert.deepEqual(TYPE_R_PLATFORMS.map((platform) => platform.value), ["DE5", "FL5"]);
  assert.equal(TYPE_R_VARIANTS.length, 2);
  assert.equal(TYPE_R_SCHEDULE_PROFILES.length, 2);
  assert.equal(Object.keys(TYPE_R_SCHEDULE_ROWS).length, 101);
  assert.equal(TYPE_R_ISSUES.length, 45);
  assert.equal(TYPE_R_INSIGHTS.length, 55);

  assert.equal(TYPE_R_SCHEDULES["type-r-de5-integra-type-s-k20c1-6mt"].length, 51);
  assert.equal(TYPE_R_SCHEDULES["type-r-fl5-civic-type-r-k20c1-6mt"].length, 50);
  assert.ok(Object.values(TYPE_R_SCHEDULES).flat().every((rowKey) => TYPE_R_SCHEDULE_ROWS[rowKey]));
  assert.ok(TYPE_R_ISSUES.every((issue) => issue.scheduleIds.every((scheduleId) => TYPE_R_SCHEDULES[scheduleId])));
});

test("Type R selectors expose exact model-specific fitment", () => {
  assert.ok(BRAND_OPTIONS.some((brand) => brand.value === "Acura"));
  assert.deepEqual(getVehicleFamilyOptions("Acura").find((family) => family.value === "DE5")?.platforms, ["DE5"]);
  assert.deepEqual(getVehicleFamilyOptions("Honda").find((family) => family.value === "FL5")?.platforms, ["FL5"]);
  assert.ok(getVehicleVariantOptions("DE5").some((variant) => variant.label === "Integra Type S"));
  assert.ok(getVehicleVariantOptions("FL5").some((variant) => variant.label === "Civic Type R"));
  assert.deepEqual(getYearOptionsForTrim("DE5", "Integra Type S"), [2026, 2025, 2024]);
  assert.deepEqual(getYearOptionsForTrim("FL5", "Civic Type R"), [2026, 2025, 2024, 2023]);
  assert.deepEqual(getTransmissionOptions("DE5", "Integra Type S", "FWD", 2025), ["6-speed manual"]);
  assert.deepEqual(getEngineOptions("FL5", "Civic Type R", 2024, "6-speed manual"), ["K20C1"]);
});

test("shared K20C1 architecture does not leak DE5 and FL5 records across models", () => {
  assert.deepEqual(getEnhancedScheduleIds(de5), ["type-r-de5-integra-type-s-k20c1-6mt"]);
  assert.deepEqual(getEnhancedScheduleIds(fl5), ["type-r-fl5-civic-type-r-k20c1-6mt"]);

  const de5Maintenance = getMaintenanceCatalog(de5);
  const fl5Maintenance = getMaintenanceCatalog(fl5);
  assert.equal(de5Maintenance.length, 51);
  assert.equal(fl5Maintenance.length, 50);
  assert.ok(de5Maintenance.some((item) => item.name === "AcuraLink / ELS / premium electronics"));
  assert.ok(!fl5Maintenance.some((item) => item.name === "AcuraLink / ELS / premium electronics"));
  assert.ok(fl5Maintenance.some((item) => item.name === "2023 driver-seat frame recall area"));
  assert.ok(!de5Maintenance.some((item) => item.name === "2023 driver-seat frame recall area"));

  const de5Issues = KNOWN_ISSUES.filter((issue) => matchesApplicability(de5, issue.appliesTo));
  const fl5Issues = KNOWN_ISSUES.filter((issue) => matchesApplicability(fl5, issue.appliesTo));
  assert.equal(de5Issues.filter((issue) => issue.sourceWorkbook?.startsWith("Acura-Integra")).length, 22);
  assert.equal(fl5Issues.filter((issue) => issue.sourceWorkbook?.startsWith("Honda-Civic")).length, 23);
  assert.ok(getOwnershipInsights(de5).every((insight) => insight.platform === "DE5"));
  assert.ok(getOwnershipInsights(fl5).every((insight) => insight.platform === "FL5"));
});

test("Type R profiles survive the garage persistence round trip", () => {
  for (const [index, profile] of [de5, fl5].entries()) {
    const inserted = vehicleInsertFromProfile(profile, {
      ownerId: "00000000-0000-4000-8000-000000000001",
      nickname: `Type R ${index}`,
      mileage: 1,
      isPrimary: false,
    });
    const row: VehicleRow = {
      ...inserted,
      id: `00000000-0000-4000-8000-00000000000${index + 2}`,
      created_at: "2026-09-02T00:00:00Z",
      updated_at: "2026-09-02T00:00:00Z",
    };
    assert.deepEqual(vehicleProfileFromRow(row), profile);
  }
});
