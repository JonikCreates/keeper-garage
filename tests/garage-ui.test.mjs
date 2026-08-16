import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("My Garage loads every owned vehicle and keeps add separate from edit", async () => {
  const hook = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(hook, /\.returns<VehicleRow\[\]>/);
  assert.doesNotMatch(hook, /\.eq\("is_primary", true\)/);
  assert.match(hook, /is_primary: selectedVehicle\?\.is_primary \?\? state\.vehicles\.length === 0/);
  assert.match(hook, /vehicleId: null,[\s\S]*nickname: "My BMW",[\s\S]*mileage: ""/);
  assert.match(app, /aria-label="Saved vehicles"/);
  assert.match(app, /garage\.startNewVehicle\(\)/);
  assert.match(app, /garage\.selectVehicle\(event\.target\.value\)/);
});

test("saved vehicles keep repeatable maintenance completion history", async () => {
  const hook = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/MaintenanceRecordPanel.tsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(hook, /from\("maintenance_records"\)/);
  assert.match(hook, /maintenance_slug: maintenanceSlug/);
  assert.match(hook, /work_performed: workPerformed\.trim\(\)/);
  assert.match(panel, /Mark completed/);
  assert.match(panel, /Completed work/);
  assert.match(panel, /Mileage completed/);
  assert.match(panel, /Completion history/);
  assert.match(app, /recordsBySlug\.get\(item\.slug\)/);
  assert.match(app, /aria-label="Maintenance vehicle"/);
  assert.match(app, /maintenancePlanStatus/);
  assert.match(app, /auth\.isGuest \? "Guest garage" : "My garage"/);
});
