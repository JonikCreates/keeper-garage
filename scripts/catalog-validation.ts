import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  KNOWN_ISSUES,
  PLATFORM_OPTIONS,
  VEHICLE_FAMILY_OPTIONS,
  getDrivetrainOptions,
  getEngineOptions,
  getMaintenanceCatalog,
  getPlatform,
  getTransmissionOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  matchesApplicability,
  type VehicleProfile,
} from "../lib/catalog";
import {
  getEnhancedScheduleIds,
  getOwnershipInsights,
} from "../lib/enhancedCatalog";
import {
  RESEARCH_INSIGHTS,
  RESEARCH_ISSUES,
  RESEARCH_PLATFORMS,
  RESEARCH_SCHEDULE_PROFILES,
  RESEARCH_SCHEDULE_ROWS,
  RESEARCH_SCHEDULES,
} from "../lib/researchVehicleData";
import type { VehicleRow } from "../src/supabase";
import {
  vehicleInsertFromProfile,
  vehicleProfileFromRow,
  type VehicleInsert,
} from "../src/vehiclePersistence";

export type CatalogConfiguration = VehicleProfile & {
  model: string;
};

export type CatalogFailureCategory =
  | "cannot-save"
  | "missing-maintenance"
  | "missing-known-issues"
  | "missing-fluids"
  | "missing-research"
  | "invalid-configuration"
  | "data-leak";

export type CatalogFailure = {
  category: CatalogFailureCategory;
  reason: string;
  configuration: CatalogConfiguration;
};

export type CatalogAudit = {
  configurations: CatalogConfiguration[];
  failures: CatalogFailure[];
  orphanedData: string[];
  summary: {
    totalConfigurations: number;
    successfulConfigurations: number;
    failedConfigurations: number;
    vehiclesThatCannotBeSaved: number;
    missingMaintenanceData: number;
    missingExpectedKnownIssues: number;
    missingExpectedFluidSpecifications: number;
    missingExpectedOwnershipResearch: number;
    invalidOrMismatchedConfigurations: number;
    crossConfigurationLeaks: number;
    orphanedData: number;
  };
};

type EnumerationResult = {
  configurations: CatalogConfiguration[];
  failures: CatalogFailure[];
};

export type DatabaseFitmentManifest = {
  migrationPath: string;
  configurations: DatabaseFitment[];
  sha256: string;
};

export type DatabaseFitment = Pick<
  VehicleInsert,
  "brand" | "model" | "model_year" | "trim" | "engine_code" | "drivetrain" | "transmission"
>;

const catalogMigrationMarker = "-- keeper-catalog-manifest";
const catalogJsonStart = "$keeper_catalog$";

function partialConfiguration(platformValue: string, year = 0, trim = "<none>"): CatalogConfiguration {
  const platform = getPlatform(platformValue);
  return {
    brand: platform.brand,
    platform: platform.value,
    model: platform.label,
    year,
    trim,
    engineCode: "<none>",
    drivetrain: "<none>",
    transmission: "<none>",
  };
}

export function configurationLabel(configuration: CatalogConfiguration) {
  return [
    configuration.brand,
    configuration.model,
    configuration.year,
    configuration.trim,
    configuration.engineCode,
    configuration.drivetrain,
    configuration.transmission,
  ].join(" / ");
}

export function profileKey(profile: VehicleProfile) {
  return JSON.stringify([
    profile.brand,
    profile.platform,
    profile.year,
    profile.trim,
    profile.engineCode,
    profile.drivetrain,
    profile.transmission,
  ]);
}

export function databaseFitmentKey(vehicle: Pick<VehicleInsert, "brand" | "model" | "model_year" | "trim" | "engine_code" | "drivetrain" | "transmission">) {
  return JSON.stringify([
    vehicle.brand,
    vehicle.model,
    vehicle.model_year,
    vehicle.trim,
    vehicle.engine_code,
    vehicle.drivetrain,
    vehicle.transmission,
  ]);
}

function addEnumerationFailure(failures: CatalogFailure[], configuration: CatalogConfiguration, reason: string) {
  failures.push({ category: "invalid-configuration", configuration, reason });
}

