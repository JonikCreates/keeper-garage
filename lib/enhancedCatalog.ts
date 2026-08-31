import type {
  EnhancedIssueRecord,
  EnhancedScheduleProfileRecord,
  EnhancedScheduleRow,
} from "./enhancedVehicleData";
import {
  RESEARCH_INSIGHTS,
  RESEARCH_ISSUES,
  RESEARCH_SCHEDULE_PROFILES,
  RESEARCH_SCHEDULE_ROWS,
  RESEARCH_SCHEDULES,
} from "./researchVehicleData";
import type {
  CatalogSource,
  KnownIssue,
  MaintenanceCatalogItem,
  SourceType,
  VehicleProfile,
} from "./catalog";

export type MaintenanceResearch = {
  guidance: "factory" | "preventive" | "factory-and-preventive" | "condition";
  entryType: string;
  action: string;
  trigger: string;
  basis: string;
  fluidAmount: string;
  fluidSpecification: string;
  verification: string;
  notes: string;
  sourceWorkbook: string;
};

export type OwnershipInsight = {
  slug: string;
  platform: string;
  category: string;
  title: string;
  summary: string;
  sourceUrl: string | null;
  sourceWorkbook: string;
};

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function transmissionFamily(value: string) {
  const source = value.toLowerCase();
  if (source.includes("manual") || /\b[456]-?mt\b/.test(source)) return "manual";
  if (source.includes("smg")) return "smg";
  if (source.includes("pdk")) return "pdk";
  if (source.includes("dsg")) return "dsg";
  if (source.includes("dct")) return "dct";
  if (source.includes("cvt") || source.includes("lineartronic")) return "cvt";
  if (source.includes("tiptronic")) return "tiptronic";
  if (source.includes("automatic") || /\b\d+-?at\b/.test(source)) return "automatic";
  return normalized(value);
}

const PLATFORM_DRIVETRAIN_OVERRIDES: Record<string, string> = {
  E36: "RWD",
  E39: "RWD",
  E82: "RWD",
  VA: "AWD",
  S550: "RWD",
  AP1: "RWD",
  AP2: "RWD",
  Z33: "RWD",
  Z34: "RWD",
  R35: "AWD",
  A90: "RWD",
  W463: "AWD",
};

// Several research indexes use the worksheet/configuration name in the column
// where other workbooks store drivetrain. Normalize those known platforms at
// the adapter boundary while retaining the original workbook value in the
// generated research file.
export function normalizeEnhancedDrivetrain(platform: string, value: string) {
  if (/^(RWD|FWD|AWD|xDrive|AWD \(quattro\))$/i.test(value.trim())) return value;
  const fixed = PLATFORM_DRIVETRAIN_OVERRIDES[platform];
  if (fixed) return fixed;
  if (platform === "E46") return /\bxi\b/i.test(value) ? "AWD" : "RWD";
  if (["E9X", "F10", "F30"].includes(platform)) return /xdrive|\bxd\b/i.test(value) ? "xDrive" : "RWD";
  return value;
}

function driveFamily(value: string) {
  const source = value.toLowerCase();
  if (source.includes("xdrive")) return "awd";
  if (source.includes("awd") || source.includes("quattro") || source.includes("all-wheel")) return "awd";
  if (source.includes("fwd") || source.includes("front-wheel")) return "fwd";
  if (source.includes("rwd") || source.includes("rear-wheel")) return "rwd";
  return normalized(value);
}

function tokenMatch(left: string, right: string) {
  const a = normalized(left);
  const b = normalized(right);
  return Boolean(a && b && (a === b || a.includes(b) || b.includes(a)));
}

