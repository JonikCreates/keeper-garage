import assert from "node:assert/strict";
import test from "node:test";
import {
  KNOWN_ISSUES,
  getMaintenanceCatalog,
  getTransmissionOptions,
  getVehicleFamilyForPlatform,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  matchesApplicability,
  type VehicleProfile,
} from "../lib/catalog";
import { getEnhancedScheduleIds } from "../lib/enhancedCatalog";
import {
  ENHANCED_SCHEDULE_PROFILES,
  ENHANCED_SCHEDULES,
  ENHANCED_VARIANTS,
} from "../lib/enhancedVehicleData";
import type { VehicleRow } from "../src/supabase";
import { vehicleInsertFromProfile, vehicleProfileFromRow } from "../src/vehiclePersistence";
import {
  EMPTY_VEHICLE_SELECTION,
  selectVehicleBrand,
  selectVehicleFamily,
  selectVehicleVariant,
  selectVehicleYear,
  selectionFromProfile,
  vehicleSelectionIsComplete,
} from "../src/vehicleSelection";

function profile(overrides: Partial<VehicleProfile>): VehicleProfile {
  return {
    brand: "BMW",
    platform: "F10M5",
    year: 2014,
    trim: "M5",
    engineCode: "S63TU",
    drivetrain: "RWD",
    transmission: "7-speed M-DCT",
    ...overrides,
  };
}

function simulatedRow(vehicle: VehicleProfile): VehicleRow {
  return {
    ...vehicleInsertFromProfile(vehicle, {
      ownerId: "00000000-0000-4000-8000-000000000001",
      nickname: "Compatibility test",
      mileage: 1,
      isPrimary: false,
    }),
    id: "00000000-0000-4000-8000-000000000002",
    created_at: "2026-08-21T00:00:00Z",
    updated_at: "2026-08-21T00:00:00Z",
  };
}

test("BMW customer families group F10 M5 and F32/F33 without merging technical platforms", () => {
  const bmwFamilies = getVehicleFamilyOptions("BMW");
  const f10 = bmwFamilies.find((family) => family.value === "F10");
  const f32 = bmwFamilies.find((family) => family.value === "F32");

  assert.deepEqual(f10?.platforms, ["F10", "F10M5"]);
  assert.equal(f10?.label, "5 Series / M5 (F10)");
  assert.ok(!bmwFamilies.some((family) => family.value === "F10M5"));
  assert.deepEqual(f32?.platforms, ["F32", "F33"]);
  assert.equal(f32?.label, "4 Series Coupe / Convertible (F32/F33)");
  assert.ok(!bmwFamilies.some((family) => family.value === "F33"));

  const f10Variants = getVehicleVariantOptions("F10");
  assert.ok(f10Variants.some((variant) => variant.label === "M5" && variant.platform === "F10M5"));
  const fourSeries = getVehicleVariantOptions("F32");
  assert.ok(fourSeries.some((variant) => variant.label === "435i Coupe" && variant.platform === "F32"));
  assert.ok(fourSeries.some((variant) => variant.label === "435i Convertible" && variant.platform === "F33"));
  assert.deepEqual(getYearOptionsForTrim("F10M5", "M5"), [2016, 2015, 2014, 2013]);
  assert.deepEqual(getYearOptionsForTrim("F33", "435i"), [2016, 2015, 2014]);
});

test("grouped BMW variants retain exact maintenance and known-issue fitment", () => {
  const m5 = profile({});
  assert.ok(getMaintenanceCatalog(m5).some((item) => /M5-specific/i.test(`${item.description} ${item.research?.entryType}`)));
  assert.ok(KNOWN_ISSUES.some((issue) => matchesApplicability(m5, issue.appliesTo) && issue.slug.startsWith("f10m5-")));

  const coupe = profile({ platform: "F32", year: 2015, trim: "435i", engineCode: "N55", transmission: "8-speed automatic" });
  const convertible = profile({ platform: "F33", year: 2015, trim: "435i", engineCode: "N55", transmission: "8-speed automatic" });
  assert.notEqual(getEnhancedScheduleIds(coupe)[0], getEnhancedScheduleIds(convertible)[0]);
  assert.equal(getVehicleFamilyForPlatform(coupe.platform).value, "F32");
  assert.equal(getVehicleFamilyForPlatform(convertible.platform).value, "F32");
});

