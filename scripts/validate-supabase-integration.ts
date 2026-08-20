import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  configurationLabel,
  databaseFitmentKey,
  enumerateCatalogConfigurations,
  persistencePayload,
  type CatalogConfiguration,
} from "./catalog-validation";
import type {
  MaintenanceRecordRow,
  VehicleMaintenanceItemRow,
  VehicleRow,
} from "../src/supabase";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
}

const url = process.env.KEEPER_TEST_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.KEEPER_TEST_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.KEEPER_TEST_USER_EMAIL;
const password = process.env.KEEPER_TEST_USER_PASSWORD;
const requireIntegration = process.env.KEEPER_REQUIRE_INTEGRATION === "1";
const required = {
  KEEPER_TEST_SUPABASE_URL: url,
  KEEPER_TEST_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  KEEPER_TEST_USER_EMAIL: email,
  KEEPER_TEST_USER_PASSWORD: password,
};
const missing = Object.entries(required).filter(([, value]) => !value).map(([name]) => name);

if (missing.length) {
  const message = `SKIP — Supabase integration validation requires an isolated test account. Missing: ${missing.join(", ")}.`;
  console.log(message);
  console.log("Set KEEPER_TEST_SUPABASE_URL, KEEPER_TEST_SUPABASE_PUBLISHABLE_KEY, KEEPER_TEST_USER_EMAIL, and KEEPER_TEST_USER_PASSWORD.");
  if (requireIntegration) process.exitCode = 1;
} else {
  await runIntegrationValidation(url!, publishableKey!, email!, password!);
}

type IntegrationFailure = {
  configuration: CatalogConfiguration | null;
  reason: string;
};