function profileScore(profile: VehicleProfile, candidate: EnhancedScheduleProfileRecord) {
  if (candidate.platform !== profile.platform) return -1;
  if (profile.year < candidate.yearStart || profile.year > candidate.yearEnd) return -1;

  let score = 10;
  const candidateDrivetrain = normalizeEnhancedDrivetrain(candidate.platform, candidate.drivetrain);
  if (driveFamily(candidateDrivetrain) === driveFamily(profile.drivetrain)) score += 5;
  else if (driveFamily(candidateDrivetrain) !== "notspecified") return -1;

  if (transmissionFamily(candidate.transmission) === transmissionFamily(profile.transmission)) score += 6;
  else return -1;

  if (candidate.engineCodes.some((engine) => tokenMatch(engine, profile.engineCode)) || tokenMatch(candidate.engineLabel, profile.engineCode)) score += 7;
  if (tokenMatch(candidate.trim, profile.trim) || tokenMatch(candidate.tab, profile.trim)) score += 5;
  if (candidate.applicability && tokenMatch(candidate.applicability, profile.trim)) score += 3;
  return score;
}

function matchingProfiles(profile: VehicleProfile) {
  const scored = RESEARCH_SCHEDULE_PROFILES
    .map((candidate) => ({ candidate, score: profileScore(profile, candidate) }))
    .filter((match) => match.score >= 0)
    .sort((left, right) => right.score - left.score ||
      (RESEARCH_SCHEDULES[right.candidate.scheduleId]?.length ?? 0) - (RESEARCH_SCHEDULES[left.candidate.scheduleId]?.length ?? 0));
  if (!scored.length) return [];
  const best = scored[0].score;
  return scored.filter((match) => match.score >= best - 1).map((match) => match.candidate);
}

export function getEnhancedScheduleIds(profile: VehicleProfile) {
  return matchingProfiles(profile).map((candidate) => candidate.scheduleId);
}

export function matchesEnhancedSchedule(profile: VehicleProfile, scheduleIds: string[]) {
  if (!scheduleIds.length) return true;
  const matches = new Set(getEnhancedScheduleIds(profile));
  return scheduleIds.some((scheduleId) => matches.has(scheduleId));
}

function guidanceFor(row: EnhancedScheduleRow): MaintenanceResearch["guidance"] {
  const label = `${row.entryType} ${row.basis}`;
  const factory = /OEM|manufacturer|factory|scheduled|CBS|maintenance/i.test(label) && !/not OEM|non-OEM/i.test(label);
  const preventive = /preventive|community|ownership|enthusiast|track|severe/i.test(label);
  if (factory && preventive) return "factory-and-preventive";
  if (factory) return "factory";
  if (preventive) return "preventive";
  return "condition";
}

