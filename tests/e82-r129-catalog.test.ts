import assert from "node:assert/strict";
import test from "node:test";
import {
  E82_R129_INSIGHTS,
  E82_R129_ISSUES,
  E82_R129_PLATFORMS,
  E82_R129_SCHEDULE_PROFILES,
  E82_R129_SCHEDULE_ROWS,
  E82_R129_SCHEDULES,
  E82_R129_VARIANTS,
} from "../lib/e82R129CatalogData";

test("E82/E88 rework and R129 import are complete and internally linked", () => {
  assert.deepEqual(E82_R129_PLATFORMS.map((platform) => platform.value), ["E82_COUPE", "E88", "R129"]);
  assert.equal(E82_R129_VARIANTS.length, 27);
  assert.equal(E82_R129_SCHEDULE_PROFILES.length, 27);
  assert.equal(Object.keys(E82_R129_SCHEDULES).length, 27);
  assert.equal(Object.keys(E82_R129_SCHEDULE_ROWS).length, 1_152);
  assert.equal(E82_R129_ISSUES.length, 359);
  assert.equal(E82_R129_INSIGHTS.length, 22);

  const scheduleIds = new Set(E82_R129_SCHEDULE_PROFILES.map((profile) => profile.scheduleId));
  assert.equal(scheduleIds.size, 27);
  assert.ok(E82_R129_VARIANTS.every((variant) => scheduleIds.has(variant.scheduleId)));
  assert.ok(Object.entries(E82_R129_SCHEDULES).every(([scheduleId, rowKeys]) =>
    scheduleIds.has(scheduleId)
      && rowKeys.length > 0
      && rowKeys.every((rowKey) => Boolean(E82_R129_SCHEDULE_ROWS[rowKey]))));
  assert.ok(E82_R129_ISSUES.every((issue) =>
    issue.scheduleIds.length > 0 && issue.scheduleIds.every((scheduleId) => scheduleIds.has(scheduleId))));
});

test("BMW body variants and R129 mechanical eras retain exact workbook fitment", () => {
  const bmw = E82_R129_VARIANTS.filter((variant) => variant.brand === "BMW");
  assert.equal(bmw.length, 16);
  assert.deepEqual(new Set(bmw.map((variant) => `${variant.platform}:${variant.label}`)), new Set([
    "E82_COUPE:128i Coupe",
    "E82_COUPE:135i Coupe",
    "E82_COUPE:135is Coupe",
    "E88:128i Convertible",
    "E88:135i Convertible",
    "E88:135is Convertible",
  ]));
  assert.ok(bmw.filter((variant) => variant.trim.startsWith("128i")).every((variant) =>
    variant.engineCode === "N51"
      && variant.engineCodes.join(",") === "N51,N52K,N52"));
  assert.ok(E82_R129_ISSUES.some((issue) => issue.platform === "E88" && /roof|top|convertible/i.test(issue.issue)));

  const r129 = E82_R129_VARIANTS.filter((variant) => variant.platform === "R129");
  assert.equal(r129.length, 11);
  assert.deepEqual(new Set(r129.map((variant) => variant.label)), new Set([
    "300SL", "500SL", "600SL", "SL320", "SL500", "SL600",
  ]));
  assert.ok(r129.some((variant) => variant.label === "300SL" && variant.transmission === "5-speed manual"));
  assert.ok(r129.some((variant) => variant.scheduleId.includes("sl500-99-02-5at")
    && variant.engineCode === "M113.961"
    && variant.yearStart === 1999
    && variant.yearEnd === 2002));
  assert.ok(E82_R129_INSIGHTS.some((insight) => insight.platform === "R129" && insight.title === "ADS hydraulic suspension" && /if equipped/i.test(insight.summary)));
});