function integrationClient(projectUrl: string, key: string) {
  return createClient(projectUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function chunks<T>(values: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

async function deleteTestVehicles(client: SupabaseClient, ownerId: string, nicknamePattern: string) {
  const { error } = await client
    .from("vehicles")
    .delete()
    .eq("owner_id", ownerId)
    .like("nickname", nicknamePattern);
  if (error) throw new Error(`Cleanup failed: ${error.code ?? "unknown"} ${error.message}`);
}

async function runIntegrationValidation(projectUrl: string, key: string, accountEmail: string, accountPassword: string) {
  const client = integrationClient(projectUrl, key);
  const { data: authData, error: authError } = await client.auth.signInWithPassword({ email: accountEmail, password: accountPassword });
  if (authError || !authData.user) {
    console.error(`FAIL — dedicated Supabase test user could not sign in: ${authError?.message ?? "No user returned."}`);
    process.exitCode = 1;
    return;
  }

  const user = authData.user;
  const runId = crypto.randomUUID().slice(0, 8);
  const stalePattern = "KeeperCatalogTest:%";
  const runPattern = `KeeperCatalogTest:${runId}:%`;
  const enumeration = enumerateCatalogConfigurations();
  const configurations = enumeration.configurations;
  const configurationByDatabaseKey = new Map(configurations.map((configuration) => [databaseFitmentKey(persistencePayload(configuration, user.id)), configuration]));
  const failures: IntegrationFailure[] = enumeration.failures.map((failure) => ({ configuration: failure.configuration, reason: failure.reason }));
  const savedRows = new Map<string, VehicleRow>();
  let downstreamPassed = false;
  let rlsPassed = false;
  let cleanupPassed = false;

  try {
    await deleteTestVehicles(client, user.id, stalePattern);

    const payloads = configurations.map((configuration, index) => ({
      configuration,
      vehicle: {
        ...persistencePayload(configuration, user.id),
        nickname: `KeeperCatalogTest:${runId}:${index}`,
      },
    }));

    for (const batch of chunks(payloads, 50)) {
      const { data, error } = await client.from("vehicles").insert(batch.map((entry) => entry.vehicle)).select("*").returns<VehicleRow[]>();
      if (!error) {
        for (const row of data ?? []) savedRows.set(databaseFitmentKey(row), row);
        continue;
      }

      // A failed batch is atomic. Retry its members individually so every
      // failure names the exact UI configuration and database error.
      for (const entry of batch) {
        const result = await client.from("vehicles").insert(entry.vehicle).select("*").single<VehicleRow>();
        if (result.error || !result.data) {
          failures.push({
            configuration: entry.configuration,
            reason: `Supabase rejected the garage row (${result.error?.code ?? "unknown"}): ${result.error?.message ?? "No row returned."}`,
          });
        } else {
          savedRows.set(databaseFitmentKey(result.data), result.data);
        }
      }
    }

    for (const configuration of configurations) {
      const expected = persistencePayload(configuration, user.id);
      const row = savedRows.get(databaseFitmentKey(expected));
      if (!row) {
        failures.push({ configuration, reason: "No saved vehicle row was returned for this UI configuration." });
        continue;
      }
      if (row.owner_id !== user.id || databaseFitmentKey(row) !== databaseFitmentKey(expected)) {
        failures.push({ configuration, reason: `Saved row fields do not match the UI payload: ${databaseFitmentKey(row)}.` });
      }
    }

    const savedIds = [...savedRows.values()].map((row) => row.id);
    const reloaded = new Map<string, VehicleRow>();
    for (const idBatch of chunks(savedIds, 50)) {
      const { data, error } = await client.from("vehicles").select("*").in("id", idBatch).returns<VehicleRow[]>();
      if (error) {
        failures.push({ configuration: null, reason: `Could not reload saved test vehicles (${error.code ?? "unknown"}): ${error.message}` });
        continue;
      }
      for (const row of data ?? []) reloaded.set(databaseFitmentKey(row), row);
    }
    for (const [keyValue, configuration] of configurationByDatabaseKey) {
      if (savedRows.has(keyValue) && !reloaded.has(keyValue)) failures.push({ configuration, reason: "Vehicle inserted successfully but was missing when read back through owner-scoped RLS." });
    }

    const downstreamVehicle = [...reloaded.values()][0];
    if (downstreamVehicle) {
      const itemSlug = `custom-catalog-test-${runId}`;
      const recordSlug = `catalog-test-service-${runId}`;
      const itemResult = await client.from("vehicle_maintenance_items").insert({
        owner_id: user.id,
        vehicle_id: downstreamVehicle.id,
        item_slug: itemSlug,
        item_name: "Catalog integration custom work",
        item_type: "custom",
        category: "Validation",
        severity: "routine",
        notes: "Isolated integration validation record",
        plan_type: "none",
        mileage_interval: null,
        time_interval_months: null,
        tracks_fluid: false,
      }).select("*").single<VehicleMaintenanceItemRow>();
      const recordResult = await client.from("maintenance_records").insert({
        owner_id: user.id,
        vehicle_id: downstreamVehicle.id,
        maintenance_slug: recordSlug,
        maintenance_name: "Catalog integration service",
        work_performed: "Automated isolated integration validation",
        mileage: 1,
        completed_at: new Date().toISOString().slice(0, 10),
        notes: "Deleted with the test vehicle",
        fluid_brand: null,
        fluid_product: null,
        fluid_type: null,
        fluid_viscosity: null,
        fluid_specification: null,
        fluid_quantity: null,
        fluid_unit: null,
        filter_product: null,
        cost_cents: null,
      }).select("*").single<MaintenanceRecordRow>();
      if (itemResult.error || recordResult.error) {
        failures.push({ configuration: configurationByDatabaseKey.get(databaseFitmentKey(downstreamVehicle)) ?? null, reason: `Downstream custom-work validation failed: ${itemResult.error?.message ?? recordResult.error?.message}.` });
      } else {
        downstreamPassed = itemResult.data.vehicle_id === downstreamVehicle.id && recordResult.data.vehicle_id === downstreamVehicle.id;
        if (!downstreamPassed) {
          failures.push({ configuration: configurationByDatabaseKey.get(databaseFitmentKey(downstreamVehicle)) ?? null, reason: "Downstream custom-work rows were created but linked to the wrong vehicle." });
        }
      }
    } else {
      failures.push({ configuration: null, reason: "No vehicle could be reloaded, so downstream maintenance/custom-work validation could not run." });
    }

    const anonymousClient = integrationClient(projectUrl, key);
    const protectedIds = savedIds.slice(0, 5);
    const anonymousRead = await anonymousClient.from("vehicles").select("id").in("id", protectedIds);
    rlsPassed = Boolean(anonymousRead.error) || (anonymousRead.data?.length ?? 0) === 0;
    if (!rlsPassed) failures.push({ configuration: null, reason: "Anonymous client could read isolated test vehicles; owner-only RLS is not working." });

    const otherEmail = process.env.KEEPER_TEST_OTHER_USER_EMAIL;
    const otherPassword = process.env.KEEPER_TEST_OTHER_USER_PASSWORD;
    if (otherEmail && otherPassword) {
      const otherClient = integrationClient(projectUrl, key);
      const otherAuth = await otherClient.auth.signInWithPassword({ email: otherEmail, password: otherPassword });
      if (otherAuth.error) {
        failures.push({ configuration: null, reason: `Secondary RLS test user could not sign in: ${otherAuth.error.message}` });
      } else {
        const otherRead = await otherClient.from("vehicles").select("id").in("id", protectedIds);
        if (otherRead.error || (otherRead.data?.length ?? 0) !== 0) failures.push({ configuration: null, reason: `Secondary user RLS read was not clean: ${otherRead.error?.message ?? `${otherRead.data?.length} rows returned`}.` });
        await otherClient.auth.signOut();
      }
    }
  } finally {
    try {
      await deleteTestVehicles(client, user.id, runPattern);
      const remaining = await client.from("vehicles").select("id").eq("owner_id", user.id).like("nickname", runPattern);
      cleanupPassed = !remaining.error && (remaining.data?.length ?? 0) === 0;
      if (!cleanupPassed) failures.push({ configuration: null, reason: `Cleanup verification failed: ${remaining.error?.message ?? `${remaining.data?.length} rows remain`}.` });
    } catch (error) {
      failures.push({ configuration: null, reason: error instanceof Error ? error.message : String(error) });
    }
    await client.auth.signOut();
  }

  const failedConfigurationKeys = new Set(failures.filter((failure) => failure.configuration).map((failure) => configurationLabel(failure.configuration!)));
  console.log("Keeper Supabase integration validation");
  console.log("========================================");
  console.log(`Total vehicle configurations tested: ${configurations.length}`);
  console.log(`Successful configurations: ${configurations.length - failedConfigurationKeys.size}`);
  console.log(`Failed configurations: ${failedConfigurationKeys.size}`);
  console.log(`Vehicles saved and reloaded: ${savedRows.size}`);
  console.log(`Downstream maintenance/custom-work test: ${downstreamPassed ? "PASS" : "FAIL"}`);
  console.log(`Owner/anonymous RLS test: ${rlsPassed ? "PASS" : "FAIL"}`);
  console.log(`Cleanup verification: ${cleanupPassed ? "PASS" : "FAIL"}`);
  for (const failure of failures) {
    console.log("");
    console.log(failure.configuration ? `FAIL — ${configurationLabel(failure.configuration)}` : "FAIL — Supabase integration harness");
    console.log(`Reason: ${failure.reason}`);
  }
  if (!failures.length) console.log("\nPASS — every Keeper vehicle saved, reloaded, and remained isolated without polluting a real garage.");
  if (failures.length) process.exitCode = 1;
}