function intervalLabel(mileage: number | null, months: number | null, trigger: string) {
  const intervals = [
    mileage ? `${mileage.toLocaleString()} miles` : null,
    months ? months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months` : null,
  ].filter(Boolean);
  return intervals.length ? `Every ${intervals.join(" or ")}` : trigger || "Condition based";
}

function source(url: string, row: EnhancedScheduleRow, index: number): CatalogSource {
  let publisher = "Workbook reference";
  try {
    publisher = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // The workbook value is retained below and the UI will render it only as a link when valid.
  }
  const type: SourceType = /OEM|manufacturer|factory|scheduled|CBS/i.test(`${row.entryType} ${row.basis}`)
    ? "OEM"
    : "Community consensus";
  return {
    type,
    title: `${index === 0 ? "Primary" : "Supporting"} reference — ${row.name}`,
    publisher,
    url,
    note: row.verification || row.basis,
  };
}

function toCatalogItem(row: EnhancedScheduleRow, profile: VehicleProfile, sourceWorkbook: string, scheduleId: string, rowKey: string): MaintenanceCatalogItem {
  const guidance = guidanceFor(row);
  const label = intervalLabel(row.mileage, row.months, row.trigger);
  const hasFactoryPosition = guidance === "factory" || guidance === "factory-and-preventive";
  const hasOwnerPlan = guidance !== "factory";
  const sources = [row.primaryUrl, row.secondaryUrl]
    .filter((url): url is string => Boolean(url))
    .map((url, index) => source(url, row, index));
  return {
    slug: `${scheduleId}-${slug(row.name)}${/^research-r3[23]-/.test(scheduleId) ? `-${rowKey.slice(-8)}` : ""}`,
    name: row.name,
    shortName: row.name,
    category: row.category,
    description: [row.entryType, row.action, row.trigger].filter(Boolean).join(" · "),
    severity: row.severity,
    appliesTo: {
      platforms: [profile.platform],
      years: [profile.year],
      trims: [profile.trim],
      engines: [profile.engineCode],
      drivetrains: [profile.drivetrain],
      transmissions: [profile.transmission],
    },
    oem: {
      mileage: hasFactoryPosition ? row.mileage : null,
      months: hasFactoryPosition ? row.months : null,
      label: hasFactoryPosition ? label : "No fixed factory interval",
      summary: hasFactoryPosition
        ? [row.entryType, row.basis, row.verification].filter(Boolean).join(" · ")
        : `${row.entryType || "Condition-based guidance"}. This is kept separate from factory scheduled maintenance.`,
    },
    community: {
      mileage: hasOwnerPlan ? row.mileage : null,
      months: hasOwnerPlan ? row.months : null,
      label: hasOwnerPlan ? label : "Follow the factory/model-year schedule",
      summary: [row.trigger, row.notes].filter(Boolean).join(" · ") || row.basis,
    },
    parts: row.amount || row.specification
      ? [{ name: row.name, partNumber: null, note: [row.amount, row.specification].filter(Boolean).join(" · ") }]
      : [],
    sources,
    diy: [row.verification, row.notes].filter(Boolean),
    research: {
      guidance,
      entryType: row.entryType,
      action: row.action,
      trigger: row.trigger,
      basis: row.basis,
      fluidAmount: row.amount,
      fluidSpecification: row.specification,
      verification: row.verification,
      notes: row.notes,
      sourceWorkbook,
    },
  };
}

export function enhancedScheduleRowAppliesToProfile(profile: VehicleProfile, row: EnhancedScheduleRow) {
  return !(profile.platform === "E46"
    && row.name === "Convertible top hydraulics, tension components & drains"
    && !profile.trim.endsWith("Cic"));
}

export function getEnhancedMaintenanceCatalog(profile: VehicleProfile) {
  const match = matchingProfiles(profile).find((candidate) => RESEARCH_SCHEDULES[candidate.scheduleId]?.length);
  if (!match) return [];
  return RESEARCH_SCHEDULES[match.scheduleId]
    .map((rowKey) => ({ rowKey, row: RESEARCH_SCHEDULE_ROWS[rowKey] }))
    .filter((entry): entry is { rowKey: string; row: EnhancedScheduleRow } => Boolean(entry.row))
    .filter(({ row }) => enhancedScheduleRowAppliesToProfile(profile, row))
    .map(({ row, rowKey }) => toCatalogItem(row, profile, match.sourceWorkbook, match.scheduleId, rowKey));
}

function normalizedSourceType(value: string): SourceType {
  return value === "OEM" ? "OEM" : "Community consensus";
}

function toKnownIssue(record: EnhancedIssueRecord): KnownIssue {
  return {
    slug: record.slug,
    system: record.system,
    issue: record.issue,
    description: record.description,
    symptoms: record.symptoms,
    typicalMileage: record.typicalMileage,
    severity: record.severity,
    urgency: record.urgency,
    evidence: record.evidence as KnownIssue["evidence"],
    evidenceLabel: record.evidenceLabel,
    preventativeAction: record.preventativeAction,
    inspectionReminder: record.inspectionReminder,
    verification: record.verification,
    clarification: record.clarification,
    configuration: record.configuration,
    sourceWorkbook: record.sourceWorkbook,
    appliesTo: {
      platforms: [record.platform],
      years: record.years.length ? record.years : undefined,
      scheduleIds: record.scheduleIds.length ? record.scheduleIds : undefined,
    },
    sources: record.source ? [{ ...record.source, type: normalizedSourceType(record.source.type) }] : [],
  };
}

export const ENHANCED_KNOWN_ISSUES: KnownIssue[] = RESEARCH_ISSUES.map(toKnownIssue);

export function getOwnershipInsights(profile: VehicleProfile): OwnershipInsight[] {
  return RESEARCH_INSIGHTS.filter((insight) => insight.platform === profile.platform);
}
