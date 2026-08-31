import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("My Garage loads every owned vehicle and keeps add separate from edit", async () => {
  const hook = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const persistence = await readFile(new URL("../src/vehiclePersistence.ts", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(hook, /\.returns<VehicleRow\[\]>/);
  assert.doesNotMatch(hook, /\.eq\("is_primary", true\)/);
  assert.match(hook, /isPrimary: selectedVehicle\?\.is_primary \?\? state\.vehicles\.length === 0/);
  assert.match(persistence, /is_primary: options\.isPrimary/);
  assert.match(hook, /vehicleId: null,[\s\S]*nickname: "My vehicle",[\s\S]*mileage: ""/);
  assert.match(app, /aria-label="Saved vehicles"/);
  assert.match(app, /garage\.startNewVehicle\(\)/);
  assert.match(app, /garage\.selectVehicle\(event\.target\.value\)/);
  assert.match(app, /garage\.vehicles\.length > 1 && <label className="mobile-garage-switcher">/);
});

test("new vehicle picker requires explicit make, family, variant, and year choices in order", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const selection = await readFile(new URL("../src/vehicleSelection.ts", import.meta.url), "utf8");
  const picker = app.match(/<div className="config-grid">([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.ok(picker.indexOf("<label>Make") < picker.indexOf("<label>Model / Generation"));
  assert.ok(picker.indexOf("<label>Model / Generation") < picker.indexOf("<label>Trim / Variant"));
  assert.ok(picker.indexOf("<label>Trim / Variant") < picker.indexOf("<label>Year"));
  assert.match(picker, /value=\{vehicleSelection\.brand \?\? ""\}/);
  assert.match(picker, /Select make/);
  assert.match(picker, /Select trim first/);
  assert.match(app, /if \(!auth\.ready \|\| auth\.access\.kind !== "guest"\) return/);
  assert.match(selection, /brand: null,[\s\S]*family: null,[\s\S]*variant: null,[\s\S]*year: null/);
  assert.match(selection, /selectVehicleFamily[\s\S]*variant: null, year: null/);
  assert.match(selection, /selectVehicleVariant[\s\S]*year: null/);
});

test("Known Issues exposes a PPI view when the selected platform has pre-purchase research", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /ppiIssuesAvailable/);
  assert.match(app, /<option value="ppi">PPI checklist<\/option>/);
  assert.match(app, /Showing the PPI-tagged checks that match this exact configuration/);
});

test("Garage prioritizes a personal vehicle dashboard using existing ownership state", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const ownership = await readFile(new URL("../src/OwnershipDashboard.tsx", import.meta.url), "utf8");
  const intelligence = await readFile(new URL("../src/ownershipIntelligence.ts", import.meta.url), "utf8");
  const footer = await readFile(new URL("../src/SiteFooter.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/mechanical.css", import.meta.url), "utf8");
  const topbarActions = app.match(/<div className="topbar-actions">([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.match(app, /personal-garage-dashboard/);
  assert.match(app, /currentVehicleMileage\.toLocaleString\(\)/);
  assert.match(app, /displayRecords\.length/);
  assert.match(app, /activeTrackedIssues/);
  assert.match(app, /formatUsdCents\(totalSpentCents\)/);
  assert.match(app, /createOwnershipInsights/);
  assert.match(app, /<OwnershipDashboard/);
  assert.match(ownership, /Keeper Health/);
  assert.match(ownership, /What needs attention/);
  assert.match(ownership, /Upcoming maintenance/);
  assert.match(ownership, /Vehicle data/);
  assert.match(intelligence, /assessPriority/);
  assert.match(intelligence, /More data needed/);
  assert.match(app, /Vehicle Settings/);
  assert.doesNotMatch(topbarActions, /GitHub|github/);
  assert.match(footer, /Independent vehicle ownership research and workshop records/);
  assert.match(css, /\.ownership-command-center/);
  assert.match(css, /grid-template-columns: repeat\(5, 1fr\)/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*\.personal-garage-specs, \.personal-garage-stats/);
});

test("active vehicle selection has one persisted Garage source of truth", async () => {
  const hook = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");

  assert.match(hook, /keeper-selected-vehicle:\$\{currentUserId\}/);
  assert.match(hook, /vehicles\.find\(\(vehicle\) => vehicle\.id === rememberedVehicleId\)/);
  assert.match(hook, /keeper-selected-vehicle:\$\{user\.id\}/);
  assert.match(hook, /localStorage\.setItem\(selectionKey, selected\.id\)/);
  assert.match(hook, /localStorage\.removeItem\(selectionKey\)/);
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

test("historical maintenance backfills cannot replace the most recent service", async () => {
  const hook = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");

  assert.match(hook, /right\.completed_at\.localeCompare\(left\.completed_at\)/);
  assert.match(hook, /right\.created_at\.localeCompare\(left\.created_at\)/);
  assert.match(hook, /for \(const history of grouped\.values\(\)\) history\.sort\(compareMaintenanceRecordsNewestFirst\)/);
  assert.match(hook, /records: \[\.\.\.current\.records, data\]\.sort\(compareMaintenanceRecordsNewestFirst\)/);
  assert.doesNotMatch(hook, /records: \[data, \.\.\.current\.records\]/);
});

test("maintenance is importance-sorted and accepts issue and custom work items", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
  const tracked = await readFile(new URL("../src/useTrackedMaintenance.ts", import.meta.url), "utf8");
  const custom = await readFile(new URL("../src/CustomMaintenanceForm.tsx", import.meta.url), "utf8");

  assert.match(app, /label: "Overdue"/);
  assert.match(app, /label: "Due Soon"/);
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
  assert.match(panel, /Cost \(USD\)/);
  assert.match(records, /cost_cents: input\.costCents/);
  assert.match(app, /Total spent/);
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
  assert.match(exporter, /maintenanceTotalCents/);
  assert.match(exporter, /total spent/);
  assert.match(exporter, /document\.text\("COST"/);
  assert.match(exporter, /canvas\.height = logicalHeight \* scale/);
  assert.match(menu, /Export as PDF/);
  assert.match(menu, /Export as image/);
  assert.match(menu, /getKeeperVehicleExport\(vehicle\.id\)/);
  assert.match(menu, /getKeeperVehiclePdfExport\(vehicle\.id\)/);
  assert.match(menu, /format === "pdf" && !canExportPdf/);
  assert.match(api, /rpc\("get_keeper_vehicle_export"/);
  assert.match(api, /rpc\("get_keeper_vehicle_pdf_export"/);
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
