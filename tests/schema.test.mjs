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

const expandedFitmentMigrationUrl = new URL(
  "../supabase/migrations/20260817143000_add_expanded_multibrand_fitment.sql",
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

const secureAccountsMigrationUrl = new URL(
  "../supabase/migrations/20260817010000_secure_keeper_accounts.sql",
  import.meta.url,
);

const legacyClaimMigrationUrl = new URL(
  "../supabase/migrations/20260817023000_add_legacy_garage_claims.sql",
  import.meta.url,
);

const vehicleRemovalMigrationUrl = new URL(
  "../supabase/migrations/20260817030000_add_secure_vehicle_removal.sql",
  import.meta.url,
);

const maintenanceCostsMigrationUrl = new URL(
  "../supabase/migrations/20260817200000_add_maintenance_costs.sql",
  import.meta.url,
);

const testerCatalogMigrationUrl = new URL(
  "../supabase/migrations/20260820210000_allow_tester_catalog_vehicles.sql",
  import.meta.url,
);

const catalogRegistryMigrationUrl = new URL(
  "../supabase/migrations/20260821213000_group_vehicle_families.sql",
  import.meta.url,
);

const keeperUpgradeMigrationUrl = new URL(
  "../supabase/migrations/20260828120000_add_keeper_lifetime_upgrade.sql",
  import.meta.url,
);

const keeperBillingMigrationUrl = new URL(
  "../supabase/migrations/20260828230000_add_keeper_stripe_billing.sql",
  import.meta.url,
);

const keeperLaunchMigrationUrl = new URL(
  "../supabase/migrations/20260828234000_add_keeper_launch_promotions.sql",
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

test("maintenance costs use exact bounded cents without inventing prices for old records", async () => {
  const sql = await readFile(maintenanceCostsMigrationUrl, "utf8");
  assert.match(sql, /add column if not exists cost_cents integer/i);
  assert.match(sql, /cost_cents is null or cost_cents between 0 and 100000000/i);
  assert.doesNotMatch(sql, /update public\.maintenance_records|delete from|truncate|drop table/i);
});

test("account architecture blocks guest writes and centralizes trusted entitlements", async () => {
  const sql = await readFile(secureAccountsMigrationUrl, "utf8");
  assert.match(sql, /create table if not exists public\.legal_acceptances/i);
  assert.match(sql, /create table if not exists public\.account_entitlements/i);
  assert.match(sql, /create table if not exists public\.account_deletion_requests/i);
  assert.match(sql, /auth\.jwt\(\).*is_anonymous/is);
  assert.match(sql, /has_keeper_entitlement\('authenticated_account'\)/i);
  assert.match(sql, /revoke all on public\.profiles, public\.vehicles, public\.maintenance_records, public\.vehicle_maintenance_items from anon/i);
  assert.match(sql, /legacy anonymous owners retain read-only access/i);
  assert.doesNotMatch(sql, /delete from public\.vehicles|delete from public\.maintenance_records|truncate/i);
});

test("export authorization verifies account, entitlement, and vehicle ownership", async () => {
  const sql = await readFile(secureAccountsMigrationUrl, "utf8");
  assert.match(sql, /function public\.get_keeper_vehicle_export\(p_vehicle_id uuid\)/i);
  assert.match(sql, /vehicle\.owner_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /record\.owner_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /Export limit reached/i);
  assert.match(sql, /revoke all on function public\.get_keeper_vehicle_export\(uuid\) from public/i);
  assert.doesNotMatch(sql, /service_role/i);
});

test("legacy garage claims are explicit, expiring, owner-authenticated, and idempotent", async () => {
  const sql = await readFile(legacyClaimMigrationUrl, "utf8");
  assert.match(sql, /function public\.prepare_legacy_garage_claim\(\)/i);
  assert.match(sql, /auth\.jwt\(\).*is_anonymous/is);
  assert.match(sql, /default \(now\(\) \+ interval '24 hours'\)/i);
  assert.match(sql, /function public\.claim_legacy_garage\(p_claim_id uuid, p_claim_secret uuid\)/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /prepared_claim\.claimed_by = current_user_id/i);
  assert.match(sql, /'already_imported', true/i);
  assert.match(sql, /update public\.maintenance_records[\s\S]*update public\.vehicle_maintenance_items[\s\S]*update public\.vehicles/i);
  assert.match(sql, /revoke all on public\.legacy_garage_claims from anon, authenticated/i);
  assert.doesNotMatch(sql, /p_legacy_user_id|p_owner_id/i);
});

test("vehicle removal is owner-authorized, cascade-rooted, and promotes a safe next selection", async () => {
  const sql = await readFile(vehicleRemovalMigrationUrl, "utf8");
  const trackedSql = await readFile(trackedMaintenanceMigrationUrl, "utf8");

  assert.match(sql, /function public\.get_vehicle_removal_summary\(p_vehicle_id uuid\)/i);
  assert.match(sql, /function public\.remove_keeper_vehicle\(p_vehicle_id uuid\)/i);
  assert.match(sql, /has_keeper_entitlement\('authenticated_account'\)/i);
  assert.match(sql, /vehicle\.id = p_vehicle_id[\s\S]*vehicle\.owner_id = current_user_id/i);
  assert.match(sql, /delete from public\.vehicles vehicle[\s\S]*vehicle\.owner_id = current_user_id/i);
  assert.match(sql, /if owned_vehicle\.is_primary[\s\S]*set is_primary = true/i);
  assert.match(sql, /revoke all on function public\.remove_keeper_vehicle\(uuid\) from public, anon/i);
  assert.doesNotMatch(sql, /delete from public\.maintenance_records|delete from public\.vehicle_maintenance_items/i);
  assert.match(trackedSql, /vehicle_id uuid not null references public\.vehicles\(id\) on delete cascade/i);
});

test("expanded fitment remains allow-listed without weakening account isolation", async () => {
  const sql = await readFile(expandedFitmentMigrationUrl, "utf8");
  for (const value of ["Subaru", "Porsche", "Mazda", "3 Series / M3 (E9x)", "5 Series (F10)", "M5 (F10)", "WRX / WRX STI (VA)", "911 (996.1)", "911 (997.2)", "MX-5 Miata (NA)", "MX-5 Miata (ND)"]) {
    assert.match(sql, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(sql, /drop constraint if exists vehicles_brand_check/i);
  assert.match(sql, /add constraint vehicles_supported_fitment check/i);
  assert.doesNotMatch(sql, /disable row level security|drop policy|delete from|truncate/i);
});

test("tester catalog migration removes stale fitment checks without weakening garage security", async () => {
  const sql = await readFile(testerCatalogMigrationUrl, "utf8");
  assert.match(sql, /drop constraint if exists vehicles_supported_fitment/i);
  assert.match(sql, /temporary Keeper tester-mode migration/i);
  assert.doesNotMatch(sql, /disable row level security|drop policy|delete from|truncate/i);
});

test("generated catalog registry validates exact fitments while preserving owner-only RLS", async () => {
  const sql = await readFile(catalogRegistryMigrationUrl, "utf8");
  assert.match(sql, /keeper-catalog-manifest/i);
  assert.match(sql, /keeper-catalog-count: 1707/i);
  assert.match(sql, /create table if not exists public\.vehicle_catalog_fitments/i);
  assert.match(sql, /alter table public\.vehicle_catalog_fitments enable row level security/i);
  assert.match(sql, /revoke all on public\.vehicle_catalog_fitments from public, anon, authenticated/i);
  assert.match(sql, /create or replace function public\.validate_keeper_vehicle_fitment/i);
  assert.match(sql, /raise exception using[\s\S]*errcode = '23514'/i);
  assert.match(sql, /create trigger vehicles_validate_catalog_fitment/i);
  assert.doesNotMatch(sql, /disable row level security|drop policy|delete from public\.vehicles|truncate public\.vehicles/i);
});

test("lifetime upgrade migration is non-destructive, server-granted, and idempotent", async () => {
  const sql = await readFile(keeperUpgradeMigrationUrl, "utf8");
  assert.match(sql, /create table if not exists public\.keeper_purchases/i);
  assert.match(sql, /unique \(provider, provider_transaction_id\)/i);
  assert.match(sql, /on conflict \(provider, provider_transaction_id\) do update/i);
  assert.match(sql, /entitlement_key, status, source[\s\S]*'keeper_lifetime', 'active', 'purchase'/i);
  assert.match(sql, /revoke all on function public\.record_keeper_purchase[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.record_keeper_purchase[\s\S]*to service_role/i);
  assert.match(sql, /before insert on public\.vehicles/i);
  assert.match(sql, /public\.keeper_max_vehicles\(\)/i);
  assert.match(sql, /has_keeper_entitlement\('keeper_lifetime'\)/i);
  assert.match(sql, /get_keeper_vehicle_pdf_export/i);
  assert.doesNotMatch(sql, /delete from public\.(vehicles|maintenance_records|vehicle_maintenance_items)|truncate|drop table/i);
});

test("versioned Stripe billing is exact, webhook-idempotent, server-granted, and non-destructive", async () => {
  const sql = await readFile(keeperBillingMigrationUrl, "utf8");
  assert.match(sql, /create table if not exists public\.keeper_billing_purchases/i);
  assert.match(sql, /create table if not exists public\.keeper_stripe_webhook_events/i);
  assert.match(sql, /stripe_event_id text primary key/i);
  assert.match(sql, /keeper_unlock_v1'[\s\S]*amount_cents = 199/i);
  assert.match(sql, /keeper_unlimited_v1'[\s\S]*amount_cents = 499/i);
  assert.match(sql, /keeper_unlimited_upgrade_v1'[\s\S]*amount_cents = 300/i);
  assert.match(sql, /process_keeper_stripe_event/i);
  assert.match(sql, /on conflict \(stripe_event_id\) do nothing/i);
  assert.match(sql, /source = 'purchase'/i);
  assert.match(sql, /vehicle_limit is not null/i);
  assert.match(sql, /Keeper Unlock or Unlimited required for PDF export/i);
  assert.match(sql, /status = 'refunded'/i);
  assert.doesNotMatch(sql, /delete from public\.(vehicles|maintenance_records|vehicle_maintenance_items)|truncate|drop table/i);
});

test("launch promotions are separate, atomic, identity-bound, and non-destructive", async () => {
  const sql = await readFile(keeperLaunchMigrationUrl, "utf8");
  assert.match(sql, /create table if not exists public\.keeper_promotions/i);
  assert.match(sql, /create table if not exists public\.keeper_promotion_redemptions/i);
  assert.match(sql, /create table if not exists public\.keeper_promotion_claim_attempts/i);
  assert.match(sql, /'launch_upgrade_50', 'keeper_unlock_v1', 50, true/i);
  assert.match(sql, /'launch_infinite_10', 'keeper_unlimited_v1', 10, true/i);
  assert.match(sql, /unique \(user_id\)/i);
  assert.match(sql, /unique \(identity_hash\)/i);
  assert.match(sql, /email_confirmed_at is null/i);
  assert.match(sql, /identity\.provider = 'google'/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /redemption_count = redemption_count \+ 1/i);
  assert.match(sql, /promotion\.redemption_count >= promotion\.max_redemptions/i);
  assert.match(sql, /source = 'launch_promo'|, 'launch_promo', null/i);
  assert.match(sql, /recent_attempts >= 5/i);
  assert.match(sql, /grant execute on function public\.claim_keeper_launch_promotion\(text\) to authenticated/i);
  assert.doesNotMatch(sql, /delete from public\.(vehicles|maintenance_records|vehicle_maintenance_items)|truncate|drop table/i);
});