test("Nissan NISMO source schedules are selectable as trims with exact supported years", () => {
  const z33Variants = getVehicleVariantOptions("Z33");
  const z34Variants = getVehicleVariantOptions("Z34");
  assert.ok(z33Variants.some((variant) => variant.trim === "NISMO"));
  assert.ok(z34Variants.some((variant) => variant.trim === "NISMO"));
  assert.deepEqual(getYearOptionsForTrim("Z33", "NISMO"), [2008, 2007]);
  assert.deepEqual(getYearOptionsForTrim("Z34", "NISMO"), [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009]);
  assert.deepEqual(getTransmissionOptions("Z34", "NISMO", "RWD", 2014), ["6-speed manual"]);
  assert.deepEqual(new Set(getTransmissionOptions("Z34", "NISMO", "RWD", 2015)), new Set(["6-speed manual", "7-speed automatic"]));

  const z33Nismo = profile({ brand: "Nissan", platform: "Z33", year: 2008, trim: "NISMO", engineCode: "VQ35HR", transmission: "6-speed manual" });
  const z34Nismo = profile({ brand: "Nissan", platform: "Z34", year: 2018, trim: "NISMO", engineCode: "VQ37VHR", transmission: "7-speed automatic" });
  assert.deepEqual(getEnhancedScheduleIds(z33Nismo), ["research-z33-350z-nismo-07-08"]);
  assert.deepEqual(getEnhancedScheduleIds(z34Nismo), ["research-z34-370z-nismo-15-20-7at"]);
  assert.ok(getMaintenanceCatalog(z33Nismo).length > 0);
  assert.ok(getMaintenanceCatalog(z34Nismo).length > 0);
});

test("Nissan generated source is complete, unique, and retains every NISMO schedule", () => {
  const variants = ENHANCED_VARIANTS.filter((variant) => variant.brand === "Nissan");
  const profiles = ENHANCED_SCHEDULE_PROFILES.filter((candidate) => candidate.brand === "Nissan");
  const scheduleIds = variants.map((variant) => variant.scheduleId);
  const nismoIds = scheduleIds.filter((scheduleId) => scheduleId.includes("nismo")).sort();

  assert.equal(variants.length, 29);
  assert.equal(profiles.length, 29);
  assert.equal(new Set(scheduleIds).size, 29);
  assert.ok(profiles.every((candidate) => ENHANCED_SCHEDULES[candidate.scheduleId]?.length));
  assert.deepEqual(nismoIds, [
    "research-r35-15-16-nismo",
    "research-r35-17-19-nismo",
    "research-r35-20-21-nismo-nccb",
    "research-r35-2023-nismo-nccb",
    "research-r35-2024-nismo-nccb",
    "research-z33-350z-nismo-07-08",
    "research-z34-370z-nismo-09-14",
    "research-z34-370z-nismo-15-20-6mt",
    "research-z34-370z-nismo-15-20-7at",
  ]);
});

test("new vehicle selection remains empty and clears every downstream dependency", () => {
  assert.deepEqual(EMPTY_VEHICLE_SELECTION, { brand: null, family: null, variant: null, year: null });
  assert.equal(vehicleSelectionIsComplete(EMPTY_VEHICLE_SELECTION), false);

  const brand = selectVehicleBrand("BMW");
  assert.deepEqual(brand, { brand: "BMW", family: null, variant: null, year: null });
  const family = selectVehicleFamily(brand, "F32");
  const variant = selectVehicleVariant(family, getVehicleVariantOptions("F32")[0].value);
  const year = selectVehicleYear(variant, 2015);
  assert.equal(vehicleSelectionIsComplete(year), true);
  assert.deepEqual(selectVehicleVariant(year, variant.variant!), { ...variant, year: null });
  assert.deepEqual(selectVehicleFamily(year, "F10"), { brand: "BMW", family: "F10", variant: null, year: null });
  assert.deepEqual(selectVehicleBrand("Nissan"), { brand: "Nissan", family: null, variant: null, year: null });
});

test("existing grouped BMW and legacy Nissan garage rows still restore", () => {
  for (const vehicle of [
    profile({}),
    profile({ platform: "F32", year: 2016, trim: "435i", engineCode: "N55", transmission: "8-speed automatic" }),
    profile({ platform: "F33", year: 2016, trim: "435i", engineCode: "N55", transmission: "8-speed automatic" }),
  ]) {
    const restored = vehicleProfileFromRow(simulatedRow(vehicle));
    assert.deepEqual(restored, vehicle);
    assert.equal(selectionFromProfile(restored).family, vehicle.platform === "F10M5" ? "F10" : "F32");
  }

  const legacy = simulatedRow(profile({ brand: "Nissan", platform: "Z34", year: 2018, trim: "370Z", engineCode: "VQ37VHR", transmission: "6-speed manual" }));
  assert.equal(vehicleProfileFromRow(legacy).trim, "NISMO");
});