export function enumerateCatalogConfigurations(): EnumerationResult {
  const configurations = new Map<string, CatalogConfiguration>();
  const failures: CatalogFailure[] = [];

  for (const family of VEHICLE_FAMILY_OPTIONS) {
    const variants = getVehicleVariantOptions(family.value);
    if (!variants.length) {
      addEnumerationFailure(failures, partialConfiguration(family.platforms[0]), "Customer-facing model/generation exposes no selectable trims or variants.");
      continue;
    }

    for (const variant of variants) {
      const years = getYearOptionsForTrim(variant.platform, variant.trim);
      if (!years.length) {
        addEnumerationFailure(failures, partialConfiguration(variant.platform, 0, variant.trim), "Trim/variant exposes no selectable production years.");
        continue;
      }

      for (const year of years) {
        const base = partialConfiguration(variant.platform, year, variant.trim);
        const drivetrains = getDrivetrainOptions(variant.platform, variant.trim, year);
        if (!drivetrains.length) {
          addEnumerationFailure(failures, base, "The UI trim has no selectable drivetrain.");
          continue;
        }

        for (const drivetrain of drivetrains) {
          const transmissions = getTransmissionOptions(variant.platform, variant.trim, drivetrain, year);
          if (!transmissions.length) {
            addEnumerationFailure(failures, { ...base, drivetrain }, "The UI drivetrain has no selectable transmission.");
            continue;
          }

          for (const transmission of transmissions) {
            const engines = getEngineOptions(variant.platform, variant.trim, year, transmission);
            if (!engines.length) {
              addEnumerationFailure(failures, { ...base, drivetrain, transmission }, "The UI transmission has no selectable engine.");
              continue;
            }

            for (const engineCode of engines) {
              const platform = getPlatform(variant.platform);
              const configuration: CatalogConfiguration = {
                brand: platform.brand,
                platform: platform.value,
                model: platform.label,
                year,
                trim: variant.trim,
                engineCode,
                drivetrain,
                transmission,
              };
              const key = profileKey(configuration);
              if (configurations.has(key)) {
                addEnumerationFailure(failures, configuration, "The selector graph creates this exact configuration more than once.");
              } else {
                configurations.set(key, configuration);
              }
            }
          }
        }
      }
    }
  }

  return { configurations: [...configurations.values()], failures };
}

export function persistencePayload(configuration: CatalogConfiguration, ownerId = "00000000-0000-4000-8000-000000000001") {
  return vehicleInsertFromProfile(configuration, {
    ownerId,
    nickname: `__keeper_catalog_test__:${configuration.platform}:${configuration.year}`.slice(0, 60),
    mileage: null,
    isPrimary: false,
  });
}

export function fitmentManifestSha256(configurations: DatabaseFitment[]) {
  const keys = configurations.map(databaseFitmentKey).sort();
  return createHash("sha256").update(JSON.stringify(keys)).digest("hex");
}

export async function loadDatabaseFitmentManifest(root = process.cwd()): Promise<DatabaseFitmentManifest | null> {
  const migrationsDirectory = join(root, "supabase", "migrations");
  const names = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .reverse();

  for (const name of names) {
    const path = join(migrationsDirectory, name);
    const sql = await readFile(path, "utf8");
    if (!sql.includes(catalogMigrationMarker)) continue;
    const start = sql.indexOf(catalogJsonStart);
    const end = sql.indexOf(catalogJsonStart, start + catalogJsonStart.length);
    if (start < 0 || end < 0) throw new Error(`${name} has a Keeper catalog marker but no embedded JSON manifest.`);
    const json = sql.slice(start + catalogJsonStart.length, end).trim();
    const configurations = JSON.parse(json) as DatabaseFitment[];
    return { migrationPath: path, configurations, sha256: fitmentManifestSha256(configurations) };
  }
  return null;
}

function profilesEqual(left: VehicleProfile, right: VehicleProfile) {
  return profileKey(left) === profileKey(right);
}

function matchedKnownIssues(profile: VehicleProfile) {
  return KNOWN_ISSUES.filter((issue) => matchesApplicability(profile, issue.appliesTo));
}

function expectedEnhancedRows(profile: VehicleProfile) {
  const scheduleId = getEnhancedScheduleIds(profile).find((candidate) => RESEARCH_SCHEDULES[candidate]?.length);
  return scheduleId
    ? RESEARCH_SCHEDULES[scheduleId].map((key) => RESEARCH_SCHEDULE_ROWS[key]).filter(Boolean)
    : [];
}

function failureCounts(failures: CatalogFailure[], category: CatalogFailureCategory) {
  return new Set(failures.filter((failure) => failure.category === category).map((failure) => profileKey(failure.configuration))).size;
}

