import assert from "node:assert/strict";
import test from "node:test";
import {
  SECOND_GEN_TWIN_INSIGHTS,
  SECOND_GEN_TWIN_ISSUES,
  SECOND_GEN_TWIN_PLATFORMS,
  SECOND_GEN_TWIN_SCHEDULE_PROFILES,
  SECOND_GEN_TWIN_SCHEDULE_ROWS,
  SECOND_GEN_TWIN_SCHEDULES,
  SECOND_GEN_TWIN_VARIANTS,
} from "../lib/secondGenTwinsVehicleData";
import { RESEARCH_PLATFORMS } from "../lib/researchVehicleData";

test("ZD8 BRZ and ZN8 GR86 workbook data is complete, exact, and duplicate-free", () => {
  assert.deepEqual(SECOND_GEN_TWIN_PLATFORMS.map((platform) => platform.value), ["ZD8", "ZN8"]);
  assert.equal(SECOND_GEN_TWIN_VARIANTS.length, 9);
  assert.equal(SECOND_GEN_TWIN_SCHEDULE_PROFILES.length, 9);
  assert.equal(Object.keys(SECOND_GEN_TWIN_SCHEDULES).length, 9);
  assert.equal(new Set(SECOND_GEN_TWIN_VARIANTS.map((variant) => variant.scheduleId)).size, 9);
  assert.ok(Object.keys(SECOND_GEN_TWIN_SCHEDULE_ROWS).length >= 350);
  assert.ok(SECOND_GEN_TWIN_ISSUES.length >= 160);
  assert.ok(SECOND_GEN_TWIN_INSIGHTS.length >= 10);
  assert.ok(SECOND_GEN_TWIN_VARIANTS.every((variant) => variant.engineCode === "FA24D" && variant.drivetrain === "RWD"));
  assert.ok(Object.values(SECOND_GEN_TWIN_SCHEDULE_ROWS).every((row) => row.name && row.entryType && row.action));
  assert.ok(Object.values(SECOND_GEN_TWIN_SCHEDULES).every((rowKeys) => rowKeys.length >= 38 && rowKeys.every((key) => SECOND_GEN_TWIN_SCHEDULE_ROWS[key])));

  for (const id of ["A90", "ZD8", "ZN8"]) {
    assert.equal(RESEARCH_PLATFORMS.filter((platform) => platform.value === id).length, 1, `${id} should have one platform record`);
  }
});
