import assert from "node:assert/strict";
import test from "node:test";
import {
  KNOWN_ISSUES,
  LEGACY_SAVED_PROFILE_SCHEDULE_IDS,
  dedupeEngineOptionsByLabel,
  getEngineLabel,
  getEngineOptions,
  getMaintenanceCatalog,
  getTransmissionOptions,
  getVehicleFamilyForPlatform,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  isPrePurchaseIssue,
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

test("BMW customer families group each regular and M chassis consistently without merging technical platforms", () => {
  const bmwFamilies = getVehicleFamilyOptions("BMW");
  const f10 = bmwFamilies.find((family) => family.value === "F10");
  const f22 = bmwFamilies.find((family) => family.value === "F22");
  const f30 = bmwFamilies.find((family) => family.value === "F30");
  const f32 = bmwFamilies.find((family) => family.value === "F32");

  assert.deepEqual(f10?.platforms, ["F10", "F10M5"]);
  assert.equal(f10?.label, "5 Series / M5 (F10)");
  assert.ok(!bmwFamilies.some((family) => family.value === "F10M5"));
  assert.deepEqual(f22?.platforms, ["F22", "F87"]);
  assert.deepEqual(f30?.platforms, ["F30", "F80"]);
  assert.deepEqual(f32?.platforms, ["F32", "F33", "F82", "F83"]);
  assert.equal(f32?.label, "4 Series / M4 (F32/F33/F82/F83)");
  for (const groupedPlatform of ["F10M5", "F87", "F80", "F33", "F82", "F83", "G80", "G82", "G87"]) {
    assert.ok(!bmwFamilies.some((family) => family.value === groupedPlatform));
  }

  const f10Variants = getVehicleVariantOptions("F10");
  assert.ok(f10Variants.some((variant) => variant.label === "M5" && variant.platform === "F10M5"));
  const fourSeries = getVehicleVariantOptions("F32");
  assert.ok(fourSeries.some((variant) => variant.label === "435i Coupe" && variant.platform === "F32"));
  assert.ok(fourSeries.some((variant) => variant.label === "435i Convertible" && variant.platform === "F33"));
  assert.ok(fourSeries.some((variant) => variant.label === "M4 Coupe" && variant.platform === "F82"));
  assert.ok(fourSeries.some((variant) => variant.label === "M4 Convertible" && variant.platform === "F83"));
  assert.deepEqual(getYearOptionsForTrim("F10M5", "M5"), [2016, 2015, 2014, 2013]);
  assert.deepEqual(getYearOptionsForTrim("F33", "435i"), [2016, 2015, 2014]);
});

test("corrected public names and the F22 230i engine mapping stay unambiguous", () => {
  const toyotaFamily = getVehicleFamilyOptions("Toyota").find((family) => family.value === "ZN6_TOYOTA");
  const scionFamily = getVehicleFamilyOptions("Scion").find((family) => family.value === "ZN6_SCION");
  assert.equal(toyotaFamily?.label, "GT86 (First gen ZN6)");
  assert.equal(scionFamily?.label, "FR-S");
  assert.ok(getVehicleVariantOptions("ZN6_TOYOTA").some((variant) => variant.trim === "GT86" && variant.label === "GT86"));
  assert.deepEqual(getEngineOptions("F22", "230i", 2019, "8-speed automatic"), ["B46"]);
});

test("E46 M3 coupe and convertible are separate body-style variants", () => {
  const e46Variants = getVehicleVariantOptions("E46");
  assert.ok(e46Variants.some((variant) => variant.trim === "M3" && variant.label === "M3 Coupe"));
  assert.ok(e46Variants.some((variant) => variant.trim === "M3Cic" && variant.label === "M3 Convertible"));
  assert.ok(!e46Variants.some((variant) => variant.label === "M3 Coupe / Convertible"));
  assert.deepEqual(getYearOptionsForTrim("E46", "M3"), [2006, 2005, 2004, 2003, 2002, 2001]);
  assert.deepEqual(getYearOptionsForTrim("E46", "M3Cic"), [2006, 2005, 2004, 2003, 2002, 2001]);

  const coupe = profile({ platform: "E46", year: 2004, trim: "M3", engineCode: "S54B32", transmission: "6-speed manual" });
  const convertible = profile({ platform: "E46", year: 2004, trim: "M3Cic", engineCode: "S54B32", transmission: "6-speed manual" });
  assert.ok(!getMaintenanceCatalog(coupe).some((item) => item.name === "Convertible top hydraulics, tension components & drains"));
  assert.ok(getMaintenanceCatalog(convertible).some((item) => item.name === "Convertible top hydraulics, tension components & drains"));
  assert.deepEqual(vehicleProfileFromRow(simulatedRow(coupe)), coupe);
  assert.deepEqual(vehicleProfileFromRow(simulatedRow(convertible)), convertible);
});

test("selector labels stay concise without changing workbook-backed trim identifiers", () => {
  const bmwE82 = getVehicleFamilyOptions("BMW").find((family) => family.value === "E82");
  assert.equal(bmwE82?.label, "1 Series (E82/E88)");
  const e82 = profile({ brand: "BMW", platform: "E82", year: 2011, trim: "128i", engineCode: "N52K", transmission: "6-speed manual" });
  const savedE82 = simulatedRow(e82);
  assert.equal(savedE82.model, "1 Series (E82 and E88)");
  assert.deepEqual(vehicleProfileFromRow(savedE82), e82);

  const engineCodes = getEngineOptions("E82", "128i", 2009, "6-speed manual");
  const visibleEngines = dedupeEngineOptionsByLabel(engineCodes.map((engineCode) => ({
    value: engineCode,
    label: getEngineLabel(profile({ platform: "E82", year: 2009, trim: "128i", engineCode, transmission: "6-speed manual" })),
  })), "N52K");
  assert.deepEqual(engineCodes, ["N51", "N52K", "N52"]);
  assert.deepEqual(visibleEngines, [{
    value: "N52K",
    label: "N51/N52K 3.0L NA I6",
    compatibleValues: ["N51", "N52K", "N52"],
  }]);

  const mazdaNc = getVehicleVariantOptions("NC");
  assert.deepEqual(new Set(mazdaNc.map((variant) => variant.label)), new Set(["NC1", "NC2", "NC3"]));
  assert.ok(mazdaNc.some((variant) => variant.trim === "MX-5 Miata · NC1" && variant.label === "NC1"));

  const mustang = getVehicleVariantOptions("S550");
  for (const label of ["V6", "EcoBoost", "GT", "Bullitt", "Mach 1", "Shelby GT350 / GT350R", "Shelby GT500"]) {
    assert.ok(mustang.some((variant) => variant.label === label), `${label} should remain selectable`);
  }
  assert.ok(mustang.some((variant) => variant.trim === "Mustang GT" && variant.label === "GT"));
  assert.ok(mustang.every((variant) => !variant.label.startsWith("Mustang ")));
});

test("Subaru BRZ generations and special editions retain exact year and schedule fitment", () => {
  const brzFamilies = getVehicleFamilyOptions("Subaru").filter((family) => ["ZC6", "ZD8"].includes(family.value));
  assert.deepEqual(brzFamilies.map((family) => family.label), [
    "BRZ (ZC6)",
    "BRZ (ZD8)",
  ]);
  assert.deepEqual(getVehicleVariantOptions("ZC6").map((variant) => variant.label), ["All trims"]);

  const zd8 = getVehicleVariantOptions("ZD8");
  assert.deepEqual(new Set(zd8.map((variant) => variant.label)), new Set(["Standard", "tS", "Series.Purple", "Series.Yellow"]));
  assert.deepEqual(getYearOptionsForTrim("ZD8", "tS"), [2026, 2025, 2024]);
  assert.deepEqual(getYearOptionsForTrim("ZD8", "Series.Purple"), [2025]);
  assert.deepEqual(getYearOptionsForTrim("ZD8", "Series.Yellow"), [2026]);
  assert.deepEqual(getTransmissionOptions("ZD8", "Series.Yellow", "RWD", 2026), ["6-speed manual"]);

  const yellow = profile({ brand: "Subaru", platform: "ZD8", year: 2026, trim: "Series.Yellow", engineCode: "FA24D", transmission: "6-speed manual" });
  const gr86 = profile({ brand: "Toyota", platform: "ZN8", year: 2024, trim: "Second gen", engineCode: "FA24D", transmission: "6-speed manual" });
  assert.deepEqual(getEnhancedScheduleIds(yellow), ["research-zd8-brz-ts-24-26-6mt"]);
  assert.equal(getMaintenanceCatalog(yellow).find((item) => item.name === "Engine oil & filter")?.oem.mileage, 6000);
  assert.equal(getMaintenanceCatalog(gr86).find((item) => item.name === "Engine oil & filter")?.oem.mileage, 7500);
  assert.notEqual(getEnhancedScheduleIds(yellow)[0], getEnhancedScheduleIds(gr86)[0]);
  assert.ok(getMaintenanceCatalog(yellow).length >= 40);
  assert.ok(KNOWN_ISSUES.some((issue) => matchesApplicability(yellow, issue.appliesTo)));

  const legacyZc6 = profile({ brand: "Subaru", platform: "ZC6", year: 2017, trim: "BRZ", engineCode: "FA20", transmission: "6-speed manual" });
  assert.deepEqual(vehicleProfileFromRow(simulatedRow(legacyZc6)), legacyZc6);
});

test("E9X selector uses the body-specific workbook while legacy saved profiles remain compatible", () => {
  const family = getVehicleFamilyOptions("BMW").find((candidate) => candidate.value === "E9X");
  assert.equal(family?.label, "3 Series / M3 (E90/E91/E92/E93)");
  assert.deepEqual(family?.platforms, ["E90", "E91", "E92", "E93", "E9X"]);

  const variants = getVehicleVariantOptions("E9X");
  for (const [platform, label] of [
    ["E90", "M3 Sedan"],
    ["E92", "M3 Coupe"],
    ["E93", "M3 Convertible"],
    ["E91", "328i Sports Wagon"],
  ]) {
    assert.ok(variants.some((variant) => variant.platform === platform && variant.label === label));
  }
  assert.ok(!variants.some((variant) => variant.platform === "E9X"));
  assert.deepEqual(getYearOptionsForTrim("E92", "M3 Coupe"), [2013, 2012, 2011, 2010, 2009, 2008]);

  const coupe = profile({ platform: "E92", year: 2011, trim: "M3 Coupe", engineCode: "S65", transmission: "7-speed M DCT" });
  assert.deepEqual(getEnhancedScheduleIds(coupe), ["e9x-e92-m3-coupe-s65-m3-dct"]);
  assert.ok(getMaintenanceCatalog(coupe).length >= 40);
  assert.deepEqual(vehicleProfileFromRow(simulatedRow(coupe)), coupe);

  const legacy = profile({ platform: "E9X", year: 2011, trim: "M3", engineCode: "S65", transmission: "7-speed M DCT" });
  assert.deepEqual(vehicleProfileFromRow(simulatedRow(legacy)), legacy);
  assert.ok(getMaintenanceCatalog(legacy).length > 0);
  assert.ok(LEGACY_SAVED_PROFILE_SCHEDULE_IDS.includes("research-e9x-s65-m3-dct"));
});

test("PPI-tagged research can be identified for older platforms", () => {
  assert.ok(KNOWN_ISSUES.some((issue) => issue.appliesTo.platforms?.includes("R32") && isPrePurchaseIssue(issue)));
  assert.ok(KNOWN_ISSUES.some((issue) => issue.appliesTo.platforms?.includes("R33") && isPrePurchaseIssue(issue)));
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

  const legacyToyota = simulatedRow(profile({ brand: "Toyota", platform: "ZN6_TOYOTA", year: 2019, trim: "GT86", engineCode: "FA20", transmission: "6-speed manual" }));
  legacyToyota.model = "86 (first generation)";
  legacyToyota.trim = "86";
  assert.deepEqual(vehicleProfileFromRow(legacyToyota), profile({ brand: "Toyota", platform: "ZN6_TOYOTA", year: 2019, trim: "GT86", engineCode: "FA20", transmission: "6-speed manual" }));

  const legacyBrz = simulatedRow(profile({ brand: "Subaru", platform: "ZC6", year: 2019, trim: "BRZ", engineCode: "FA20", transmission: "6-speed manual" }));
  legacyBrz.model = "BRZ";
  legacyBrz.trim = "First gen";
  assert.deepEqual(vehicleProfileFromRow(legacyBrz), profile({ brand: "Subaru", platform: "ZC6", year: 2019, trim: "BRZ", engineCode: "FA20", transmission: "6-speed manual" }));

  const legacyZd8 = simulatedRow(profile({ brand: "Subaru", platform: "ZD8", year: 2024, trim: "Standard", engineCode: "FA24D", transmission: "6-speed manual" }));
  legacyZd8.model = "BRZ";
  legacyZd8.trim = "Second gen";
  assert.deepEqual(vehicleProfileFromRow(legacyZd8), profile({ brand: "Subaru", platform: "ZD8", year: 2024, trim: "Standard", engineCode: "FA24D", transmission: "6-speed manual" }));

  const legacySpecial = { ...legacyZd8, trim: "tS / Series.Yellow" };
  assert.deepEqual(vehicleProfileFromRow(legacySpecial), profile({ brand: "Subaru", platform: "ZD8", year: 2024, trim: "tS", engineCode: "FA24D", transmission: "6-speed manual" }));
});
