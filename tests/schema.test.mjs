import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260813220000_create_keeper_garage.sql",
  import.meta.url,
);

const profileMigrationUrl = new URL(
  "../supabase/migrations/20260814014500_harden_profiles.sql",
  import.meta.url,
);

const generationMigrationUrl = new URL(
  "../supabase/migrations/20260814153000_expand_bmw_generations.sql",
  import.meta.url,
);

const classicGenerationMigrationUrl = new URL(
  "../supabase/migrations/20260814190000_add_e39_e46_fitment.sql",
  import.meta.url,
);

const maintenanceMigrationUrl = new URL(
  "../supabase/migrations/20260816200000_add_maintenance_records.sql",
  import.meta.url,
);

const maintenanceDetailsMigrationUrl = new URL(
  "../supabase/migrations/20260816203000_add_maintenance_work_details.sql",
  import.meta.url,
);

const trackedMaintenanceMigrationUrl = new URL(
  "../supabase/migrations/20260816213000_add_vehicle_maintenance_items.sql",
  import.meta.url,
);

const customIssueDetailsMigrationUrl = new URL(
  "../supabase/migrations/20260816220000_add_custom_issue_details.sql",
  import.meta.url,
);

const simplifiedMaintenanceMigrationUrl = new URL(
  "../supabase/migrations/20260816230000_simplify_maintenance_and_add_fluids.sql",
  import.meta.url,
);

test("garage migration enforces owner-only access", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /alter table public\.vehicles enable row level security/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /auth\.uid\(\)\) = owner_id/i);
  assert.match(sql, /auth\.uid\(\)\) = user_id/i);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.doesNotMatch(sql, /grant .* to anon/i);
});

test("garage fitment adds bounded E39 and E46 branches without changing RLS", async () => {
  const sql = await readFile(classicGenerationMigrationUrl, "utf8");
  assert.match(sql, /3 Series \(E46\)/);
  assert.match(sql, /5 Series \(E39\)/);
  assert.match(sql, /engine_code = 'M56B25'.*transmission = '5-speed automatic'/is);
  assert.match(sql, /engine_code = 'S54B32'.*6-speed SMG II/is);
  assert.match(sql, /engine_code = 'S62B50'.*6-speed manual/is);
  assert.match(sql, /drivetrain = 'AWD'/i);
  assert.doesNotMatch(sql, /row level security|create policy|drop policy/i);
});

test("profile names are bounded at the database layer", async () => {
  const sql = await readFile(profileMigrationUrl, "utf8");
  assert.match(sql, /profiles_display_name_length/i);
  assert.match(sql, /char_length\(btrim\(display_name\)\) between 1 and 60/i);
});

test("garage fitment supports researched E36 and F30 variants", async () => {
  const sql = await readFile(generationMigrationUrl, "utf8");
  assert.match(sql, /vehicles_supported_bmw_fitment/i);
  assert.match(sql, /3 Series \(E36\)/);
  assert.match(sql, /3 Series \(F30\)/);
  assert.match(sql, /trim = '330i' and engine_code = 'B46'/i);
  assert.match(sql, /trim = '335i' and engine_code = 'N55'/i);
  assert.match(sql, /engine_code in \('S50US', 'S52US'\)/i);
});

test("maintenance history is repeatable and isolated to the vehicle owner", async () => {
  const sql = await readFile(maintenanceMigrationUrl, "utf8");
  assert.match(sql, /create table public\.maintenance_records/i);
  assert.match(sql, /vehicle_id uuid not null references public\.vehicles\(id\) on delete cascade/i);
  assert.match(sql, /mileage integer not null check \(mileage between 0 and 1000000\)/i);
  assert.match(sql, /alter table public\.maintenance_records enable row level security/i);
  assert.match(sql, /vehicles\.owner_id = \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(sql, /unique[\s\S]*maintenance_slug/i);
});

test("maintenance work details preserve existing records during migration", async () => {
  const sql = await readFile(maintenanceDetailsMigrationUrl, "utf8");
  assert.match(sql, /add column if not exists work_performed text/i);
  assert.match(sql, /set work_performed = 'Completed service — details not recorded'/i);
  assert.match(sql, /alter column work_performed set not null/i);
  assert.doesNotMatch(sql, /delete from|truncate|drop table/i);
});

test("vehicle work-list items are owner isolated and do not rewrite service history", async () => {
  const sql = await readFile(trackedMaintenanceMigrationUrl, "utf8");
  assert.match(sql, /create table public\.vehicle_maintenance_items/i);
  assert.match(sql, /item_type in \('known_issue', 'custom'\)/i);
  assert.match(sql, /unique \(vehicle_id, item_slug\)/i);
  assert.match(sql, /alter table public\.vehicle_maintenance_items enable row level security/i);
  assert.match(sql, /vehicles\.owner_id = \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(sql, /delete from public\.maintenance_records|update public\.maintenance_records/i);
});

test("custom issue observations add bounded details without touching completed history", async () => {
  const sql = await readFile(customIssueDetailsMigrationUrl, "utf8");
  assert.match(sql, /item_type in \('known_issue', 'custom', 'custom_issue'\)/i);
  assert.match(sql, /add column if not exists date_found date/i);
  assert.match(sql, /add column if not exists mileage_found integer/i);
  assert.match(sql, /issue_status in \('watching', 'needs_repair', 'repaired'\)/i);
  assert.doesNotMatch(sql, /delete from public\.maintenance_records|update public\.maintenance_records|drop table/i);
});

test("maintenance redesign adds optional fluid and plan fields without rewriting existing records", async () => {
  const sql = await readFile(simplifiedMaintenanceMigrationUrl, "utf8");
  assert.match(sql, /add column if not exists plan_type text not null default 'none'/i);
  assert.match(sql, /add column if not exists tracks_fluid boolean not null default false/i);
  assert.match(sql, /add column if not exists fluid_product text/i);
  assert.match(sql, /add column if not exists fluid_specification text/i);
  assert.match(sql, /maintenance_records_fluid_quantity_check/i);
  assert.doesNotMatch(sql, /delete from|truncate|drop table|update public\.maintenance_records/i);
});
