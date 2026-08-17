import { EXPANDED_SCHEDULES, EXPANDED_VARIANTS } from "./expandedCatalogData";
import type { CatalogSource, MaintenanceCatalogItem, VehicleProfile } from "./catalog";

type WorkbookScheduleRow = {
  slug: string;
  name: string;
  category: string;
  severity: MaintenanceCatalogItem["severity"];
  entryType: string;
  action: string;
  mileage: number | null;
  months: number | null;
  trigger: string;
  basis: string;
  amount: string;
  specification: string;
  primaryUrl: string | null;
  secondaryUrl: string | null;
  verification: string;
  notes: string;
};

const schedules = EXPANDED_SCHEDULES as Record<string, WorkbookScheduleRow[]>;

function intervalLabel(mileage: number | null, months: number | null, trigger: string) {
  const values = [
    mileage ? `${mileage.toLocaleString()} miles` : null,
    months ? months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months` : null,
  ].filter(Boolean);
  return values.length ? `Every ${values.join(" or ")}` : trigger || "Condition based";
}

function source(url: string, row: WorkbookScheduleRow, index: number): CatalogSource {
  const publisher = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Workbook reference";
    }
  })();
  const oem = /BMW|Porsche|Mazda|Subaru|factory|scheduled|OEM/i.test(`${row.entryType} ${row.basis}`) && !/preventive ownership|independent/i.test(row.basis);
  return {
    type: oem ? "OEM" : "Community consensus",
    title: `${index === 0 ? "Primary" : "Supporting"} reference — ${row.name}`,
    publisher,
    url,
    note: row.verification || row.basis,
  };
}

function toCatalogItem(row: WorkbookScheduleRow, profile: VehicleProfile): MaintenanceCatalogItem {
  const label = intervalLabel(row.mileage, row.months, row.trigger);
  const sources = [row.primaryUrl, row.secondaryUrl]
    .filter((url): url is string => Boolean(url))
    .map((url, index) => source(url, row, index));
  return {
    slug: row.slug,
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
      mileage: row.mileage,
      months: row.months,
      label,
      summary: `${row.basis}. ${row.verification}`.trim(),
    },
    community: {
      mileage: row.mileage,
      months: row.months,
      label,
      summary: `${row.trigger}. ${row.notes}`.trim(),
    },
    parts: [],
    sources,
    diy: [row.amount, row.specification, row.verification, row.notes].filter(Boolean),
  };
}

export function getExpandedMaintenanceCatalog(profile: VehicleProfile) {
  const variant = EXPANDED_VARIANTS.find((candidate) =>
    candidate.platform === profile.platform
    && candidate.trim === profile.trim
    && profile.year >= candidate.yearStart
    && profile.year <= candidate.yearEnd
    && candidate.engineCode === profile.engineCode
    && candidate.drivetrain === profile.drivetrain
    && candidate.transmission === profile.transmission);
  return variant ? (schedules[variant.scheduleId] ?? []).map((row) => toCatalogItem(row, profile)) : [];
}