export async function auditCatalog(root = process.cwd()): Promise<CatalogAudit> {
  const enumeration = enumerateCatalogConfigurations();
  const failures = [...enumeration.failures];
  const orphanedData = new Set<string>();
  const databaseManifest = await loadDatabaseFitmentManifest(root);
  const databaseKeys = new Set(databaseManifest?.configurations.map(databaseFitmentKey) ?? []);
  const frontendDatabaseKeys = new Set<string>();
  const reachableSchedules = new Set<string>();

  for (const configuration of enumeration.configurations) {
    const payload = persistencePayload(configuration);
    const databaseKey = databaseFitmentKey(payload);
    if (frontendDatabaseKeys.has(databaseKey)) {
      failures.push({
        category: "invalid-configuration",
        configuration,
        reason: "A different frontend profile serializes to the same Supabase fitment row.",
      });
    }
    frontendDatabaseKeys.add(databaseKey);

    if (!databaseManifest || !databaseKeys.has(databaseKey)) {
      failures.push({
        category: "cannot-save",
        configuration,
        reason: databaseManifest
          ? "Frontend configuration is absent from the latest Supabase catalog-fitment migration and would be rejected by database validation."
          : "No generated Supabase catalog-fitment migration was found.",
      });
    }

    const simulatedRow: VehicleRow = {
      ...payload,
      id: "00000000-0000-4000-8000-000000000002",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    try {
      const restored = vehicleProfileFromRow(simulatedRow);
      if (!profilesEqual(configuration, restored)) {
        failures.push({ category: "invalid-configuration", configuration, reason: `Garage persistence round-trip changed the profile to ${profileKey(restored)}.` });
      }
    } catch (error) {
      failures.push({ category: "invalid-configuration", configuration, reason: error instanceof Error ? error.message : String(error) });
    }

    const maintenance = getMaintenanceCatalog(configuration);
    if (!maintenance.length) {
      failures.push({ category: "missing-maintenance", configuration, reason: "Vehicle profile resolved successfully, but no maintenance schedule was returned." });
    } else {
      const duplicateSlugs = maintenance.filter((item, index) => maintenance.findIndex((candidate) => candidate.slug === item.slug) !== index);
      if (duplicateSlugs.length) {
        failures.push({ category: "invalid-configuration", configuration, reason: `Maintenance schedule contains duplicate slugs: ${[...new Set(duplicateSlugs.map((item) => item.slug))].join(", ")}.` });
      }
      const leakedItem = maintenance.find((item) => !matchesApplicability(configuration, item.appliesTo));
      if (leakedItem) {
        failures.push({ category: "data-leak", configuration, reason: `Maintenance item ${leakedItem.slug} declares applicability outside the selected profile.` });
      }
    }

    const scheduleIds = getEnhancedScheduleIds(configuration);
    scheduleIds.forEach((scheduleId) => reachableSchedules.add(scheduleId));
    const enhancedRows = expectedEnhancedRows(configuration);
    if (enhancedRows.length) {
      if (maintenance.some((item) => !item.research)) {
        failures.push({ category: "missing-research", configuration, reason: "Enhanced workbook schedule resolved, but one or more maintenance rows lost their rich research metadata." });
      }
      const expectedFluidSpecifications = enhancedRows.filter((row) => row.amount || row.specification).length;
      const mappedFluidSpecifications = maintenance.filter((item) => item.research?.fluidAmount || item.research?.fluidSpecification).length;
      if (mappedFluidSpecifications < expectedFluidSpecifications) {
        failures.push({ category: "missing-fluids", configuration, reason: `Enhanced schedule contains ${expectedFluidSpecifications} fluid/specification rows, but Keeper returned ${mappedFluidSpecifications}.` });
      }
    }

    const issuesForPlatform = KNOWN_ISSUES.filter((issue) => (issue.appliesTo.platforms ?? ["F30"]).includes(configuration.platform));
    const issues = matchedKnownIssues(configuration);
    if (issuesForPlatform.length && !issues.length) {
      failures.push({ category: "missing-known-issues", configuration, reason: `Platform has ${issuesForPlatform.length} known-issue records, but none match this exact configuration.` });
    }
    const leakedIssue = issues.find((issue) => !(issue.appliesTo.platforms ?? ["F30"]).includes(configuration.platform));
    if (leakedIssue) {
      failures.push({ category: "data-leak", configuration, reason: `Known issue ${leakedIssue.slug} leaked from another platform.` });
    }

    const expectedInsights = RESEARCH_INSIGHTS.filter((insight) => insight.platform === configuration.platform);
    const insights = getOwnershipInsights(configuration);
    if (expectedInsights.length && insights.length !== expectedInsights.length) {
      failures.push({ category: "missing-research", configuration, reason: `Platform has ${expectedInsights.length} ownership-research records, but Keeper returned ${insights.length}.` });
    }
    if (insights.some((insight) => insight.platform !== configuration.platform)) {
      failures.push({ category: "data-leak", configuration, reason: "Ownership research from a different platform was returned." });
    }
  }

  if (databaseManifest) {
    for (const configuration of databaseManifest.configurations) {
      if (!frontendDatabaseKeys.has(databaseFitmentKey(configuration))) {
        orphanedData.add(`Database fitment has no frontend configuration: ${databaseFitmentKey(configuration)}`);
      }
    }
  }

  const frontendPlatforms = new Set(PLATFORM_OPTIONS.map((platform) => platform.value));
  for (const platform of RESEARCH_PLATFORMS) {
    if (!frontendPlatforms.has(platform.value)) orphanedData.add(`Enhanced platform is not selectable: ${platform.value}`);
  }

  const scheduleProfiles = new Set(RESEARCH_SCHEDULE_PROFILES.map((profile) => profile.scheduleId));
  const scheduleRowsUsed = new Set<string>();
  for (const [scheduleId, rowKeys] of Object.entries(RESEARCH_SCHEDULES)) {
    if (!scheduleProfiles.has(scheduleId)) orphanedData.add(`Enhanced schedule has no fitment profile: ${scheduleId}`);
    if (!reachableSchedules.has(scheduleId)) orphanedData.add(`Enhanced schedule is unreachable from every UI configuration: ${scheduleId}`);
    for (const rowKey of rowKeys) {
      scheduleRowsUsed.add(rowKey);
      if (!RESEARCH_SCHEDULE_ROWS[rowKey]) orphanedData.add(`Enhanced schedule ${scheduleId} references a missing row: ${rowKey}`);
    }
  }
  for (const profile of RESEARCH_SCHEDULE_PROFILES) {
    if (!RESEARCH_SCHEDULES[profile.scheduleId]?.length) orphanedData.add(`Enhanced fitment profile has no maintenance rows: ${profile.scheduleId}`);
  }
  for (const rowKey of Object.keys(RESEARCH_SCHEDULE_ROWS)) {
    if (!scheduleRowsUsed.has(rowKey)) orphanedData.add(`Normalized maintenance row is unused: ${rowKey}`);
  }

  for (const issue of RESEARCH_ISSUES) {
    if (!frontendPlatforms.has(issue.platform)) orphanedData.add(`Known issue belongs to a missing platform: ${issue.slug} / ${issue.platform}`);
    for (const scheduleId of issue.scheduleIds) {
      if (!scheduleProfiles.has(scheduleId)) orphanedData.add(`Known issue references a missing schedule profile: ${issue.slug} / ${scheduleId}`);
    }
  }
  for (const insight of RESEARCH_INSIGHTS) {
    if (!frontendPlatforms.has(insight.platform)) orphanedData.add(`Ownership insight belongs to a missing platform: ${insight.slug} / ${insight.platform}`);
  }

  const failedKeys = new Set(failures.map((failure) => profileKey(failure.configuration)));
  return {
    configurations: enumeration.configurations,
    failures,
    orphanedData: [...orphanedData].sort(),
    summary: {
      totalConfigurations: enumeration.configurations.length,
      successfulConfigurations: enumeration.configurations.length - failedKeys.size,
      failedConfigurations: failedKeys.size,
      vehiclesThatCannotBeSaved: failureCounts(failures, "cannot-save"),
      missingMaintenanceData: failureCounts(failures, "missing-maintenance"),
      missingExpectedKnownIssues: failureCounts(failures, "missing-known-issues"),
      missingExpectedFluidSpecifications: failureCounts(failures, "missing-fluids"),
      missingExpectedOwnershipResearch: failureCounts(failures, "missing-research"),
      invalidOrMismatchedConfigurations: failureCounts(failures, "invalid-configuration"),
      crossConfigurationLeaks: failureCounts(failures, "data-leak"),
      orphanedData: orphanedData.size,
    },
  };
}

export function formatCatalogAudit(audit: CatalogAudit) {
  const lines = [
    "Keeper catalog validation",
    "=========================",
    `Total vehicle configurations tested: ${audit.summary.totalConfigurations}`,
    `Successful configurations: ${audit.summary.successfulConfigurations}`,
    `Failed configurations: ${audit.summary.failedConfigurations}`,
    `Vehicles that cannot be saved: ${audit.summary.vehiclesThatCannotBeSaved}`,
    `Vehicles missing maintenance data: ${audit.summary.missingMaintenanceData}`,
    `Vehicles missing expected known-issue data: ${audit.summary.missingExpectedKnownIssues}`,
    `Vehicles missing expected fluids/specification data: ${audit.summary.missingExpectedFluidSpecifications}`,
    `Vehicles missing expected ownership/research data: ${audit.summary.missingExpectedOwnershipResearch}`,
    `Invalid or mismatched configurations: ${audit.summary.invalidOrMismatchedConfigurations}`,
    `Cross-configuration data leaks: ${audit.summary.crossConfigurationLeaks}`,
    `Orphaned catalog/platform/maintenance data: ${audit.summary.orphanedData}`,
  ];

  for (const failure of audit.failures) {
    lines.push("", `FAIL — ${configurationLabel(failure.configuration)}`, `Reason: ${failure.reason}`);
  }
  for (const orphan of audit.orphanedData) {
    lines.push("", `ORPHAN — ${orphan}`);
  }
  if (!audit.failures.length && !audit.orphanedData.length) lines.push("", "PASS — every selectable Keeper vehicle is internally valid, persistence-compatible, and connected to its expected research.");
  return lines.join("\n");
}
