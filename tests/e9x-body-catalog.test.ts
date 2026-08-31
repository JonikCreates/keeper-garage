import assert from "node:assert/strict";
import test from "node:test";
import {
  E9X_BODY_INSIGHTS,
  E9X_BODY_ISSUES,
  E9X_BODY_PLATFORMS,
  E9X_BODY_SCHEDULE_PROFILES,
  E9X_BODY_SCHEDULE_ROWS,
  E9X_BODY_SCHEDULES,
  E9X_BODY_VARIANTS,
} from "../lib/e9xCatalogData";

test("E9X body-specific workbook import is complete and internally linked", () => {
  assert.deepEqual(E9X_BODY_PLATFORMS.map((platform) => platform.value), ["E90", "E91", "E92", "E93"]);
  assert.equal(E9X_BODY_VARIANTS.length, 65);
  assert.equal(E9X_BODY_SCHEDULE_PROFILES.length, 65);
  assert.equal(Object.keys(E9X_BODY_SCHEDULES).length, 65);
  assert.equal(Object.keys(E9X_BODY_SCHEDULE_ROWS).length, 511);
  assert.equal(E9X_BODY_ISSUES.length, 1_003);
  assert.ok(E9X_BODY_INSIGHTS.length >= 7);

  const scheduleIds = new Set(E9X_BODY_SCHEDULE_PROFILES.map((profile) => profile.scheduleId));
  assert.equal(scheduleIds.size, 65);
  assert.ok(E9X_BODY_VARIANTS.every((variant) => scheduleIds.has(variant.scheduleId)));
  assert.ok(Object.entries(E9X_BODY_SCHEDULES).every(([scheduleId, rowKeys]) =>
    scheduleIds.has(scheduleId)
      && rowKeys.length > 0
      && rowKeys.every((rowKey) => Boolean(E9X_BODY_SCHEDULE_ROWS[rowKey]))));
  assert.ok(E9X_BODY_ISSUES.every((issue) =>
    issue.scheduleIds.length > 0 && issue.scheduleIds.every((scheduleId) => scheduleIds.has(scheduleId))));
});

test("E9X M3 and regular 3 Series variants retain exact body, years, and powertrain", () => {
  const m3 = E9X_BODY_VARIANTS.filter((variant) => variant.label.startsWith("M3 "));
  assert.deepEqual(new Set(m3.map((variant) => `${variant.platform}:${variant.label}`)), new Set([
    "E90:M3 Sedan",
    "E92:M3 Coupe",
    "E93:M3 Convertible",
  ]));
  assert.ok(m3.every((variant) => variant.engineCode === "S65" && variant.drivetrain === "RWD"));

  const wagon = E9X_BODY_VARIANTS.filter((variant) => variant.platform === "E91");
  assert.ok(wagon.every((variant) => /Wagon/.test(variant.label)));
  assert.ok(wagon.some((variant) => variant.label === "325xi Sports Wagon" && variant.yearStart === 2006 && variant.yearEnd === 2006));

  assert.ok(E9X_BODY_ISSUES.some((issue) => issue.platform === "E93" && /roof|convertible|hardtop/i.test(issue.issue)));
  assert.ok(!E9X_BODY_ISSUES.some((issue) => issue.platform !== "E93" && /retractable hardtop hydraulic system/i.test(issue.issue)));
});
