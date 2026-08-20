import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function generatedJson(source, exportName, nextExport) {
  const expression = new RegExp(`export const ${exportName} = ([\\s\\S]*?);\\r?\\n\\r?\\nexport const ${nextExport}`);
  const match = source.match(expression);
  assert.ok(match, `${exportName} should be generated as inspectable JSON`);
  return JSON.parse(match[1]);
}

test("all twelve workbooks are represented as exact vehicle schedule variants", async () => {
  const generated = await readFile(new URL("../lib/expandedCatalogData.ts", import.meta.url), "utf8");
  const platforms = generatedJson(generated, "EXPANDED_PLATFORMS", "EXPANDED_VARIANTS");
  const variants = generatedJson(generated, "EXPANDED_VARIANTS", "EXPANDED_SCHEDULES");

  assert.equal(platforms.length, 12);
  assert.equal(variants.length, 133);
  assert.deepEqual(new Set(platforms.map((platform) => platform.brand)), new Set(["BMW", "Subaru", "Porsche", "Mazda"]));
  for (const platform of ["E9X", "F10", "F10M5", "VA", "9961", "9962", "9971", "9972", "NA", "NB", "NC", "ND"]) {
    assert.ok(variants.some((variant) => variant.platform === platform), `${platform} should have selectable variants`);
  }
  for (const variant of variants) {
    const platform = platforms.find((candidate) => candidate.value === variant.platform);
    assert.ok(platform.yearStart <= variant.yearStart && platform.yearEnd >= variant.yearEnd, `${variant.scheduleId} should be reachable from its model year selector`);
  }
  assert.ok(variants.some((variant) => variant.platform === "VA" && variant.trim === "WRX STI" && variant.engineCode === "EJ257"));
  assert.ok(variants.some((variant) => variant.platform === "F10M5" && variant.transmission === "7-speed M-DCT"));
  assert.ok(variants.some((variant) => variant.platform === "9972" && variant.trim.includes("GT3 RS 4.0")));
});

test("generated schedules preserve applicable maintenance detail and source links", async () => {
  const generated = await readFile(new URL("../lib/expandedCatalogData.ts", import.meta.url), "utf8");
  const schedulesMatch = generated.match(/export const EXPANDED_SCHEDULES = ([\s\S]*);\s*$/);
  assert.ok(schedulesMatch);
  const schedules = JSON.parse(schedulesMatch[1]);
  const rows = Object.values(schedules).flat();

  assert.equal(Object.keys(schedules).length, 133);
  assert.equal(rows.length, 5112);
  assert.ok(rows.every((row) => !/not applicable/i.test(row.entryType)));
  assert.ok(rows.some((row) => row.name === "1,200-mile running-in service" && row.mileage === 1200));
  assert.ok(rows.some((row) => row.name === "Engine oil & filter" && row.primaryUrl?.startsWith("https://")));
});

test("brand and model selectors cascade instead of staying BMW-locked", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8");
  const garage = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const persistence = await readFile(new URL("../src/vehiclePersistence.ts", import.meta.url), "utf8");

  assert.match(app, /selectBrand\(event\.target\.value as VehicleBrand\)/);
  assert.match(app, /platformOptions\.map/);
  assert.match(catalog, /getPlatformOptions\(brand: VehicleBrand\)/);
  assert.match(garage, /vehicleInsertFromProfile\(profile/);
  assert.match(persistence, /brand: profile\.brand/);
  assert.doesNotMatch(`${garage}\n${persistence}`, /brand: "BMW" as const/);
});

test("every expanded vehicle family has multiple fitment-aware known issues", async () => {
  const source = await readFile(new URL("../lib/expandedKnownIssues.ts", import.meta.url), "utf8");
  for (const platform of ["E9X", "F10", "F10M5", "VA", "9961", "9962", "9971", "9972", "NA", "NB", "NC", "ND"]) {
    const direct = source.match(new RegExp(`platforms: \\[[^\\]]*"${platform}"`, "g")) ?? [];
    const helper = source.match(new RegExp(`platforms\\("${platform}"\\)`, "g")) ?? [];
    assert.ok(direct.length + helper.length >= 3, `${platform} should have at least three researched issue patterns`);
  }
  assert.match(source, /Recall 17V-676/);
  assert.match(source, /WRG-21 fuel-pump impeller recall/);
  assert.match(source, /NHTSA investigation PE13-009/);
  assert.match(source, /TSB 05-007\/16/);
  assert.match(source, /Recall 12V-475/);
});
