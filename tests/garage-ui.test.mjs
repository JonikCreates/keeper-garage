import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("My Garage loads every owned vehicle and keeps add separate from edit", async () => {
  const hook = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(hook, /\.returns<VehicleRow\[\]>/);
  assert.doesNotMatch(hook, /\.eq\("is_primary", true\)/);
  assert.match(hook, /is_primary: selectedVehicle\?\.is_primary \?\? state\.vehicles\.length === 0/);
  assert.match(hook, /vehicleId: null,[\s\S]*nickname: "My vehicle",[\s\S]*mileage: ""/);
  assert.match(app, /aria-label="Saved vehicles"/);
  assert.match(app, /garage\.startNewVehicle\(\)/);
  assert.match(app, /garage\.selectVehicle\(event\.target\.value\)/);
});

test("vehicle removal is deliberate, record-aware, and refreshes garage selection only after success", async () => {
  const hook = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../src/VehicleRemovalDialog.tsx", import.meta.url), "utf8");

  assert.match(app, /Remove from Garage/);
  assert.match(app, /garage\.getRemovalSummary\(vehicleId\)/);
  assert.match(app, /const removed = await garage\.removeVehicle\(vehicleRemovalTarget\.id\)/);
  assert.match(hook, /rpc\("get_vehicle_removal_summary"/);
  assert.match(hook, /rpc\("remove_keeper_vehicle"/);
  assert.match(hook, /filter\(\(vehicle\) => vehicle\.id !== result\.removed_vehicle_id\)/);
  assert.match(hook, /vehicleId: selected\?\.id \?\? null/);
  assert.match(dialog, /Remove \{title\}\?/);
  assert.match(dialog, /I understand this vehicle and its records will be removed/);
  assert.match(dialog, /Remove Vehicle/);
  assert.match(dialog, /Shared maintenance schedules and Keeper&apos;s global Known Issues research will not be changed/);
});

test("saved vehicles keep repeatable maintenance completion history", async () => {
  const hook = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/MaintenanceRecordPanel.tsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(hook, /from\("maintenance_records"\)/);
  assert.match(hook, /maintenance_slug: maintenanceSlug/);
  assert.match(hook, /work_performed: input\.workPerformed\.trim\(\)/);
  assert.match(panel, /Save maintenance/);
  assert.match(panel, /Work completed/);
  assert.match(panel, /<label>Mileage/);
  assert.match(app, /Maintenance history/);
  assert.match(app, /displayRecordsBySlug\.get\(item\.slug\)/);
  assert.match(app, /aria-label="Maintenance vehicle"/);
  assert.match(app, /maintenancePlanStatus/);
  assert.match(app, /Demo Vehicle/);
  assert.match(app, /auth\.access\.canSaveMaintenance/);
});

test("maintenance is importance-sorted and accepts issue and custom work items", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const tracked = await readFile(new URL("../src/useTrackedMaintenance.ts", import.meta.url), "utf8");
  const custom = await readFile(new URL("../src/CustomMaintenanceForm.tsx", import.meta.url), "utf8");

  assert.match(app, /label: "Overdue"/);
  assert.match(app, /label: "Do Soon"/);
  assert.match(app, /label: "Done"/);
  assert.match(app, /toneRank\[left\.status\.tone\]/);
  assert.match(app, /TrackedIssueAction/);
  assert.match(tracked, /from\("vehicle_maintenance_items"\)/);
  assert.match(tracked, /item_slug: `issue-\$\{issue\.slug\}`/);
  assert.match(custom, /Rear subframe bushings/);
});

test("simplified maintenance separates statuses and stores fluid details on service records", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/MaintenanceRecordPanel.tsx", import.meta.url), "utf8");
  const custom = await readFile(new URL("../src/CustomMaintenanceForm.tsx", import.meta.url), "utf8");
  const records = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");

  assert.match(app, /maintenance-status-section \$\{section\.key\}/);
  assert.match(app, /What does this vehicle need\?/);
  assert.match(app, /Current fluids/);
  assert.match(app, /What has been recorded\?/);
  assert.match(app, /data-label="Plan"/);
  assert.doesNotMatch(app, /maintenance-expanded-summary/);
  assert.match(panel, /Previously used/);
  assert.match(panel, /OEM specification/);
  assert.match(records, /fluid_product: input\.fluidProduct/);
  assert.match(custom, /Other \/ Custom Category/);
  assert.match(custom, /No Scheduled Interval/);
});

test("known issues support smart search, custom observations, and reversible tracking", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const tracked = await readFile(new URL("../src/useTrackedMaintenance.ts", import.meta.url), "utf8");
  const search = await readFile(new URL("../lib/knownIssueSearch.ts", import.meta.url), "utf8");
  const action = await readFile(new URL("../src/TrackedIssueAction.tsx", import.meta.url), "utf8");
  const customIssue = await readFile(new URL("../src/CustomIssueForm.tsx", import.meta.url), "utf8");

  assert.match(app, /searchKnownIssues\(libraryQuery, matchedIssues, profile\)/);
  assert.match(search, /editDistance/);
  assert.match(search, /alternate name/);
  assert.match(tracked, /item_type: "custom_issue"/);
  assert.match(tracked, /\.delete\(\)[\s\S]*\.eq\("owner_id", user\.id\)[\s\S]*\.eq\("vehicle_id", vehicleId\)/);
  assert.match(action, /Confirm removal/);
  assert.match(action, /leaves completed service records untouched/);
  assert.match(customIssue, /Date found/);
  assert.match(customIssue, /Mileage found/);
  assert.match(customIssue, /Needs Repair/);
});

test("completed work exports from the full selected-vehicle record set", async () => {
  const exporter = await readFile(new URL("../src/maintenanceExport.ts", import.meta.url), "utf8");
  const menu = await readFile(new URL("../src/MaintenanceExportMenu.tsx", import.meta.url), "utf8");
  const api = await readFile(new URL("../src/keeperApi.ts", import.meta.url), "utf8");

  assert.match(exporter, /completedExportRecords\(sourceRecords\)/);
  assert.match(exporter, /work !== UNKNOWN_WORK/);
  assert.match(exporter, /right\.completed_at\.localeCompare\(left\.completed_at\)/);
  assert.match(exporter, /document\.addPage\(\)/);
  assert.match(exporter, /Page \$\{page\} of \$\{totalPages\}/);
  assert.match(exporter, /canvas\.height = logicalHeight \* scale/);
  assert.match(menu, /Export as PDF/);
  assert.match(menu, /Export as image/);
  assert.match(menu, /getKeeperVehicleExport\(vehicle\.id\)/);
  assert.match(api, /rpc\("get_keeper_vehicle_export"/);
  assert.match(exporter, /does not independently verify service completion/);
});

test("guest mode is a demo and persistent actions require an account", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const demo = await readFile(new URL("../src/demoGarage.ts", import.meta.url), "utf8");
  const panel = await readFile(new URL("../src/AuthPanel.tsx", import.meta.url), "utf8");

  assert.match(demo, /2014/);
  assert.match(demo, /DEMO_MAINTENANCE_RECORDS/);
  assert.match(app, /useMemo\(\(\) => demoVehicleSelected \? DEMO_MAINTENANCE_RECORDS : demoMode \? \[\] : serviceRecords\.records/);
  assert.match(app, /openAccount\("export"\)/);
  assert.match(app, /auth\.access\.canCustomize/);
  assert.match(panel, /Your garage\. Your profile\./);
  assert.match(panel, /Sign In/);
  assert.match(panel, /Create Account/);
  assert.doesNotMatch(panel, /Continue as guest/);
});
