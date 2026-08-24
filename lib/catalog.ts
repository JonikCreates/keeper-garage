import { CLASSIC_KNOWN_ISSUES, getClassicMaintenanceCatalog } from "./classicCatalog";
import {
  ENHANCED_KNOWN_ISSUES,
  getEnhancedMaintenanceCatalog,
  matchesEnhancedSchedule,
  normalizeEnhancedDrivetrain,
  type MaintenanceResearch,
} from "./enhancedCatalog";
import { RESEARCH_PLATFORMS, RESEARCH_VARIANTS } from "./researchVehicleData";
import { getExpandedMaintenanceCatalog } from "./expandedCatalog";
import { EXPANDED_PLATFORMS, EXPANDED_VARIANTS } from "./expandedCatalogData";
import { EXPANDED_KNOWN_ISSUES } from "./expandedKnownIssues";

export type SourceType = "OEM" | "Community consensus" | "Individual experience";

export type CatalogSource = {
  type: SourceType;
  title: string;
  publisher: string;
  url: string;
  note: string;
};

export type Applicability = {
  platforms?: string[];
  years?: number[];
  trims?: string[];
  engines?: string[];
  drivetrains?: string[];
  transmissions?: string[];
  scheduleIds?: string[];
};

export const BRAND_OPTIONS = [
  { value: "BMW", label: "BMW" },
  { value: "Porsche", label: "Porsche" },
  { value: "Subaru", label: "Subaru" },
  { value: "Mazda", label: "Mazda" },
  { value: "Volkswagen", label: "Volkswagen" },
  { value: "Audi", label: "Audi" },
  { value: "Ford", label: "Ford" },
  { value: "Honda", label: "Honda" },
  { value: "Lexus", label: "Lexus" },
  { value: "Nissan", label: "Nissan" },
  { value: "Toyota", label: "Toyota" },
  { value: "Scion", label: "Scion" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
] as const;

export type VehicleBrand = typeof BRAND_OPTIONS[number]["value"];
// Platform identifiers are catalog data, not a closed code enum. This keeps future
// research imports from requiring a type-system rewrite for every new chassis.
export type VehiclePlatform = string;

export type VehicleProfile = {
  brand: VehicleBrand;
  platform: VehiclePlatform;
  year: number;
  trim: string;
  engineCode: string;
  drivetrain: string;
  transmission: string;
};

export type MaintenanceCatalogItem = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  severity: "critical" | "important" | "routine";
  appliesTo: Applicability;
  oem: { mileage: number | null; months: number | null; label: string; summary: string };
  community: { mileage: number | null; months: number | null; label: string; summary: string };
  parts: Array<{ name: string; partNumber: string | null; note: string; purchaseUrl?: string }>;
  sources: CatalogSource[];
  diy: string[];
  research?: MaintenanceResearch;
};

export type KnownIssue = {
  slug: string;
  system: string;
  component?: string;
  issue: string;
  aliases?: string[];
  keywords?: string[];
  description: string;
  symptoms: string;
  typicalMileage: string;
  severity: "critical" | "important" | "routine";
  urgency: "urgent" | "watch";
  evidence: "BMW recall" | "BMW bulletin" | "Safety recall" | "Manufacturer bulletin" | "Community consensus";
  preventativeAction: string;
  appliesTo: Applicability;
  sources: CatalogSource[];
  evidenceLabel?: string;
  inspectionReminder?: string;
  verification?: string;
  clarification?: string;
  configuration?: string;
  sourceWorkbook?: string;
};

export type ProjectIdea = {
  slug: string;
  title: string;
  description: string;
  payoff: string;
  appliesTo: Applicability;
};

export type PlatformOption = { value: VehiclePlatform; brand: VehicleBrand; label: string; yearStart: number; yearEnd: number };
export type TrimOption = { platform: VehiclePlatform; value: string; label: string; yearStart: number; yearEnd: number; engines: string[]; drivetrains: string[]; transmissions: string[] };
export type VehicleFamilyOption = { value: string; brand: VehicleBrand; label: string; platforms: VehiclePlatform[] };
export type VehicleVariantOption = { value: string; platform: VehiclePlatform; trim: string; label: string; yearStart: number; yearEnd: number };

const CORE_PLATFORM_OPTIONS: PlatformOption[] = [
  { value: "F30", brand: "BMW", label: "3 Series (F30)", yearStart: 2012, yearEnd: 2018 },
  { value: "E46", brand: "BMW", label: "3 Series (E46)", yearStart: 1999, yearEnd: 2006 },
  { value: "E39", brand: "BMW", label: "5 Series (E39)", yearStart: 1997, yearEnd: 2003 },
  { value: "E36", brand: "BMW", label: "3 Series (E36)", yearStart: 1992, yearEnd: 1999 },
  ...EXPANDED_PLATFORMS as PlatformOption[],
];

const existingPlatformIds = new Set(CORE_PLATFORM_OPTIONS.map((platform) => platform.value));
export const PLATFORM_OPTIONS: PlatformOption[] = [
  ...CORE_PLATFORM_OPTIONS,
  ...RESEARCH_PLATFORMS.filter((platform) => !existingPlatformIds.has(platform.value)) as PlatformOption[],
];

const GROUPED_VEHICLE_FAMILIES: VehicleFamilyOption[] = [
  { value: "F10", brand: "BMW", label: "5 Series / M5 (F10)", platforms: ["F10", "F10M5"] },
  { value: "F32", brand: "BMW", label: "4 Series Coupe / Convertible (F32/F33)", platforms: ["F32", "F33"] },
];

const groupedFamilyByPlatform = new Map(GROUPED_VEHICLE_FAMILIES.flatMap((family) =>
  family.platforms.map((platform) => [platform, family] as const)));

// Customer-facing families may contain multiple technical chassis. The profile,
// maintenance matching, and persisted model continue to use the exact platform.
export const VEHICLE_FAMILY_OPTIONS: VehicleFamilyOption[] = (() => {
  const families: VehicleFamilyOption[] = [];
  const seen = new Set<string>();
  for (const platform of PLATFORM_OPTIONS) {
    const grouped = groupedFamilyByPlatform.get(platform.value);
    const family = grouped ?? {
      value: platform.value,
      brand: platform.brand,
      label: platform.label,
      platforms: [platform.value],
    };
    if (seen.has(family.value)) continue;
    seen.add(family.value);
    families.push(family);
  }
  return families;
})();

const newlySelectableExistingSchedules = new Set([
  "research-f10-535i-11-16-n55-6mt",
  "research-f10-550i-11-13-n63-6mt",
  "research-f30-f30-activehybrid-3",
]);

const adaptedEnhancedVariants = RESEARCH_VARIANTS
  .filter((variant) => !existingPlatformIds.has(variant.platform) || newlySelectableExistingSchedules.has(variant.scheduleId))
  .map((variant) => {
    const activeHybrid = variant.scheduleId === "research-f30-f30-activehybrid-3";
    const nismo = ["Z33", "Z34"].includes(variant.platform) && variant.scheduleId.includes("-nismo-");
    return {
      ...variant,
      trim: activeHybrid ? "ActiveHybrid 3" : nismo ? "NISMO" : variant.trim,
      label: activeHybrid ? "ActiveHybrid 3" : nismo ? "NISMO" : variant.label,
      drivetrain: normalizeEnhancedDrivetrain(variant.platform, variant.drivetrain),
    };
  });

const catalogVariants = [
  ...EXPANDED_VARIANTS,
  ...adaptedEnhancedVariants,
];

export const TRIM_OPTIONS: TrimOption[] = [
  { platform: "F30", value: "320i", label: "320i", yearStart: 2013, yearEnd: 2018, engines: ["N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { platform: "F30", value: "328i", label: "328i", yearStart: 2012, yearEnd: 2016, engines: ["N26", "N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { platform: "F30", value: "328d", label: "328d — Diesel", yearStart: 2014, yearEnd: 2018, engines: ["N47T"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic"] },
  { platform: "F30", value: "330e", label: "330e — Plug-in Hybrid", yearStart: 2016, yearEnd: 2018, engines: ["B48-PHEV"], drivetrains: ["RWD"], transmissions: ["8-speed automatic"] },
  { platform: "F30", value: "330i", label: "330i", yearStart: 2017, yearEnd: 2018, engines: ["B46"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { platform: "F30", value: "335i", label: "335i", yearStart: 2012, yearEnd: 2015, engines: ["N55"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { platform: "F30", value: "340i", label: "340i", yearStart: 2016, yearEnd: 2018, engines: ["B58"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  // REVIEW DECISION: US-market body styles stay separate so convertible, Touring, AWD, M56, M3, and M5 maintenance rows only appear where they apply.
  { platform: "E46", value: "323i", label: "323i Sedan", yearStart: 1999, yearEnd: 2000, engines: ["M52TUB25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "323Ci", label: "323Ci Coupe", yearStart: 2000, yearEnd: 2000, engines: ["M52TUB25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "323Cic", label: "323Ci Convertible", yearStart: 2000, yearEnd: 2000, engines: ["M52TUB25"], drivetrains: ["RWD"], transmissions: ["5-speed automatic"] },
  { platform: "E46", value: "323iT", label: "323i Sport Wagon", yearStart: 2000, yearEnd: 2000, engines: ["M52TUB25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "328i", label: "328i Sedan", yearStart: 1999, yearEnd: 2000, engines: ["M52TUB28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "328Ci", label: "328Ci Coupe", yearStart: 2000, yearEnd: 2000, engines: ["M52TUB28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325i", label: "325i Sedan", yearStart: 2001, yearEnd: 2005, engines: ["M54B25", "M56B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325Ci", label: "325Ci Coupe", yearStart: 2001, yearEnd: 2006, engines: ["M54B25", "M56B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325Cic", label: "325Ci Convertible", yearStart: 2001, yearEnd: 2006, engines: ["M54B25", "M56B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325iT", label: "325i Sport Wagon", yearStart: 2001, yearEnd: 2005, engines: ["M54B25", "M56B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325xi", label: "325xi Sedan", yearStart: 2001, yearEnd: 2005, engines: ["M54B25"], drivetrains: ["AWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "325xiT", label: "325xi Sport Wagon", yearStart: 2001, yearEnd: 2005, engines: ["M54B25"], drivetrains: ["AWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "330i", label: "330i Sedan", yearStart: 2001, yearEnd: 2005, engines: ["M54B30"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "6-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "330Ci", label: "330Ci Coupe", yearStart: 2001, yearEnd: 2006, engines: ["M54B30"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "6-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "330Cic", label: "330Ci Convertible", yearStart: 2001, yearEnd: 2006, engines: ["M54B30"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "6-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "330xi", label: "330xi Sedan", yearStart: 2001, yearEnd: 2005, engines: ["M54B30"], drivetrains: ["AWD"], transmissions: ["5-speed manual", "6-speed manual", "5-speed automatic"] },
  { platform: "E46", value: "M3", label: "M3 Coupe / Convertible", yearStart: 2001, yearEnd: 2006, engines: ["S54B32"], drivetrains: ["RWD"], transmissions: ["6-speed manual", "6-speed SMG II"] },
  { platform: "E39", value: "528i", label: "528i Sedan", yearStart: 1997, yearEnd: 2000, engines: ["M52B28", "M52TUB28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic", "5-speed automatic"] },
  { platform: "E39", value: "528iT", label: "528i Touring", yearStart: 1999, yearEnd: 2000, engines: ["M52TUB28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E39", value: "525i", label: "525i Sedan", yearStart: 2001, yearEnd: 2003, engines: ["M54B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E39", value: "525iT", label: "525i Touring", yearStart: 2001, yearEnd: 2003, engines: ["M54B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E39", value: "530i", label: "530i Sedan", yearStart: 2001, yearEnd: 2003, engines: ["M54B30"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
  { platform: "E39", value: "540i", label: "540i Sedan", yearStart: 1997, yearEnd: 2003, engines: ["M62B44", "M62TUB44"], drivetrains: ["RWD"], transmissions: ["6-speed manual", "5-speed automatic"] },
  { platform: "E39", value: "540iT", label: "540i Touring", yearStart: 1997, yearEnd: 2003, engines: ["M62B44", "M62TUB44"], drivetrains: ["RWD"], transmissions: ["5-speed automatic"] },
  { platform: "E39", value: "M5", label: "M5 Sedan", yearStart: 2000, yearEnd: 2003, engines: ["S62B50"], drivetrains: ["RWD"], transmissions: ["6-speed manual"] },
  { platform: "E36", value: "318i", label: "318i", yearStart: 1992, yearEnd: 1998, engines: ["M42", "M44"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "318is", label: "318is", yearStart: 1992, yearEnd: 1998, engines: ["M42", "M44"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "318ic", label: "318ic", yearStart: 1994, yearEnd: 1998, engines: ["M42", "M44"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "318ti", label: "318ti Compact", yearStart: 1995, yearEnd: 1999, engines: ["M42", "M44"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "325i", label: "325i", yearStart: 1992, yearEnd: 1995, engines: ["M50-NV", "M50TU"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "325is", label: "325is", yearStart: 1992, yearEnd: 1995, engines: ["M50-NV", "M50TU"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "325ic", label: "325ic", yearStart: 1994, yearEnd: 1995, engines: ["M50TU"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "323i", label: "323i", yearStart: 1998, yearEnd: 1999, engines: ["M52B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "323is", label: "323is", yearStart: 1998, yearEnd: 1999, engines: ["M52B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "323ic", label: "323ic", yearStart: 1998, yearEnd: 1999, engines: ["M52B25"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "328i", label: "328i", yearStart: 1996, yearEnd: 1999, engines: ["M52B28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "328is", label: "328is", yearStart: 1996, yearEnd: 1999, engines: ["M52B28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "328ic", label: "328ic", yearStart: 1996, yearEnd: 1999, engines: ["M52B28"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "4-speed automatic"] },
  { platform: "E36", value: "M3", label: "M3", yearStart: 1995, yearEnd: 1999, engines: ["S50US", "S52US"], drivetrains: ["RWD"], transmissions: ["5-speed manual", "5-speed automatic"] },
];

export function getTrimOptions(platform: VehicleProfile["platform"], year?: number) {
  const expanded = catalogVariants.filter((variant) => variant.platform === platform
    && (year === undefined || (year >= variant.yearStart && year <= variant.yearEnd)));
  const expandedOptions = [...new Set(expanded.map((variant) => variant.trim))].map((trim): TrimOption => {
      const matches = expanded.filter((variant) => variant.trim === trim);
      return {
        platform,
        value: trim,
        label: matches[0].label,
        yearStart: Math.min(...matches.map((variant) => variant.yearStart)),
        yearEnd: Math.max(...matches.map((variant) => variant.yearEnd)),
        engines: [...new Set(matches.map((variant) => variant.engineCode))],
        drivetrains: [...new Set(matches.map((variant) => variant.drivetrain))],
        transmissions: [...new Set(matches.map((variant) => variant.transmission))],
      };
    });
  const expandedTrims = new Set(expandedOptions.map((option) => option.value));
  const manualOptions = TRIM_OPTIONS.filter((option) => option.platform === platform
    && !expandedTrims.has(option.value)
    && (year === undefined || (year >= option.yearStart && year <= option.yearEnd)));
  return [...manualOptions, ...expandedOptions];
}

export function getVehicleFamilyOptions(brand: VehicleBrand) {
  return VEHICLE_FAMILY_OPTIONS.filter((family) => family.brand === brand);
}

export function getVehicleFamilyForPlatform(platform: VehiclePlatform) {
  return groupedFamilyByPlatform.get(platform)
    ?? VEHICLE_FAMILY_OPTIONS.find((family) => family.platforms.includes(platform))
    ?? VEHICLE_FAMILY_OPTIONS[0];
}

export function vehicleVariantKey(platform: VehiclePlatform, trim: string) {
  return `${encodeURIComponent(platform)}::${encodeURIComponent(trim)}`;
}

export function getVehicleVariantOptions(familyValue: string) {
  const family = VEHICLE_FAMILY_OPTIONS.find((candidate) => candidate.value === familyValue);
  if (!family) return [];
  return family.platforms.flatMap((platform) => getTrimOptions(platform).map((trim): VehicleVariantOption => {
    const bodyLabel = family.value === "F32"
      ? platform === "F33" ? `${trim.label} Convertible` : `${trim.label} Coupe`
      : trim.label;
    return {
      value: vehicleVariantKey(platform, trim.value),
      platform,
      trim: trim.value,
      label: bodyLabel,
      yearStart: trim.yearStart,
      yearEnd: trim.yearEnd,
    };
  }));
}

export function getVehicleVariant(familyValue: string, value: string) {
  return getVehicleVariantOptions(familyValue).find((variant) => variant.value === value);
}

export function getPlatform(platform: VehicleProfile["platform"]) {
  return PLATFORM_OPTIONS.find((option) => option.value === platform) ?? PLATFORM_OPTIONS[0];
}

export function getPlatformOptions(brand: VehicleBrand, year?: number) {
  return PLATFORM_OPTIONS.filter((option) =>
    option.brand === brand &&
    (year === undefined || getYearOptions(option.value).includes(year))
  );
}

export function getYearOptionsForBrand(brand: VehicleBrand) {
  const years = new Set<number>();
  for (const platform of PLATFORM_OPTIONS) {
    if (platform.brand !== brand) continue;
    for (const year of getYearOptions(platform.value)) years.add(year);
  }
  return [...years].sort((left, right) => right - left);
}

export function getBrandForPlatform(platform: VehicleProfile["platform"]) {
  return getPlatform(platform).brand;
}

export function getYearOptions(platform: VehicleProfile["platform"]) {
  const option = getPlatform(platform);
  const variantRanges = catalogVariants.filter((variant) => variant.platform === platform);
  const trimRanges = TRIM_OPTIONS.filter((trim) => trim.platform === platform);
  const ranges = [...variantRanges, ...trimRanges];
  if (!ranges.length) return Array.from({ length: option.yearEnd - option.yearStart + 1 }, (_, index) => option.yearEnd - index);
  const years = new Set<number>();
  for (const range of ranges) {
    for (let year = range.yearStart; year <= range.yearEnd; year += 1) years.add(year);
  }
  return [...years].sort((left, right) => right - left);
}

export function getYearOptionsForTrim(platform: VehicleProfile["platform"], trim: string) {
  const ranges = [
    ...catalogVariants.filter((variant) => variant.platform === platform && variant.trim === trim),
    ...TRIM_OPTIONS.filter((option) => option.platform === platform && option.value === trim),
  ];
  const years = new Set<number>();
  for (const range of ranges) {
    for (let year = range.yearStart; year <= range.yearEnd; year += 1) years.add(year);
  }
  return [...years].sort((left, right) => right - left);
}

export function getEngineOptions(platform: VehicleProfile["platform"], trim: string, year: number, transmission?: string) {
  const expanded = catalogVariants.filter((variant) => variant.platform === platform
    && variant.trim === trim
    && year >= variant.yearStart
    && year <= variant.yearEnd
    && (!transmission || variant.transmission === transmission));
  if (expanded.length) return [...new Set(expanded.map((variant) => variant.engineCode))];
  const option = TRIM_OPTIONS.find((candidate) => candidate.platform === platform && candidate.value === trim);
  if (!option) return [];
  const engines = [...option.engines] as string[];
  if (platform === "E46") {
    if (!trim.startsWith("325") || year < 2003 || transmission?.includes("manual")) return engines.filter((engine) => engine !== "M56B25");
    return engines;
  }
  if (platform === "E39") {
    if (trim.startsWith("528")) {
      if (year <= 1998 || (year === 1999 && transmission === "4-speed automatic")) return engines.filter((engine) => engine === "M52B28");
      return engines.filter((engine) => engine === "M52TUB28");
    }
    if (trim.startsWith("540")) return engines.filter((engine) => year <= 1998 ? engine === "M62B44" : engine === "M62TUB44");
    return engines;
  }
  if (platform !== "E36") return engines;
  if (["318i", "318is", "318ic", "318ti"].includes(trim)) return engines.filter((engine) => year <= 1995 ? engine === "M42" : engine === "M44");
  if (["325i", "325is"].includes(trim)) return engines.filter((engine) => year === 1992 ? engine === "M50-NV" : engine === "M50TU");
  if (trim === "M3") return engines.filter((engine) => year === 1995 ? engine === "S50US" : engine === "S52US");
  return engines;
}

export function getTransmissionOptions(platform: VehicleProfile["platform"], trim: string, drivetrain: string, year?: number) {
  const expanded = catalogVariants.filter((variant) => variant.platform === platform
    && variant.trim === trim
    && variant.drivetrain === drivetrain
    && (year === undefined || (year >= variant.yearStart && year <= variant.yearEnd)));
  if (expanded.length) return [...new Set(expanded.map((variant) => variant.transmission))];
  const option = TRIM_OPTIONS.find((candidate) => candidate.platform === platform && candidate.value === trim);
  if (!option) return [];
  const transmissions = [...option.transmissions] as string[];
  if (platform === "F30" && drivetrain === "xDrive" && ["328i", "330i"].includes(trim)) {
    return transmissions.filter((transmission) => transmission === "8-speed automatic");
  }
  if (platform === "E46" && trim.startsWith("330") && year) {
    return transmissions.filter((transmission) => transmission === "5-speed automatic" || (year <= 2003 ? transmission === "5-speed manual" : transmission === "6-speed manual"));
  }
  if (platform === "E39" && trim === "528i" && year) {
    return transmissions.filter((transmission) => transmission === "5-speed manual"
      || (year <= 1998 && transmission === "4-speed automatic")
      || (year === 1999 && ["4-speed automatic", "5-speed automatic"].includes(transmission))
      || (year >= 2000 && transmission === "5-speed automatic"));
  }
  return transmissions;
}

export function getDrivetrainOptions(platform: VehicleProfile["platform"], trim: string, year?: number) {
  const expanded = catalogVariants.filter((variant) => variant.platform === platform
    && variant.trim === trim
    && (year === undefined || (year >= variant.yearStart && year <= variant.yearEnd)));
  if (expanded.length) return [...new Set(expanded.map((variant) => variant.drivetrain))];
  return [...(TRIM_OPTIONS.find((candidate) => candidate.platform === platform && candidate.value === trim)?.drivetrains ?? [])];
}

export function inferEngine(platform: VehicleProfile["platform"], trim: string, year: number, transmission?: string, current?: string) {
  const engines = getEngineOptions(platform, trim, year, transmission);
  if (engines.includes(current ?? "")) return current as string;
  return engines[0] ?? "Unknown";
}

export function getEngineLabel(profile: VehicleProfile) {
  return catalogVariants.find((variant) => variant.platform === profile.platform
    && variant.trim === profile.trim
    && profile.year >= variant.yearStart
    && profile.year <= variant.yearEnd
    && variant.engineCode === profile.engineCode)?.engineLabel ?? profile.engineCode;
}

export function matchesApplicability(profile: VehicleProfile, rule: Applicability) {
  const platforms = rule.platforms ?? ["F30"];
  return platforms.includes(profile.platform) &&
    (!rule.years || rule.years.includes(profile.year)) &&
    (!rule.trims || rule.trims.includes(profile.trim)) &&
    (!rule.engines || rule.engines.includes(profile.engineCode)) &&
    (!rule.drivetrains || rule.drivetrains.includes(profile.drivetrain)) &&
    (!rule.transmissions || rule.transmissions.includes(profile.transmission)) &&
    (!rule.scheduleIds || matchesEnhancedSchedule(profile, rule.scheduleIds));
}

const BMW_2016: CatalogSource = {
  type: "OEM",
  title: "2016 Model Year Maintenance Requirements",
  publisher: "BMW of North America · SIB 00 01 15",
  url: "https://bmwrepairguide.com/sib/000115.pdf",
  note: "Factory model and engine mapping plus 2016 maintenance operations.",
};

const BMW_2014: CatalogSource = {
  type: "OEM",
  title: "2014 Model Year Maintenance Changes",
  publisher: "BMW of North America · SIB 00 01 13",
  url: "https://bmwrepairguide.com/sib/000113.pdf",
  note: "Introduced the 10,000-mile or 12-month basic interval and diesel service requirements.",
};

const FCP_ENGINE: CatalogSource = {
  type: "Community consensus",
  title: "Engine Maintenance Hub",
  publisher: "FCP Euro",
  url: "https://info.fcpeuro.com/enginehub",
  note: "Independent European-car service guidance used as a conservative planning layer.",
};

const F30_BUYER: CatalogSource = {
  type: "Community consensus",
  title: "F30 used buying guide and owner checks",
  publisher: "F30Post",
  url: "https://f30.bimmerpost.com/forums/showthread.php?t=1503426",
  note: "Long-running model-wide owner discussion used to identify recurring inspection points.",
};

const N20_VIDEO: CatalogSource = {
  type: "Community consensus",
  title: "BMW N20/N26 diagnostic and maintenance guide",
  publisher: "FCP Euro · YouTube",
  url: "https://www.youtube.com/watch?v=NV1LWDeMw38",
  note: "Independent specialist walkthrough covering the recurring N20/N26 leak, cooling, and timing areas.",
};

const STARTMYCAR_328: CatalogSource = {
  type: "Individual experience",
  title: "BMW 328 owner-reported problems",
  publisher: "StartMyCar",
  url: "https://www.startmycar.com/bmw/328/problems",
  note: "Unverified owner complaints used only as a symptom-discovery layer; model year and diagnosis must be checked individually.",
};

const N55_VIDEO: CatalogSource = {
  type: "Community consensus",
  title: "N55 diagnostics and recurring failure guide",
  publisher: "FCP Euro · YouTube",
  url: "https://www.youtube.com/watch?v=rPUUNhjJjHU",
  note: "Independent specialist diagnostic overview covering N55 oil leaks, Valvetronic, VANOS, ignition, and cooling faults.",
};

const BMW_F3X_FUEL_TANK: CatalogSource = {
  type: "OEM",
  title: "F3x plastic fuel-tank leakage warranty extension",
  publisher: "BMW of North America · SIB 01 03 22",
  url: "https://static.nhtsa.gov/odi/tsbs/2024/MC-11009422-0001.pdf",
  note: "VIN-specific 15-year/150,000-mile leakage coverage for listed B46, B58, N20, N55, and S55 vehicles.",
};

const BMW_B46_PURGE: CatalogSource = {
  type: "OEM",
  title: "B46 EVAP purge-valve warranty extension",
  publisher: "BMW of North America · SIB 01 04 19",
  url: "https://static.nhtsa.gov/odi/tsbs/2024/MC-11008102-0001.pdf",
  note: "VIN-specific 15-year/150,000-mile coverage for listed B46 PZEV/SULEV vehicles.",
};

export const MAINTENANCE_CATALOG: MaintenanceCatalogItem[] = [
  {
    slug: "engine-oil-filter", name: "Engine oil & filter", shortName: "Oil & filter", category: "Engine", severity: "critical", appliesTo: {},
    description: "The single most useful service baseline for every turbocharged F30. Track mileage and time, not only the dashboard reminder.",
    oem: { mileage: 10000, months: 12, label: "10,000 mi / 12 mo", summary: "BMW's 2014-on maintenance schedule uses a 10,000-mile or 12-month basic engine-oil interval, with CBS as the controlling display." },
    community: { mileage: 7500, months: 12, label: "7,500 mi / 12 mo", summary: "A 5,000–7,500-mile interval is a common conservative baseline for older turbo engines, short trips, or hard use." },
    parts: [{ name: "VIN-matched oil service kit", partNumber: null, note: "Filter, seals, drain-plug hardware, oil approval, viscosity, and capacity vary by engine." }],
    sources: [BMW_2014, BMW_2016, FCP_ENGINE],
    diy: ["Verify the oil approval and capacity for the exact engine and emissions specification.", "Inspect the filter housing, drain plug, pan, and surrounding belt area for fresh leaks.", "Confirm the electronic oil level on level ground after the prescribed warm-up procedure."],
  },
  {
    slug: "brake-fluid", name: "Brake fluid", shortName: "Brake fluid", category: "Brakes", severity: "critical", appliesTo: {},
    description: "Brake fluid absorbs moisture with age, so its service clock matters even on a low-mileage car.",
    oem: { mileage: null, months: 24, label: "First at 3 yr, then 2 yr", summary: "BMW specifies the first brake-fluid service at three years and subsequent services every two years." },
    community: { mileage: null, months: 24, label: "Every 24 mo", summary: "The owner community generally follows the two-year cadence; track use can justify testing or replacement sooner." },
    parts: [{ name: "DOT 4 low-viscosity brake fluid", partNumber: null, note: "Use fresh sealed fluid meeting the vehicle specification." }],
    sources: [BMW_2014],
    diy: ["Brake work is safety-critical; do not drive with a soft or uncertain pedal.", "Keep the reservoir from running dry and use the correct bleed procedure.", "Inspect pads, rotors, hoses, and parking-brake operation at the same visit."],
  },
  {
    slug: "engine-air-filter", name: "Engine air filter", shortName: "Air filter", category: "Engine", severity: "routine", appliesTo: {},
    description: "A loaded air filter increases restriction and can hide leaves or debris in the airbox.",
    oem: { mileage: 40000, months: null, label: "About every 4th oil service", summary: "BMW's 2016 B58 schedule places the air filter at the fourth oil service, approximately 40,000 miles; verify CBS and the exact engine schedule." },
    community: { mileage: 30000, months: 36, label: "30,000 mi / 3 yr", summary: "Inspect sooner in dust, construction, or high-pollen conditions." },
    parts: [{ name: "Engine-specific filter element", partNumber: null, note: "The N20/N26, N47T, B46/B48, N55, and B58 use different parts." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Clean loose debris from the airbox without dropping it into the intake.", "Check intake boots and clamps before closing the airbox."],
  },
  {
    slug: "cabin-filter", name: "Cabin microfilter", shortName: "Cabin filter", category: "Climate", severity: "routine", appliesTo: {},
    description: "A clean microfilter protects airflow through the climate system and helps reveal water or leaf buildup early.",
    oem: { mileage: 20000, months: 24, label: "CBS / service counter", summary: "BMW links the microfilter to scheduled vehicle checks; the vehicle's CBS and service history remain controlling." },
    community: { mileage: 15000, months: 12, label: "15,000 mi / 12 mo", summary: "Annual inspection is useful in humid, leafy, dusty, or high-pollen environments." },
    parts: [{ name: "Activated-carbon microfilter", partNumber: null, note: "Confirm the housing and production-date fitment." }],
    sources: [BMW_2016, F30_BUYER],
    diy: ["Inspect the old filter for dampness or water staining.", "Clear accessible cowl debris and verify the cover seals correctly."],
  },
  {
    slug: "spark-plugs-n20", name: "Spark plugs · N20/N26", shortName: "Spark plugs", category: "Ignition", severity: "important", appliesTo: { engines: ["N20", "N26"] },
    description: "Worn plugs commonly appear first as a misfire or hesitation under boost.",
    oem: { mileage: 60000, months: null, label: "Service-counter based", summary: "BMW links spark-plug replacement to scheduled oil services; confirm the exact counter and VIN-specific service data." },
    community: { mileage: 40000, months: 48, label: "40,000 mi / 4 yr", summary: "A shorter interval is common on tuned cars or cars with repeated high-load use." },
    parts: [{ name: "VIN-matched spark plug set", partNumber: null, note: "Verify plug revision, gap policy, and torque for N20 versus N26." }],
    sources: [BMW_2016, N20_VIDEO],
    diy: ["Work on a cold engine and keep every plug indexed by cylinder.", "Do not treat repeated misfires as a plug-only problem; scan faults and inspect coils and fueling."],
  },
  {
    slug: "spark-plugs-b-series", name: "Spark plugs · B46/B48/B58", shortName: "Spark plugs", category: "Ignition", severity: "important", appliesTo: { engines: ["B46", "B48-PHEV", "B58"] },
    description: "The B-series turbo engines rely on healthy plugs and coils for clean combustion under load.",
    oem: { mileage: 60000, months: null, label: "About every 6th oil service", summary: "BMW's 2016 B58 schedule specifies spark plugs at the sixth oil service, approximately 60,000 miles." },
    community: { mileage: 45000, months: 48, label: "45,000 mi / 4 yr", summary: "Independent specialists often shorten the interval when the engine is tuned or driven hard." },
    parts: [{ name: "VIN-matched spark plug set", partNumber: null, note: "B48 and B58 plug quantities and revisions differ." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Verify plug revision and torque against current BMW information.", "Scan and diagnose recurring cylinder-specific misfires rather than repeatedly replacing parts."],
  },
  {
    slug: "spark-plugs-n55", name: "Spark plugs · N55", shortName: "Spark plugs", category: "Ignition", severity: "important", appliesTo: { engines: ["N55"] },
    description: "The turbocharged N55 needs healthy plugs and coils for clean combustion under load.",
    oem: { mileage: 60000, months: null, label: "Service-counter based", summary: "BMW links spark-plug replacement to scheduled oil services; confirm the exact counter and VIN-specific service data." },
    community: { mileage: 40000, months: 48, label: "40,000 mi / 4 yr", summary: "A shorter interval is common on tuned cars or cars with repeated high-load use." },
    parts: [{ name: "VIN-matched six-plug set", partNumber: null, note: "Verify plug revision, gap policy, and torque for the exact N55 calibration." }],
    sources: [BMW_2014, FCP_ENGINE],
    diy: ["Work on a cold engine and keep every plug indexed by cylinder.", "Scan recurring misfires and test coils and fueling instead of repeatedly replacing parts."],
  },
  {
    slug: "automatic-transmission-fluid", name: "ZF 8HP fluid & filter pan", shortName: "Transmission fluid", category: "Driveline", severity: "important", appliesTo: { transmissions: ["8-speed automatic"] },
    description: "The 8HP fill level is temperature-sensitive and its filter is integrated into the service pan.",
    oem: { mileage: null, months: null, label: "Long-term rated", summary: "BMW's 2016 maintenance bulletin describes the automatic-transmission fluid as long-term rated without a routine CBS replacement interval." },
    community: { mileage: 60000, months: 72, label: "60,000 mi / 6 yr", summary: "ZF recommends an oil change by 150,000 km under normal conditions and sooner under high loads or uncertain history; many BMW specialists use a more conservative 60,000-mile baseline." },
    parts: [{ name: "ZF 8HP pan/filter and approved fluid", partNumber: null, note: "Identify the exact transmission and fluid before ordering." }],
    sources: [BMW_2016, { type: "OEM", title: "ZF LifeguardFluid 8 product data", publisher: "ZF Aftermarket", url: "https://aftermarket.zf.com/lubricants-datasheets/lifeguardfluid-8/pds_zf_lifeguardfluid_8_en_20170920.pdf", note: "ZF states a 150,000-km change recommendation and shorter intervals for high loads or unknown use." }],
    diy: ["Keep the vehicle level and follow the required fluid-temperature window.", "A drain-and-fill is not the same operation as a machine flush.", "Use only the approved fluid and the correct shift-through/fill procedure."],
  },
  {
    slug: "manual-transmission-fluid", name: "6-speed manual fluid", shortName: "Manual fluid", category: "Driveline", severity: "important", appliesTo: { transmissions: ["6-speed manual"] },
    description: "Fresh correct-spec fluid can protect shift quality even though BMW does not provide a routine CBS interval.",
    oem: { mileage: null, months: null, label: "Long-term rated", summary: "BMW does not publish a recurring CBS fluid service for the manual gearbox in this schedule." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Independent BMW specialists commonly establish a condition-based 50,000-mile baseline for an aging enthusiast car." },
    parts: [{ name: "VIN-matched manual transmission fluid", partNumber: null, note: "Confirm gearbox identification and current BMW fluid label." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Open the fill plug before draining.", "Keep the car level and verify the exact fluid specification."],
  },
  {
    slug: "rear-differential-fluid", name: "Rear differential fluid", shortName: "Rear differential", category: "Driveline", severity: "important", appliesTo: {},
    description: "A sensible ownership baseline for the final drive, especially when prior service history is unknown.",
    oem: { mileage: null, months: null, label: "No routine CBS interval", summary: "BMW's maintenance schedule does not list a recurring final-drive fluid replacement." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Independent owners and shops commonly service the differential by condition and age." },
    parts: [{ name: "VIN-matched final-drive oil", partNumber: null, note: "Open versus limited-slip units require correct identification and fluid." }],
    sources: [BMW_2016, F30_BUYER],
    diy: ["Open the fill plug before draining.", "Inspect both plugs and seals and confirm the correct level on a level car."],
  },
  {
    slug: "transfer-case-fluid", name: "xDrive transfer-case fluid", shortName: "Transfer case", category: "xDrive", severity: "important", appliesTo: { drivetrains: ["xDrive"] },
    description: "Matched tire circumference and healthy transfer-case fluid matter to xDrive clutch life.",
    oem: { mileage: null, months: null, label: "Condition based", summary: "BMW does not expose a recurring transfer-case fluid item in the normal CBS maintenance list." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "A conservative service baseline plus closely matched tires is common specialist guidance." },
    parts: [{ name: "BMW transfer-case fluid", partNumber: null, note: "Verify transfer-case model, fluid, fill quantity, and adaptation procedure." }],
    sources: [F30_BUYER],
    diy: ["Measure tire tread and confirm all four tires are compatible in size and rolling circumference.", "A scan-tool adaptation procedure may be required after service."],
  },
  {
    slug: "front-differential-fluid", name: "xDrive front differential fluid", shortName: "Front differential", category: "xDrive", severity: "important", appliesTo: { drivetrains: ["xDrive"] },
    description: "The front final drive is easy to overlook when establishing an xDrive baseline.",
    oem: { mileage: null, months: null, label: "No routine CBS interval", summary: "BMW's normal CBS maintenance list does not include a recurring front-final-drive service." },
    community: { mileage: 50000, months: 60, label: "50,000 mi / 5 yr", summary: "Owners commonly pair this service with the rear differential and transfer case." },
    parts: [{ name: "VIN-matched front final-drive oil", partNumber: null, note: "Confirm the exact unit and fluid by VIN." }],
    sources: [F30_BUYER],
    diy: ["Open the fill plug before draining.", "Inspect for axle-seal leaks while access is available."],
  },
  {
    slug: "engine-coolant", name: "Engine coolant", shortName: "Coolant", category: "Cooling", severity: "critical", appliesTo: {},
    description: "Coolant loss is a symptom to diagnose, not something to normalize with repeated top-offs.",
    oem: { mileage: null, months: null, label: "Condition / repair based", summary: "The 2016 schedule does not provide a recurring CBS coolant replacement interval; coolant is replaced as required during cooling-system repairs." },
    community: { mileage: 50000, months: 48, label: "50,000 mi / 4 yr", summary: "Many specialists use a four-year condition-based refresh while inspecting hoses, caps, pumps, and plastic fittings." },
    parts: [{ name: "Current BMW-approved coolant", partNumber: null, note: "Coolant chemistry changed over time; verify the correct current product and mixing instruction." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Never open a hot pressurized cooling system.", "Pressure-test unexplained loss and use the engine-specific bleed procedure."],
  },
  {
    slug: "diesel-fuel-filter", name: "Diesel fuel filter", shortName: "Fuel filter", category: "Diesel", severity: "important", appliesTo: { engines: ["N47T"] },
    description: "Clean fuel delivery protects the high-pressure diesel system and supports reliable cold starts.",
    oem: { mileage: 20000, months: 24, label: "Every 2nd oil service", summary: "BMW's diesel maintenance schedule links the fuel filter to scheduled oil-service counters; confirm the exact CBS sequence." },
    community: { mileage: 20000, months: 24, label: "20,000 mi / 2 yr", summary: "Community practice generally stays close to BMW's counter-based cadence." },
    parts: [{ name: "N47T fuel-filter service kit", partNumber: null, note: "Verify heater, seals, and production-date fitment." }],
    sources: [BMW_2014],
    diy: ["Diesel fuel work requires strict cleanliness.", "Prime and leak-check the system using the correct service procedure."],
  },
  {
    slug: "diesel-def", name: "Diesel exhaust fluid (DEF)", shortName: "DEF", category: "Diesel", severity: "critical", appliesTo: { engines: ["N47T"] },
    description: "The SCR system can prevent restart when DEF quantity or system faults are ignored.",
    oem: { mileage: 10000, months: 12, label: "Top up at every oil service", summary: "BMW calls for DEF top-up at each oil service on the 328d." },
    community: { mileage: 10000, months: 12, label: "Check at every oil service", summary: "Use sealed in-spec fluid and investigate abnormal consumption or countdown warnings." },
    parts: [{ name: "ISO 22241-compliant DEF", partNumber: null, note: "Keep the fill area clean and do not contaminate the diesel tank." }],
    sources: [BMW_2014],
    diy: ["Never put DEF into the diesel-fuel tank.", "Treat a no-start countdown or SCR fault as a diagnostic issue, not only a fluid-level issue."],
  },
  {
    slug: "hybrid-coolant", name: "330e high-voltage cooling check", shortName: "Hybrid cooling", category: "Hybrid", severity: "critical", appliesTo: { engines: ["B48-PHEV"] },
    description: "The 330e has a separate high-voltage cooling circuit that must not be confused with the engine circuit.",
    oem: { mileage: null, months: null, label: "Separate reservoir / condition based", summary: "BMW identifies a separate high-voltage-system coolant reservoir for the 330e; service must follow hybrid-specific procedures." },
    community: { mileage: null, months: 12, label: "Inspect annually", summary: "An annual visual level and leak check is a prudent owner baseline, with all HV diagnosis left to trained personnel." },
    parts: [{ name: "VIN-specific BMW coolant", partNumber: null, note: "Hybrid cooling work requires the correct circuit, fluid, bleeding, and safety procedure." }],
    sources: [BMW_2016],
    diy: ["Do not open, disconnect, or probe high-voltage components.", "Escalate HV warnings, isolation faults, or unexplained cooling loss to a qualified BMW hybrid technician."],
  },
  {
    slug: "belts-hoses", name: "Belts, hoses & plastic fittings", shortName: "Belts & hoses", category: "Inspection", severity: "important", appliesTo: {},
    description: "Age, oil contamination, and heat cycles can matter more than a fixed odometer number.",
    oem: { mileage: null, months: null, label: "Inspect by condition", summary: "BMW includes vehicle and engine-compartment checks within scheduled service operations rather than a single replacement interval." },
    community: { mileage: 30000, months: 24, label: "Inspect every 2 yr", summary: "Owners commonly inspect the belt drive, coolant hoses, vacuum lines, and plastic quick-connects at every major service." },
    parts: [{ name: "Engine-specific belt and tensioner parts", partNumber: null, note: "Oil contamination requires finding and fixing the leak, not only replacing the belt." }],
    sources: [BMW_2016, FCP_ENGINE],
    diy: ["Never work around a moving belt drive.", "Treat an oil-soaked or damaged belt as an immediate correction item and diagnose the source."],
  },
];

const E36_BMW_SIA: CatalogSource = {
  type: "OEM",
  title: "E36 SIA II service-indicator logic",
  publisher: "BMW Technical Training · Service and Maintenance",
  url: "https://ia600902.us.archive.org/26/items/BMWTechnicalTrainingDocuments/ST050%20Technical%20Systems%20%28Archive%201%29/Service%20and%20Maintenance.pdf",
  note: "Period BMW technical material explaining condition-adjusted service-indicator logic.",
};

const E36_OWNER_MANUAL: CatalogSource = {
  type: "OEM",
  title: "BMW E36 owner's manual",
  publisher: "BMW · 07/1998 manual mirror",
  url: "https://www.manualslib.com/manual/728617/Bmw-318i.html?page=129",
  note: "BMW documentation supporting the two-year brake-fluid interval and inspection context.",
};

const E36_MILLER: CatalogSource = {
  type: "Community consensus",
  title: "Old School BMW Maintenance Schedule",
  publisher: "Mike Miller · technical reference mirror",
  url: "https://www.1addicts.com/forums/attachment.php?attachmentid=1461518&d=1469006598",
  note: "Independent long-term BMW maintenance guidance used for preventive planning, not represented as an OEM schedule.",
};

const E36_SPECIALIST: CatalogSource = {
  type: "Community consensus",
  title: "E36 maintenance service packages",
  publisher: "Turner Motorsport",
  url: "https://www.turnermotorsport.com/p-338946-e36-323isic-328iisic-maintenance-service-package/",
  note: "Platform-specialist 30,000/60,000-mile inspection and service structure.",
};

type E36ItemInput = {
  slug: string;
  name: string;
  category: string;
  severity: MaintenanceCatalogItem["severity"];
  description: string;
  appliesTo?: Applicability;
  factoryLabel: string;
  factorySummary: string;
  planMileage: number | null;
  planMonths?: number | null;
  planLabel: string;
  planSummary: string;
  diy: string[];
  sources?: CatalogSource[];
};

const e36Item = (input: E36ItemInput): MaintenanceCatalogItem => ({
  slug: `e36-${input.slug}`,
  name: input.name,
  shortName: input.name,
  category: input.category,
  severity: input.severity,
  description: input.description,
  appliesTo: { platforms: ["E36"], ...(input.appliesTo ?? {}) },
  oem: { mileage: null, months: null, label: input.factoryLabel, summary: input.factorySummary },
  community: { mileage: input.planMileage, months: input.planMonths ?? null, label: input.planLabel, summary: input.planSummary },
  parts: [],
  sources: input.sources ?? [E36_BMW_SIA, E36_MILLER, E36_SPECIALIST],
  diy: input.diy,
});

export const E36_MAINTENANCE_CATALOG: MaintenanceCatalogItem[] = [
  e36Item({ slug: "oil-filter", name: "Engine oil & filter", category: "Engine", severity: "critical", description: "Track oil by both time and distance while preserving the E36 service-indicator context.", factoryLabel: "BMW SIA II / condition", factorySummary: "The period BMW SIA II system adjusts service timing from operating conditions rather than prescribing one universal fixed odometer interval.", planMileage: 7500, planMonths: 12, planLabel: "7,500 mi / 12 mo", planSummary: "The workbook uses a conservative 7,500-mile annual tracker for long-term ownership.", diy: ["Verify oil approval and viscosity for the engine, climate, and owner's manual.", "Inspect the filter housing, pan, drain plug, and belt area for active leakage."], sources: [E36_BMW_SIA, E36_MILLER] }),
  e36Item({ slug: "brake-fluid", name: "Brake fluid", category: "Brakes", severity: "critical", description: "Moisture absorption makes brake fluid a time-based service even on a low-mileage E36.", factoryLabel: "Every 2 years", factorySummary: "BMW E36 documentation states a two-year brake-fluid replacement interval.", planMileage: null, planMonths: 24, planLabel: "Every 24 mo", planSummary: "Keep the BMW time interval and shorten only for measured condition or track use.", diy: ["Use fresh DOT 4 fluid and the correct bleed sequence.", "Do not drive with a soft or uncertain pedal."], sources: [E36_OWNER_MANUAL, E36_SPECIALIST] }),
  e36Item({ slug: "air-filter", name: "Engine air filter", category: "Engine", severity: "routine", description: "Inspect the filter and airbox for restriction, debris, and sealing problems.", factoryLabel: "Inspect by condition", factorySummary: "Use the installed filter's condition and the vehicle's operating environment as the controlling check.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "Turner and the workbook place the engine air filter in the 30,000-mile major-service structure.", diy: ["Inspect sooner in dust or heavy pollen.", "Use an OE/OEM paper element and check intake clamps before closing the airbox."] }),
  e36Item({ slug: "cabin-filter", name: "Cabin microfilter", category: "Climate", severity: "routine", description: "Equipment and access differ across early and low-option E36s, so confirm the car has the expected filter arrangement.", factoryLabel: "Equipment dependent", factorySummary: "Not every E36 configuration has the same microfilter arrangement.", planMileage: 30000, planMonths: 12, planLabel: "Inspect yearly / 30,000 mi", planSummary: "Inspect annually and replace by condition or at the major-service interval where equipped.", diy: ["Confirm the installed housing before ordering.", "Check for dampness, leaves, and evidence of water entry."] }),
  e36Item({ slug: "fuel-filter", name: "Fuel filter", category: "Fuel", severity: "important", description: "A conservative fuel-filter baseline protects an aging fuel system and makes unknown history visible.", factoryLabel: "Verify service history", factorySummary: "The exact historical factory cadence varies by model-year documentation.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "The workbook uses Turner's conservative 30,000-mile E36 major-service interval while noting longer independent recommendations.", diy: ["Relieve pressure safely and observe the filter's flow direction.", "Replace aged clamps or hoses and leak-check before driving."] }),
  e36Item({ slug: "manual-transmission", name: "Manual transmission fluid", category: "Driveline", severity: "important", description: "The gearbox label controls fluid choice; model year alone is not enough.", appliesTo: { transmissions: ["5-speed manual"] }, factoryLabel: "Verify gearbox label", factorySummary: "BMW used multiple gearbox and label specifications across the platform.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "The workbook uses a 30,000-mile preventive drain-and-fill baseline.", diy: ["Open the fill plug before draining.", "Identify the gearbox and read its fluid label before ordering fluid."] }),
  e36Item({ slug: "automatic-transmission", name: "Automatic transmission fluid & filter", category: "Driveline", severity: "important", description: "Automatic fluid, pan/filter service, and fill procedure depend on the exact transmission tag.", appliesTo: { transmissions: ["4-speed automatic", "5-speed automatic"] }, factoryLabel: "Tag / production dependent", factorySummary: "Early GM units predate later lifetime-fill guidance; later GM and ZF units require exact tag verification.", planMileage: 60000, planLabel: "30,000–60,000 mi", planSummary: "The workbook uses 30,000 miles for early/pre-lifetime-fill GM units and 60,000 miles for later lifetime-fill GM or ZF units.", diy: ["Identify the transmission tag and approved fluid before service.", "A pan/filter service quantity is lower than total dry capacity; follow the temperature-dependent fill procedure."] }),
  e36Item({ slug: "differential", name: "Differential fluid", category: "Driveline", severity: "important", description: "Open and limited-slip differentials require correct identification and fluid.", factoryLabel: "Verify differential", factorySummary: "Fluid choice depends on the installed final drive and whether it has a limited-slip unit.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "The workbook applies a 30,000-mile independent specialist baseline.", diy: ["Open the fill plug before draining.", "Use LSD-compatible fluid where required and fill on a level car."] }),
  e36Item({ slug: "spark-plugs", name: "Spark plugs", category: "Ignition", severity: "important", description: "Correct OE-style plugs support clean ignition and useful condition checks.", factoryLabel: "Engine / VIN specific", factorySummary: "Plug specification and quantity depend on the exact engine.", planMileage: 60000, planLabel: "60,000 mi", planSummary: "Turner uses a 60,000-mile E36 major-service interval; modified engines may need a different plan.", diy: ["Use the exact Bosch/NGK specification for the engine and VIN.", "Diagnose recurring misfires rather than treating plugs as the only cause."] }),
  e36Item({ slug: "oxygen-sensors", name: "Oxygen sensors", category: "Emissions", severity: "important", description: "OBD-I and OBD-II layouts differ, so sensor count and diagnosis must follow model year.", factoryLabel: "Diagnose / year specific", factorySummary: "The workbook leaves a numeric OEM interval blank until exact year-specific documentation is verified.", planMileage: null, planLabel: "60,000–150,000 mi context", planSummary: "Independent guidance spans a wide range; condition, faults, and the exact OBD generation are more useful than a single replacement number.", diy: ["1996-on cars use pre- and post-catalyst sensors; earlier layouts differ.", "Use exact OE-style sensors and diagnose mixture faults before replacement."] }),
  e36Item({ slug: "belts", name: "Engine & A/C serpentine belts", category: "Engine", severity: "important", description: "Age, cracking, glazing, fraying, and fluid contamination control belt replacement.", factoryLabel: "Inspect by condition", factorySummary: "Belt condition is checked within periodic engine-compartment service.", planMileage: 30000, planLabel: "Inspect / 30,000 mi", planSummary: "The workbook uses Turner's 30,000-mile major-service replacement point while preserving condition-based judgment.", diy: ["Never work around a moving belt drive.", "Find and repair any oil or coolant source before fitting a new belt."] }),
  e36Item({ slug: "tensioners", name: "Belt tensioners & roller pulleys", category: "Engine", severity: "important", description: "Rough, noisy, loose, or dragging pulleys can damage a new belt.", factoryLabel: "Inspect by condition", factorySummary: "The installed hardware's condition controls replacement.", planMileage: 60000, planLabel: "Inspect 30k / service 60k", planSummary: "Inspect at the 30,000-mile major service and give the complete drive closer attention at 60,000 miles.", diy: ["Spin accessible pulleys by hand with the belt removed.", "Replace components showing roughness, play, noise, or drag."] }),
  e36Item({ slug: "coolant", name: "Engine coolant", category: "Cooling", severity: "critical", description: "Correct coolant, a complete bleed, and diagnosis of any loss are foundational on an aging E36.", factoryLabel: "BMW-compatible fluid", factorySummary: "Use the correct coolant chemistry and follow the engine-specific bleed procedure.", planMileage: 30000, planMonths: 24, planLabel: "30,000 mi / 24 mo", planSummary: "The workbook combines Turner's major service with Mike Miller's two-year preventive interval.", diy: ["Never open a hot pressurized system.", "Use BMW-compatible blue G48-style coolant with distilled water unless using premix, and bleed completely."] }),
  e36Item({ slug: "power-steering", name: "Power steering fluid", category: "Steering", severity: "important", description: "Reservoir hoses and seals commonly deserve inspection whenever fluid is exchanged.", factoryLabel: "Reservoir label controls", factorySummary: "Most E36 systems use ATF, but the reservoir-cap label must be verified.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "The workbook uses a 30,000-mile independent specialist exchange interval.", diy: ["Verify the reservoir-cap label before selecting fluid.", "Inspect the reservoir, return hose, pressure hose, rack boots, and clamps for seepage."] }),
  e36Item({ slug: "water-pump", name: "Water pump", category: "Cooling", severity: "critical", description: "Preventive timing differs sharply between four- and six-cylinder E36 engines.", factoryLabel: "Engine-family dependent", factorySummary: "There is no single BMW replacement interval shared by every E36 engine family.", planMileage: 60000, planLabel: "60,000–150,000 mi", planSummary: "The workbook uses about 60,000 miles for six-cylinder preventive service and around 150,000 miles as a consideration for original M42/M44 pumps.", diy: ["Inspect for leakage, bearing play, noise, and temperature faults.", "Use a quality OE/OEM or proven upgraded pump."] }),
  e36Item({ slug: "thermostat", name: "Thermostat", category: "Cooling", severity: "critical", description: "A thermostat that sticks open or closed affects warm-up, efficiency, and overheat risk.", factoryLabel: "Engine-family dependent", factorySummary: "Temperature faults and engine family control replacement.", planMileage: 60000, planLabel: "60,000–150,000 mi", planSummary: "The workbook pairs six-cylinder thermostat service with the 60,000-mile pump baseline and treats M42/M44 closer to a 150,000-mile consideration.", diy: ["Use the correct temperature rating for the engine.", "Replace earlier for regulation faults, leaks, or during a confirmed cooling overhaul."] }),
  e36Item({ slug: "thermostat-housing", name: "Thermostat housing", category: "Cooling", severity: "critical", description: "Housing material and risk depend on the exact engine.", factoryLabel: "Engine-specific", factorySummary: "M42 uses a metal housing, M44 uses an integrated plastic assembly, and six-cylinder engines commonly use a separate plastic housing.", planMileage: 60000, planLabel: "Inspect / pair with thermostat", planSummary: "The workbook treats six-cylinder and M44 plastic housings preventively while keeping M42 as a documented exception.", diy: ["Inspect sealing surfaces and nearby plastic during thermostat service.", "Do not apply the six-cylinder plastic-housing recommendation blindly to M42."] }),
  e36Item({ slug: "radiator", name: "Radiator", category: "Cooling", severity: "critical", description: "Plastic end tanks and necks deserve age-based inspection even without a fixed failure mileage.", factoryLabel: "Inspect by condition", factorySummary: "Look for cracks, staining, seepage, distorted necks, and prior repairs.", planMileage: 90000, planLabel: "90,000–150,000 mi", planSummary: "The workbook uses roughly 90,000 miles for six-cylinder preventive planning and around 150,000 miles for original M42/M44 components.", diy: ["Inspect plastic tanks, necks, seams, mounts, and cap sealing.", "Pressure-test unexplained loss before ordering parts."] }),
  e36Item({ slug: "expansion-tank", name: "Expansion tank", category: "Cooling", severity: "critical", description: "Age-hardened plastic, cap sealing, and seam leakage can turn a small loss into an overheat event.", factoryLabel: "Inspect by condition", factorySummary: "Track staining, seam seepage, cap condition, and repeated level changes.", planMileage: 90000, planLabel: "90,000–150,000 mi", planSummary: "The workbook separates the six-cylinder 90,000-mile preventive baseline from the longer M42/M44 planning point.", diy: ["Inspect seams, the cap seat, level sensor area, and hose necks.", "Treat repeated top-offs as a leak to diagnose."] }),
  e36Item({ slug: "fan-clutch", name: "Mechanical fan & fan clutch", category: "Cooling", severity: "critical", description: "Cracked fan blades, bearing play, or a failing clutch can damage the cooling system and nearby components.", factoryLabel: "Equipment / condition dependent", factorySummary: "Some four-cylinder configurations differ; verify the installed fan system.", planMileage: 90000, planLabel: "Inspect / 90,000–150,000 mi", planSummary: "The workbook uses a six-cylinder 90,000-mile preventive point and a longer M42/M44 condition-based consideration.", diy: ["Inspect each blade for cracks and check clutch operation and bearing play.", "Verify the installed fan arrangement before ordering parts."] }),
  e36Item({ slug: "hoses", name: "Coolant & fuel hoses", category: "Inspection", severity: "critical", description: "Decades of age can matter more than odometer mileage for molded rubber and hose connections.", factoryLabel: "Inspect by condition", factorySummary: "Use leakage, hardening, swelling, cracking, and service history as the controlling evidence.", planMileage: 150000, planLabel: "Age / condition", planSummary: "The workbook records 150,000 miles as long-term context but explicitly notes that age can justify replacement much earlier.", diy: ["Use OE/OEM-quality molded hoses and correct clamps.", "Replace fuel hoses safely and leak-check before driving."] }),
  e36Item({ slug: "intake-vacuum", name: "Intake boots & vacuum lines", category: "Engine", severity: "important", description: "Split or hardened rubber creates unmetered-air leaks and misleading drivability symptoms.", factoryLabel: "Inspect by condition", factorySummary: "Visual and smoke-test evidence controls replacement.", planMileage: null, planMonths: 12, planLabel: "Inspect yearly", planSummary: "The workbook uses a 12-month inspection cadence.", diy: ["Flex boots to reveal hidden cracks.", "Smoke-test persistent lean, idle, or mixture faults before replacing unrelated sensors."] }),
  e36Item({ slug: "chassis", name: "Chassis, bushings, ball joints & wheel bearings", category: "Chassis", severity: "critical", description: "A system inspection is safer than chasing each clunk in isolation.", factoryLabel: "Inspect by condition", factorySummary: "Wear and structural condition control repair timing.", planMileage: 30000, planMonths: 12, planLabel: "30,000 mi / 12 mo", planSummary: "The workbook applies an annual or 30,000-mile platform inspection.", diy: ["Inspect control arms, tie rods, ball joints, wheel bearings, rear bushings and mounts, subframe areas, and shock mounts.", "Use safe lifting practices and measure play rather than diagnosing only from noise."] }),
  e36Item({ slug: "brake-system", name: "Brake system", category: "Brakes", severity: "critical", description: "Pads, rotors, hoses, parking brake, pedal feel, and leakage are condition-based safety items.", factoryLabel: "Inspect by condition", factorySummary: "There is no responsible universal pad or rotor replacement mileage.", planMileage: 30000, planMonths: 12, planLabel: "30,000 mi / 12 mo", planSummary: "The workbook combines annual inspection with the 30,000-mile major-service structure.", diy: ["Measure wear and inspect flexible hoses and hard lines.", "Do not drive with leakage, a soft pedal, pulling, grinding, or structurally unsafe components."], sources: [E36_OWNER_MANUAL, E36_SPECIALIST] }),
  e36Item({ slug: "driveline", name: "Shifter linkage, guibo, CV joints & center support", category: "Driveline", severity: "critical", description: "Rubber couplings, boots, supports, and linkage age together and can produce overlapping vibration or play.", factoryLabel: "Inspect by condition", factorySummary: "Installed transmission and driveline layout control the exact inspection.", planMileage: 30000, planLabel: "30,000 mi", planSummary: "The workbook uses a 30,000-mile driveline inspection interval.", diy: ["Inspect guibo cracking, center-support bearing, CV/axle boots, linkage play, and driveline vibration.", "Automatic cars use a different selector linkage but keep the same driveline inspection category."] }),
  e36Item({ slug: "ignition-coils", name: "Ignition coils & coil boots", category: "Ignition", severity: "important", description: "A 60,000-mile checkpoint is for inspection and diagnosis, not automatic replacement of every working coil.", factoryLabel: "Diagnose by condition", factorySummary: "Use faults, cylinder testing, boot condition, and spark-plug evidence.", planMileage: 60000, planLabel: "Inspect at 60,000 mi", planSummary: "The workbook retains Turner's 60,000-mile inspection/service checkpoint.", diy: ["Use OE/OEM-quality ignition components.", "Move coils only as a controlled diagnostic test and preserve cylinder location."] }),
];

const E36_SIX_CYLINDER_ENGINES = ["M50-NV", "M50TU", "M52B25", "M52B28", "S50US", "S52US"];

function resolveE36Maintenance(item: MaintenanceCatalogItem, profile: VehicleProfile): MaintenanceCatalogItem {
  const sixCylinder = E36_SIX_CYLINDER_ENGINES.includes(profile.engineCode);
  const notes: Record<string, string> = {
    "e36-oil-filter": `${profile.engineCode}: ${sixCylinder ? "6.5 L" : "5.0 L"} with filter is the workbook reference capacity; verify the exact manual and dipstick procedure.`,
    "e36-manual-transmission": ["M52B28", "S50US", "S52US"].includes(profile.engineCode) ? "ZF 5-speed family: about 1.30 L nominal; the gearbox label remains controlling." : "Getrag S5D 250G family: about 1.1–1.25 L nominal; the gearbox label remains controlling.",
    "e36-automatic-transmission": profile.transmission === "5-speed automatic" ? "ZF 5HP18: about 10.5 L nominal total capacity; a pan service drains substantially less and fluid is type-plate dependent." : "GM 4L30-E/A4S automatic: roughly 7.8–8.8 L total depending on unit; a pan service drains less and the tag controls fluid.",
    "e36-differential": `${sixCylinder ? "About 1.8 US qt" : "About 1.2 US qt"} is the workbook reference; fill to the lower edge of the fill hole and verify LSD requirements.`,
    "e36-spark-plugs": `${sixCylinder ? "Six" : "Four"} plug positions for ${profile.engineCode}.`,
    "e36-coolant": `${sixCylinder ? "About 10.5 L" : "About 6.5 L"} total-system reference for ${profile.engineCode}; actual refill depends on how completely the system is drained.`,
    "e36-water-pump": sixCylinder ? "Six-cylinder workbook baseline: preventive replacement around 60,000 miles." : "M42/M44 workbook baseline: inspect by condition and consider an original pump around 150,000 miles rather than applying the six-cylinder 60,000-mile rule.",
    "e36-thermostat": sixCylinder ? "Six-cylinder workbook baseline: commonly paired with the 60,000-mile water-pump service." : "M42/M44 workbook baseline: inspect by condition and consider around 150,000 miles if original.",
    "e36-thermostat-housing": profile.engineCode === "M42" ? "M42 uses a metal thermostat housing; inspect its gasket and sealing surfaces without treating it as the six-cylinder plastic-housing failure item." : profile.engineCode === "M44" ? "M44 uses an integrated plastic thermostat housing/assembly; monitor it for age-related cracking and leakage." : "Six-cylinder workbook baseline: replace the plastic housing preventively with the thermostat around 60,000 miles or use a quality aluminum upgrade where appropriate.",
    "e36-radiator": sixCylinder ? "Six-cylinder workbook baseline: inspect and consider preventive replacement around 90,000 miles." : "M42/M44 workbook baseline: no blanket 90,000-mile replacement; inspect and consider around 150,000 miles if original.",
    "e36-expansion-tank": sixCylinder ? "Six-cylinder workbook baseline: inspect and consider preventive replacement around 90,000 miles." : "M42/M44 workbook baseline: no blanket 90,000-mile replacement; inspect and consider around 150,000 miles if original.",
    "e36-fan-clutch": sixCylinder ? "Six-cylinder workbook baseline: inspect and consider fan/clutch replacement around 90,000 miles." : "M42/M44 configurations vary; verify the installed fan system and use condition or roughly 150,000-mile original-component context.",
    "e36-chassis": profile.trim === "318ti" ? "The 318ti Compact uses an E30-derived rear semi-trailing-arm layout; inspect its rear bushings and bearings accordingly." : "Inspect the E36 multi-link rear suspension, mounts, bushings, bearings, and subframe attachment areas.",
    "e36-ignition-coils": `${sixCylinder ? "Six" : "Four"} coil positions for ${profile.engineCode}; the 60,000-mile value is an inspection checkpoint, not mandatory replacement.`,
  };
  const note = notes[item.slug];
  if (!note) return item;
  return { ...item, diy: [note, ...item.diy] };
}

export function getMaintenanceCatalog(profile: VehicleProfile) {
  const enhanced = getEnhancedMaintenanceCatalog(profile);
  if (enhanced.length) return enhanced;
  if (EXPANDED_VARIANTS.some((variant) => variant.platform === profile.platform)) {
    return getExpandedMaintenanceCatalog(profile);
  }
  if (profile.platform === "E39" || profile.platform === "E46") {
    return getClassicMaintenanceCatalog(profile);
  }
  return [...MAINTENANCE_CATALOG, ...E36_MAINTENANCE_CATALOG]
    .filter((item) => matchesApplicability(profile, item.appliesTo))
    .map((item) => profile.platform === "E36" ? resolveE36Maintenance(item, profile) : item);
}

const issueSource = (title: string, url: string, note: string, publisher = "F30Post"):
  CatalogSource => ({ type: "Community consensus", title, publisher, url, note });

const issues: KnownIssue[] = [
  {
    slug: "n20-timing-chain", system: "Engine", issue: "N20/N26 timing-chain and oil-pump drive", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["N20", "N26"] },
    description: "BMW issued warranty extensions and settlement procedures for specific earlier N20/N26 production. A 2016 is generally outside the highest-risk production window, but build date, noise, fault history, and prior repair still matter.",
    symptoms: "Whine from the lower engine, chain rattle, timing faults, oil-pressure warnings, or plastic debris in the filter.", typicalMileage: "VIN and production-date dependent; do not apply early-car statistics blindly to a 2016.",
    preventativeAction: "Verify VIN and production date, inspect service history, shorten oil intervals, and stop driving for oil-pressure or timing faults.",
    sources: [{ type: "OEM", title: "N20/N26 timing-chain limited warranty extension", publisher: "BMW of North America · SIB 11 03 17", url: "https://bmwrepairguide.com/sib/110317.pdf", note: "Defines affected production and covered timing/oil-pump drive components." }, N20_VIDEO],
  },
  {
    slug: "n20-oil-filter-housing", system: "Engine", component: "Oil filter housing", issue: "Oil-filter housing and oil-cooler gasket leaks", aliases: ["OFHG", "oil filter housing gasket", "oil cooler gasket", "filter housing seal"], keywords: ["oil leak front of engine", "belt contamination", "passenger side oil leak"], severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "The housing-to-head and oil-cooler seals harden and leak. Oil reaching the belt drive raises the consequence beyond a cosmetic seep.",
    symptoms: "Fresh oil around the filter housing, oil smell, belt contamination, or oil collecting at the front of the engine.", typicalMileage: "Common with age and heat cycling, often from roughly 60,000 miles onward.",
    preventativeAction: "Inspect at every oil service. Repair promptly, clean the belt path, and replace contaminated belt components.",
    sources: [{ type: "Community consensus", title: "N20/N26 oil-filter housing gasket replacement", publisher: "FCP Euro", url: "https://www.fcpeuro.com/blog/how-to-replace-a-bmw-n20-n26-oil-filter-housing-gasket-f30", note: "Specialist procedure and failure context." }, N20_VIDEO],
  },
  {
    slug: "n20-valve-cover-pcv", system: "Engine", component: "Cylinder head cover and Valvetronic servomotor mounting area", issue: "Valve-cover gasket and integrated PCV", aliases: ["VVT motor seal", "VVT actuator seal", "Valvetronic motor seal", "Valvetronic motor gasket", "Valvetronic actuator gasket", "eccentric shaft actuator seal", "actuator flange gasket", "motor flange seal", "seal flange"], keywords: ["oil leak passenger side", "oil around Valvetronic motor", "cylinder head cover leak", "whistling PCV"], severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "The composite cover can warp, its gasket can leak, and the integrated crankcase-ventilation diaphragm can fail.",
    symptoms: "Burning-oil odor, oil at the cover edge, whistling, rough idle, mixture faults, or excess crankcase vacuum.", typicalMileage: "Age and heat-cycle dependent; common on higher-mileage cars.",
    preventativeAction: "Inspect the entire cover before replacing only the gasket and verify crankcase pressure when symptoms point to PCV failure.", sources: [N20_VIDEO],
  },
  {
    slug: "n20-water-pump-thermostat", system: "Cooling", issue: "Electric water pump and thermostat", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Electric-pump or thermostat failure can quickly become an overheat event.",
    symptoms: "Coolant warning, high fan speed, reduced power, overheating message, stored pump faults, or slow warm-up.", typicalMileage: "Often discussed around 70,000–120,000 miles, but failures are not strictly mileage based.",
    preventativeAction: "Scan cooling faults during major service, address abnormal temperature behavior immediately, and replace pump/thermostat as a matched job when diagnosis supports it.", sources: [N20_VIDEO, STARTMYCAR_328],
  },
  {
    slug: "n20-charge-pipe", system: "Intake", issue: "Plastic charge-pipe cracking", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26", "N55", "B58"] },
    description: "The plastic charge path can split at a seam or connection, especially after years of heat cycles or higher boost.",
    symptoms: "Sudden power loss, boost leak, drivetrain malfunction, hiss, or an oily split near a coupling.", typicalMileage: "Condition and modification dependent.",
    preventativeAction: "Inspect joints during service and diagnose boost faults before replacing parts; a quality metal replacement is a common preventative upgrade.", sources: [N20_VIDEO, F30_BUYER],
  },
  {
    slug: "n20-turbo-lines-wastegate", system: "Turbo", issue: "Turbo oil/coolant lines and wastegate wear", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Seals and feed/return lines can seep, while wastegate linkage wear can create rattle or boost-control faults.",
    symptoms: "Oil or coolant near the turbo, exhaust smoke, metallic rattle, low boost, or boost-control codes.", typicalMileage: "Most relevant as heat cycles and mileage accumulate.",
    preventativeAction: "Inspect from below during oil service and diagnose smoke or boost faults before condemning the turbocharger.", sources: [N20_VIDEO],
  },
  {
    slug: "n20-ignition-fueling", system: "Fuel & ignition", issue: "Coils, injectors, and high-pressure fueling", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26"] },
    description: "Misfires can originate in plugs, coils, injectors, fuel pressure, air leaks, or control faults; parts-swapping obscures the real cause.",
    symptoms: "Cold-start shake, cylinder-specific misfire, hesitation under load, fuel smell, or rail-pressure faults.", typicalMileage: "Condition based; coils and plugs are wear items while injectors and pumps require diagnosis.",
    preventativeAction: "Read fault codes and freeze-frame data, move coils only as a controlled test, and check fuel pressure before authorizing expensive parts.", sources: [N20_VIDEO],
  },
  {
    slug: "n47-egr-recall", system: "Diesel emissions", issue: "N47T EGR-cooler safety recall", severity: "critical", urgency: "urgent", evidence: "BMW recall", appliesTo: { engines: ["N47T"] },
    description: "BMW recall 21V-907 covers affected F30/F31 N47T vehicles because an internally leaking EGR cooler can combine coolant with soot, damage the intake, and increase fire risk.",
    symptoms: "Coolant loss, reduced power, exhaust odor, unusual engine-bay noise, smoke, or an open recall with no symptoms.", typicalMileage: "Recall eligibility is VIN and production-date based, not mileage based.",
    preventativeAction: "Check the VIN on BMW's recall page and complete any open campaign at an authorized BMW center at no charge.",
    sources: [{ type: "OEM", title: "Recall 21V-907: N47T EGR cooler", publisher: "BMW of North America / NHTSA · SIB 11 09 21", url: "https://static.nhtsa.gov/odi/rcl/2021/RCRIT-21V907-7368.pdf", note: "Official recall scope, risk, and VIN-check procedure." }, { type: "OEM", title: "BMW recall lookup", publisher: "BMW USA", url: "https://www.bmwusa.com/safety-and-emission-recalls.html", note: "Official VIN-specific recall lookup." }],
  },
  {
    slug: "n47-dpf-thermostat", system: "Diesel emissions", issue: "DPF regeneration and low operating temperature", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "Short-trip use, failed thermostats, pressure-sensor faults, or other engine faults can prevent regeneration and overload the diesel particulate filter.",
    symptoms: "Frequent regeneration, reduced power, DPF faults, poor fuel economy, fan running after shutdown, or engine failing to reach normal temperature.", typicalMileage: "Usage-pattern dependent; repeated short trips raise risk at any mileage.",
    preventativeAction: "Diagnose the cause before forcing regeneration; verify operating temperature, pressure sensors, glow system, and fault-free engine operation.",
    sources: [issueSource("328d DPF and regeneration owner diagnostics", "https://f30.bimmerpost.com/forums/showthread.php?t=1503426", "Recurring diesel owner checks and usage context.")],
  },
  {
    slug: "n47-scr-def-nox", system: "Diesel emissions", issue: "SCR, DEF tanks, heaters, and NOx sensors", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "The selective-catalyst system relies on pumps, heaters, sensors, dosing, and in-spec fluid. A fault can trigger a no-start countdown.",
    symptoms: "Check-engine light, incorrect-fluid warning, low-level warning that will not clear, SCR efficiency faults, or miles-to-no-start countdown.", typicalMileage: "Age, climate, and crystallization dependent.",
    preventativeAction: "Use sealed in-spec DEF, scan BMW-specific faults promptly, and diagnose the system rather than repeatedly topping up.", sources: [BMW_2014, F30_BUYER],
  },
  {
    slug: "n47-timing-chain", system: "Engine", issue: "N47T rear timing-chain wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "N47-family timing components are mounted at the rear of the engine, making abnormal chain wear a consequential diagnosis. Not every N47T develops it.",
    symptoms: "Metallic rattle or scraping from the transmission side of the engine, timing correlation faults, or debris in the oil filter.", typicalMileage: "History, oil service, and production dependent; community reports vary widely.",
    preventativeAction: "Listen during cold and warm operation, preserve oil-service records, inspect the filter, and obtain specialist diagnosis before assuming normal diesel noise is chain wear.", sources: [F30_BUYER],
  },
  {
    slug: "n47-intake-carbon", system: "Diesel intake", issue: "EGR soot and intake carbon buildup", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "EGR soot mixed with oil vapor can narrow the intake tract and affect swirl-flap operation.",
    symptoms: "Reduced power, uneven response, airflow faults, smoke, or heavy deposits found during EGR service.", typicalMileage: "Usage and EGR-system dependent; urban use can accelerate buildup.",
    preventativeAction: "Diagnose airflow faults, inspect during relevant repairs, and use an appropriate mechanical cleaning procedure when confirmed.", sources: [F30_BUYER],
  },
  {
    slug: "n47-glow-system", system: "Diesel", issue: "Glow plugs and glow-control module", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N47T"] },
    description: "Glow-system faults affect cold starts and can interfere with low-temperature DPF regeneration strategy.",
    symptoms: "Hard cold starting, rough cold idle, smoke, glow-plug codes, or regeneration complaints.", typicalMileage: "More likely with age and cold-climate use.",
    preventativeAction: "Scan individual glow circuits and module supply before replacing a complete set.", sources: [F30_BUYER],
  },
  {
    slug: "330e-kle", system: "Hybrid charging", issue: "330e KLE charging-electronics fault", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B48-PHEV"] },
    description: "BMW documented charging failures involving the KLE charging electronics on the F30 330e.",
    symptoms: "Vehicle will not charge, charging stops, charge-port indicator faults, or charging system messages.", typicalMileage: "Fault and production dependent, not a scheduled wear interval.",
    preventativeAction: "Stop using damaged charging equipment, try a known-good supply only if safe, and have the vehicle diagnosed with BMW hybrid procedures.",
    sources: [{ type: "OEM", title: "330e KLE charging fault", publisher: "BMW of North America · SIB 61 13 16", url: "https://static.nhtsa.gov/odi/tsbs/2018/MC-10142936-9999.pdf", note: "Official diagnostic and repair bulletin for F30 PHEV charging complaints." }],
  },
  {
    slug: "330e-cell-temperature", system: "High voltage", issue: "High-voltage battery cell-temperature sensor fault", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B48-PHEV"] },
    description: "BMW published a diagnostic bulletin for cell-temperature sensing faults in the 330e high-voltage battery system.",
    symptoms: "Drivetrain or high-voltage warning, restricted electric operation, charging disabled, or stored battery-management faults.", typicalMileage: "Fault based; specialist diagnosis required.",
    preventativeAction: "Do not open or probe the battery. Park safely and arrange diagnosis by a BMW-trained high-voltage technician.",
    sources: [{ type: "OEM", title: "PHEV high-voltage battery cell-temperature sensor faults", publisher: "BMW of North America", url: "https://static.nhtsa.gov/odi/tsbs/2024/MC-11012073-0001.pdf", note: "Official BMW service information for high-voltage temperature-sensor diagnosis." }],
  },
  {
    slug: "330e-hv-cooling", system: "Hybrid cooling", issue: "High-voltage battery cooling and A/C dependency", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B48-PHEV"] },
    description: "The plug-in hybrid depends on functioning thermal-management and air-conditioning systems to protect battery operation.",
    symptoms: "Reduced electric range, charging limits, A/C failure, battery-temperature messages, or electric mode unavailable in heat.", typicalMileage: "Condition and climate dependent.",
    preventativeAction: "Treat A/C and hybrid cooling faults as battery-protection issues and use a hybrid-qualified shop.",
    sources: [issueSource("330e owner guidance on A/C and battery cooling", "https://www.reddit.com/r/F30/comments/sfiki0", "Owner discussion used as a community signal, not factory procedure.", "r/F30")],
  },
  {
    slug: "330e-charge-lock-12v", system: "Electrical", issue: "330e charge-port lock and 12-volt battery faults", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B48-PHEV"] },
    description: "A weak 12-volt battery, charge-flap actuator, or locking fault can mimic a larger charging-system failure.",
    symptoms: "Cable will not lock or release, charge door will not operate, multiple low-voltage warnings, or intermittent failure to initiate charging.", typicalMileage: "Age and battery-condition dependent.",
    preventativeAction: "Test the 12-volt battery and scan body/charging modules before replacing high-voltage parts.",
    sources: [issueSource("330e unable-to-charge diagnostic discussion", "https://www.reddit.com/r/BmwTech/comments/14d36ui", "Community troubleshooting patterns requiring proper scan confirmation.", "r/BmwTech")],
  },
  {
    slug: "b48-coolant-housing", system: "Cooling", issue: "B46/B48 coolant vent lines and filter-housing leaks", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B46", "B48-PHEV"] },
    description: "Plastic coolant connections and the oil-filter-housing area can develop leaks with heat cycles.",
    symptoms: "Low-coolant warning, sweet odor, dried coolant residue, or wetness below the intake side of the engine.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Pressure-test unexplained loss and inspect plastic connectors before a small seep becomes an overheat event.",
    sources: [issueSource("B48 coolant-hose failure patterns", "https://www.reddit.com/r/F30/comments/1cckw4p", "Recurring owner reports used to define an inspection item.", "r/F30")],
  },
  {
    slug: "b46-evap-purge-valve", system: "Fuel & emissions", issue: "B46 EVAP purge-valve faults", severity: "important", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B46"], years: [2017, 2018] },
    description: "BMW extended VIN-specific coverage for the tank-ventilation purge valve on listed B46-powered F30 330i vehicles.",
    symptoms: "Check-engine light, EVAP leak or mixture faults, rough idle after refueling, hard restart, or fuel odor.", typicalMileage: "Coverage and eligibility are VIN specific, not a universal failure interval.",
    preventativeAction: "Scan the exact BMW faults and check VIN-specific warranty coverage before replacing the valve or smoke-testing the rest of the EVAP system.",
    sources: [BMW_B46_PURGE, { type: "OEM", title: "Updated B46/B48/B58 purge-valve coverage", publisher: "BMW of North America · SIB 01 02 24", url: "https://static.nhtsa.gov/odi/tsbs/2026/MC-11032730-0001.pdf", note: "Current BMW coverage bulletin including listed 2018 F30 330i vehicles." }],
  },
  {
    slug: "f30-fuel-tank-leakage", system: "Fuel", issue: "Plastic fuel-tank leakage coverage", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["N20", "N26", "B46", "N55", "B58"] },
    description: "BMW published VIN-specific extended coverage for leakage from the plastic fuel tank on listed F30 gasoline models.",
    symptoms: "Fuel odor, visible wetness, drips near the tank, evaporative-emissions faults, or an applicable warranty notice.", typicalMileage: "Eligibility is VIN and production-date based; the bulletin is not evidence that every tank will leak.",
    preventativeAction: "Do not drive with liquid fuel leakage or a strong unexplained fuel odor. Check VIN-specific coverage and arrange professional inspection.",
    sources: [BMW_F3X_FUEL_TANK],
  },
  {
    slug: "n55-oil-filter-housing-action", system: "Engine", issue: "Early N55 plastic oil-filter housing service action", severity: "critical", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["N55"], years: [2012] },
    description: "BMW issued a service action for specific early-production F30 N55 cars because the plastic housing could leak oil or coolant internally or externally.",
    symptoms: "Oil or coolant around the housing, unexplained fluid loss, cross-contamination, odor, or an open campaign in BMW records.", typicalMileage: "F30 production from August 2011 through March 2012; VIN status remains controlling.",
    preventativeAction: "Verify the production date and campaign history. Diagnose any oil/coolant mixing or external leak promptly.",
    sources: [{ type: "OEM", title: "N55 oil-filter housing service action", publisher: "BMW of North America · SIB 11 14 15", url: "https://static.nhtsa.gov/odi/tsbs/2016/MC-10150903-9999.pdf", note: "Defines the early F30 production range and inspection/replacement procedure." }],
  },
  {
    slug: "n55-cooling-system", system: "Cooling", issue: "N55 electric water pump, thermostat, and cooling leaks", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N55"] },
    description: "The N55 electric cooling system and its plastic connections can fail by fault, leakage, or age rather than a single fixed interval.",
    symptoms: "High fan speed, reduced power, coolant warning, pump faults, slow warm-up, or an overheating message.", typicalMileage: "Age, heat-cycle, and service-history dependent.",
    preventativeAction: "Scan cooling faults during major service, pressure-test unexplained loss, and stop driving for an overheating or coolant-temperature warning.",
    sources: [N55_VIDEO],
  },
  {
    slug: "n55-valve-cover-valvetronic", system: "Engine", issue: "N55 valve-cover, PCV, Valvetronic, and VANOS diagnosis", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N55"] },
    description: "Oil leaks, crankcase ventilation, variable valve lift, and camshaft-control faults can produce overlapping N55 symptoms.",
    symptoms: "Whistle, rough idle, oil odor, smoke after idle, reduced power, hard starting, or Valvetronic/VANOS faults.", typicalMileage: "Age and condition dependent; diagnosis matters more than a mileage guess.",
    preventativeAction: "Test crankcase pressure, inspect the full cover, and read BMW-specific fault and adaptation data before replacing assemblies.",
    sources: [N55_VIDEO],
  },
  {
    slug: "b58-oil-filter-housing", system: "Cooling", issue: "B58 plastic oil-filter housing coolant leak", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The first-generation B58 housing contains coolant passages and can leak in a labor-intensive location.",
    symptoms: "Low coolant, dried residue under the intake manifold, coolant odor, or pressure-test loss with no obvious hose leak.", typicalMileage: "Age and heat-cycle dependent; often discussed on higher-mileage first-generation B58s.",
    preventativeAction: "Track coolant level, pressure-test loss early, and confirm the leak source before authorizing housing replacement.",
    sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Independent specialist overview of common first-generation B58 leak and service areas." }],
  },
  {
    slug: "b58-heat-management", system: "Cooling", issue: "B58 heat-management module", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The module and its plastic coolant connections can leak or control temperature incorrectly.",
    symptoms: "Coolant loss, slow warm-up, over-temperature warning, temperature-control faults, or residue near the front/side of the engine.", typicalMileage: "Condition dependent and increasingly relevant with age.",
    preventativeAction: "Pressure-test, scan thermal-management faults, and inspect adjacent hoses before replacing parts.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Specialist failure overview." }],
  },
  {
    slug: "b58-water-pump", system: "Cooling", issue: "B58 mechanical water pump", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "The belt-driven pump can seep or develop bearing wear as mileage accumulates.",
    symptoms: "Coolant residue, chirp or bearing noise, low-coolant warning, or temperature problems.", typicalMileage: "Specialists commonly flag inspection around 100,000 miles and beyond, without treating it as a fixed failure point.",
    preventativeAction: "Inspect for seepage and shaft/bearing symptoms during belt service; replace based on confirmed condition.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Independent specialist guidance." }],
  },
  {
    slug: "b58-valve-cover-pcv", system: "Engine", issue: "B58 valve cover, gasket, and PCV diaphragm", severity: "important", urgency: "watch", evidence: "BMW bulletin", appliesTo: { engines: ["B58"] },
    description: "Oil sealing and the integrated pressure-control system can cause leaks, whistle, smoke, or mixture problems.",
    symptoms: "Whistle, rough idle, smoke after idle, oil around the cover, or crankcase-pressure faults.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Test crankcase pressure and inspect the complete cover before choosing a diaphragm-only or full-cover repair.", sources: [{ type: "Community consensus", title: "BMW B58 engine service catalog and common failures", publisher: "FCP Euro", url: "https://www.fcpeuro.com/BMW-parts/b58-engine/", note: "Includes first-generation PCV and valve-cover failure context." }],
  },
  {
    slug: "b58-fueling-ignition", system: "Fuel & ignition", issue: "B58 injectors, high-pressure pump, plugs, and coils", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["B58"] },
    description: "High-load misfires or rail-pressure faults require structured diagnosis across ignition, injection, and fuel supply.",
    symptoms: "Cold-start shake, fuel smell, long crank, misfire under boost, or rail-pressure faults.", typicalMileage: "Condition and calibration dependent.",
    preventativeAction: "Use BMW-specific fault data and cylinder testing; do not replace injectors or the pump without confirming the failure.", sources: [{ type: "Community consensus", title: "B58 common-issue owner discussion", publisher: "F30Post", url: "https://f30.bimmerpost.com/forums/showthread.php?t=1796289", note: "Recurring owner reports cross-checked against specialist guidance." }],
  },
  {
    slug: "f30-thrust-arm-bushings", system: "Suspension", component: "Front thrust arm", issue: "Front thrust-arm hydro-bushings", aliases: ["control arm bushing", "tension strut bushing", "wishbone bushing", "front lower control arm"], keywords: ["clunk over bumps", "brake shimmy", "wandering steering"], severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "The fluid-filled front tension-strut bushings can split or leak, reducing stability under braking.",
    symptoms: "Brake shimmy, clunk when braking or reversing, wandering, vague steering, or dark oily residue at the bushing.", typicalMileage: "Often relevant from 50,000–100,000 miles, sooner on rough roads.",
    preventativeAction: "Inspect for leakage and play during every tire or brake service and align the car after replacement.",
    sources: [issueSource("F30 thrust-arm bushing owner inspection", "https://f30.bimmerpost.com/forums/showthread.php?t=1750820", "Recurring chassis wear pattern across F30 variants.")],
  },
  {
    slug: "f30-steering-rack-thrust", system: "Steering", issue: "Electric steering-rack thrust-piece clunk", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Wear or preload at the rack thrust piece can create a knock that is easily confused with suspension play.",
    symptoms: "Knock over small bumps, clunk while rocking the wheel at a stop, or noise near the driver's front footwell.", typicalMileage: "Condition dependent; reported across model years and mileages.",
    preventativeAction: "Have steering and suspension play diagnosed before ordering a rack; BMW offers a rack-specific repair part for certain applications.",
    sources: [issueSource("Steering knocking and thrust-piece diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1609631", "Owner diagnostic thread documenting the rack thrust-piece pattern.")],
  },
  {
    slug: "f30-parking-brake-clip", system: "Driveline", issue: "Parking-brake cable retainer above driveshaft", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A plastic cable retainer can break and allow the parking-brake cables to contact the rotating driveshaft.",
    symptoms: "Metallic scraping, rhythmic rattle, or tapping under the center console that changes with road speed or acceleration.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Inspect the cable routing promptly; correct contact before the cable jacket is damaged.", sources: [issueSource("F30 parking-brake cable retainer reports", "https://f30.bimmerpost.com/forums/showthread.php?t=1503426", "Model-wide buyer and owner inspection context.")],
  },
  {
    slug: "f30-guibo-center-bearing", system: "Driveline", issue: "Flex disc and driveshaft center support", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Rubber driveline couplings and support bearings deteriorate with age, heat, and torque cycles.",
    symptoms: "Clunk taking up drive, vibration under acceleration, shudder, or cracked rubber visible at the flex disc.", typicalMileage: "Typically a higher-mileage or age-related inspection item.",
    preventativeAction: "Inspect with the underbody safely supported and distinguish it from differential mounts or the parking-brake cable clip.", sources: [F30_BUYER],
  },
  {
    slug: "f30-wheel-bearings", system: "Chassis", issue: "Wheel-bearing wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Bearing noise can be mistaken for tire roar and may change as the car is gently loaded side to side.",
    symptoms: "Speed-related hum or growl, roughness, or play found during inspection.", typicalMileage: "Road-impact, wheel/tire, and mileage dependent.",
    preventativeAction: "Inspect tire wear first, then confirm the bearing location professionally before replacement.", sources: [F30_BUYER],
  },
  {
    slug: "f30-sway-links-strut-mounts", system: "Suspension", component: "Sway-bar end links and strut mounts", issue: "Sway-bar links, strut mounts, and damper wear", aliases: ["sway bar end links", "stabilizer links", "drop links", "upper strut mounts", "shock mounts"], keywords: ["clunk over bumps", "rattle from suspension", "knocking front end"], severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Several front-end wear points can produce similar low-speed rattles, making physical diagnosis essential.",
    symptoms: "Rattle over broken pavement, bounce, cupped tires, leaking damper, or noise while steering.", typicalMileage: "Often increasingly relevant after 60,000 miles or repeated pothole impacts.",
    preventativeAction: "Inspect as a system and avoid replacing multiple parts solely from a sound recording.", sources: [issueSource("F30 low-speed suspension rattle diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1800060", "Recurring owner diagnostic path across links, mounts, dampers, and steering rack.")],
  },
  {
    slug: "f30-engine-trans-mounts", system: "Mounts", issue: "Engine and transmission mount collapse", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Hydraulic and rubber mounts settle with time, increasing vibration and driveline movement.",
    symptoms: "Cabin vibration at idle, thump during shifts, excessive engine movement, or vibration that changes in gear.", typicalMileage: "Often a higher-mileage age item, accelerated by fluid leaks and heat.",
    preventativeAction: "Inspect all mounts and rule out misfires or driveline faults before replacement.", sources: [F30_BUYER],
  },
  {
    slug: "f30-oil-pan-gasket", system: "Engine", issue: "Oil-pan gasket seepage", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { engines: ["N20", "N26", "N47T", "B46", "B48-PHEV", "N55", "B58"] },
    description: "The pan seal can seep with age; repair labor differs sharply between RWD and xDrive because of front-driveline packaging.",
    symptoms: "Oil along the pan seam, wet undertray, drops after parking, or oil smell.", typicalMileage: "Age and heat-cycle dependent.",
    preventativeAction: "Clean and confirm the highest leak source before approving a pan reseal; use the profile's drivetrain to estimate labor correctly.", sources: [F30_BUYER],
  },
  {
    slug: "f30-battery-registration", system: "Electrical", issue: "12-volt battery aging and registration", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A weak battery can create unrelated-looking warnings. Replacement batteries must match the charging strategy and be registered to the car.",
    symptoms: "Slow crank, discharge warning, comfort features disabled, multiple intermittent faults, or low resting voltage.", typicalMileage: "Commonly age related around 4–7 years, highly climate dependent.",
    preventativeAction: "Load-test the battery, check charging and sleep current, match type/capacity, and register the replacement.", sources: [F30_BUYER, STARTMYCAR_328],
  },
  {
    slug: "f30-wheel-speed-sensors", system: "Electrical", issue: "Wheel-speed sensor and reluctor faults", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "A wheel-speed signal fault can disable ABS, stability control, cruise control, and other dependent systems.",
    symptoms: "ABS/DSC warning cluster, cruise unavailable, speed-signal codes, or intermittent warnings after rain or wheel work.", typicalMileage: "Condition and corrosion dependent.",
    preventativeAction: "Scan live wheel speeds and inspect wiring, sensor seating, bearing play, and reluctor condition before replacing the sensor.", sources: [F30_BUYER],
  },
  {
    slug: "f30-water-vapor-barrier", system: "Body", issue: "Door vapor-barrier water leak", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Butyl sealing around the foam door barrier can release and route rainwater onto the sill and carpet.",
    symptoms: "Wet front or rear footwell after rain, water at the door-sill trim, damp odor, or visible flow behind a door card.", typicalMileage: "Age, previous door work, and climate dependent.",
    preventativeAction: "Water-test the specific door, reseal with the correct material, clear door drains, and dry the carpet fully to protect electronics and prevent mold.",
    sources: [issueSource("F30 rainwater leak and vapor-barrier repair", "https://f30.bimmerpost.com/forums/showthread.php?t=1762975", "Repeated owner confirmation of loose vapor-barrier sealing.")],
  },
  {
    slug: "f30-sunroof-drains", system: "Body", issue: "Sunroof drain restriction or disconnection", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "The sunroof tray depends on open, connected drains; forced compressed air can disconnect a tube inside a pillar.",
    symptoms: "Wet headliner or pillars, water in a footwell, sloshing, or overflow during a controlled drain test.", typicalMileage: "Environment dependent; trees and debris accelerate blockage.",
    preventativeAction: "Test drains gently, clear with a safe flexible method, and avoid high pressure that can detach a hose.", sources: [issueSource("F30 water-leak owner diagnosis", "https://f30.bimmerpost.com/forums/showthread.php?t=1762975", "Separates sunroof drains from the frequently confused door barrier leak.")],
  },
  {
    slug: "f30-ac-evaporator", system: "Climate", issue: "A/C refrigerant leak and evaporator diagnosis", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Loss of cooling can originate in service valves, condenser, lines, compressor, or the dashboard-mounted evaporator; the expensive location must be confirmed.",
    symptoms: "Weak or warm A/C, repeated refrigerant loss, dye at drains or components, or pressure-test failure.", typicalMileage: "Age and leak-source dependent.",
    preventativeAction: "Require a documented leak test before authorizing evaporator or compressor replacement. For a 330e, treat A/C failure as hybrid thermal-management relevant.", sources: [F30_BUYER],
  },
  {
    slug: "f30-headlight-moisture", system: "Lighting", issue: "Headlamp moisture and module damage", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Persistent water entry can damage adaptive-light or LED control modules; light temporary condensation is different from standing water.",
    symptoms: "Droplets that remain, pooled water, adaptive-headlight warning, flicker, or corroded module connectors.", typicalMileage: "Seal, vent, impact, and prior-repair dependent.",
    preventativeAction: "Inspect caps, vents, lens seams, and housing damage before replacing electronics.", sources: [F30_BUYER],
  },
  {
    slug: "f30-sticky-handles-trim", system: "Interior", issue: "Soft-touch door pulls and trim aging", severity: "routine", urgency: "watch", evidence: "Community consensus", appliesTo: {},
    description: "Soft-touch coatings can become sticky or peel. It is cosmetic and should stay below mechanical work in the plan.",
    symptoms: "Tacky door pull, peeling finish, or degraded trim surface.", typicalMileage: "Age, heat, and cleaning-product dependent.",
    preventativeAction: "Use a quality replacement insert or refinishing approach after safety and maintenance work are funded.", sources: [F30_BUYER],
  },
  {
    slug: "xdrive-tire-mismatch", system: "xDrive", issue: "Tire circumference mismatch and transfer-case stress", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { drivetrains: ["xDrive"] },
    description: "Mismatched brands, sizes, wear, or inflation can keep the xDrive clutch working continuously and cause shudder or wear.",
    symptoms: "Binding or shudder on low-speed turns, drivetrain faults, uneven tire wear, or mismatched tread depths.", typicalMileage: "Can begin immediately after an incompatible tire replacement.",
    preventativeAction: "Keep all four tires compatible in specified size and closely matched circumference; diagnose shudder before replacing the transfer case.", sources: [F30_BUYER],
  },
  {
    slug: "rwd-rear-axle-seals", system: "Driveline", issue: "Rear differential and axle-seal leaks", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { drivetrains: ["RWD"] },
    description: "A RWD car avoids the front differential and transfer case but still needs rear final-drive and output-seal inspection.",
    symptoms: "Gear-oil smell, wet output flange, fluid on the rear underbody, or differential whine.", typicalMileage: "Age, impact, vent, and mileage dependent.",
    preventativeAction: "Inspect at each rear-differential service and confirm the source before replacing seals.", sources: [F30_BUYER],
  },
  {
    slug: "e36-cooling-system-age", system: "Cooling", issue: "Age-critical cooling-system plastic and hose inspection", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Radiator necks, expansion tanks, thermostat housings, hoses, caps, pumps, and fan components age as a connected system.",
    symptoms: "Coolant odor, staining, repeated top-offs, cracks, high temperature, fan damage, or pressure-test loss.", typicalMileage: "Age and engine-family dependent; these cars are now decades old.",
    preventativeAction: "Establish the exact engine-family baseline, pressure-test unexplained loss, and stop driving immediately for overheating.", sources: [E36_MILLER, E36_SPECIALIST],
  },
  {
    slug: "e36-mechanical-fan", system: "Cooling", issue: "Mechanical fan and fan-clutch condition", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Cracked blades, bearing play, or a failing clutch can damage the radiator, hoses, shroud, and hood.",
    symptoms: "Visible blade cracks, wobble, roar that never settles, poor airflow at idle, bearing noise, or impact marks.", typicalMileage: "Equipment, age, engine family, and prior replacement dependent.",
    preventativeAction: "Inspect every blade and the clutch/bearing condition; verify that the selected E36 actually uses the mechanical-fan arrangement.", sources: [E36_MILLER],
  },
  {
    slug: "e36-brake-hoses-system", system: "Brakes", issue: "Brake hoses, hydraulic leaks, and measured wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Aged flexible hoses, corroded lines, leaks, and worn components require condition-based inspection rather than a guessed pad mileage.",
    symptoms: "Soft pedal, pulling, fluid loss, cracked hoses, grinding, vibration, or uneven braking.", typicalMileage: "Condition and age based.",
    preventativeAction: "Inspect yearly, keep the two-year fluid cadence, and do not drive with hydraulic leakage or an uncertain pedal.", sources: [E36_OWNER_MANUAL, E36_SPECIALIST],
  },
  {
    slug: "e36-chassis-mounts", system: "Chassis", issue: "Bushings, ball joints, shock mounts, and subframe areas", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Multiple age-related chassis wear points can create similar noise, alignment, or stability symptoms.",
    symptoms: "Clunking, wandering, uneven tire wear, rear movement, cracked rubber, visible play, or mounting-area damage.", typicalMileage: "Road, use, age, and previous repair dependent.",
    preventativeAction: "Inspect the chassis as a system annually or every 30,000 miles, including rear mounts and subframe attachment areas.", sources: [E36_SPECIALIST, E36_MILLER],
  },
  {
    slug: "e36-guibo-csb", system: "Driveline", issue: "Guibo, center-support bearing, CV boots, and linkage wear", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Rubber couplings, supports, boots, and linkages age together and can produce overlapping driveline symptoms.",
    symptoms: "Clunk taking up drive, vibration under acceleration, cracked guibo, torn boots, or excessive shifter/selector play.", typicalMileage: "Age, torque cycles, and condition dependent.",
    preventativeAction: "Inspect every 30,000 miles with safe underbody access and diagnose the complete driveline before replacing isolated parts.", sources: [E36_SPECIALIST, E36_MILLER],
  },
  {
    slug: "e36-fuel-hoses", system: "Fuel", issue: "Aged fuel hoses and connections", severity: "critical", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Fuel hoses can harden, crack, or seep long before a long-term mileage target because the platform is now decades old.",
    symptoms: "Fuel odor, damp hose ends, cracking, staining, difficult hot starts, or visible leakage.", typicalMileage: "Age and material condition matter more than odometer mileage.",
    preventativeAction: "Do not drive with liquid fuel leakage or a strong unexplained odor. Replace aged hose with correct fuel-rated material and clamps.", sources: [E36_MILLER],
  },
  {
    slug: "e36-intake-vacuum", system: "Engine", issue: "Intake boot and vacuum-line leaks", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Hardened or split rubber can admit unmetered air and mimic ignition, sensor, or fuel faults.",
    symptoms: "Rough idle, lean mixture codes, hesitation, whistle, stalling, or cracks revealed when a boot is flexed.", typicalMileage: "Age, heat, and prior replacement dependent.",
    preventativeAction: "Inspect yearly and smoke-test persistent mixture or idle complaints before replacing unrelated sensors.", sources: [E36_SPECIALIST, E36_MILLER],
  },
  {
    slug: "e36-power-steering-leaks", system: "Steering", issue: "Power-steering reservoir and hose seepage", severity: "important", urgency: "watch", evidence: "Community consensus", appliesTo: { platforms: ["E36"] },
    description: "Reservoir hose connections and aged seals commonly deserve attention when fluid history is unknown.",
    symptoms: "ATF odor, wet reservoir or hoses, low level, steering noise, drips, or saturated underbody areas.", typicalMileage: "Age and hose condition dependent.",
    preventativeAction: "Verify the cap label, clean and identify the highest leak source, and inspect hoses and rack boots during a fluid exchange.", sources: [E36_MILLER, { type: "Community consensus", title: "E36 power-steering reservoir and hose service", publisher: "FCP Euro", url: "https://www.fcpeuro.com/blog/bmw-e36-power-steering-reservoir-hose-replacement", note: "Independent platform-specific service reference." }],
  },
];

export const KNOWN_ISSUES = [...ENHANCED_KNOWN_ISSUES, ...issues, ...CLASSIC_KNOWN_ISSUES, ...EXPANDED_KNOWN_ISSUES];

export const PROJECT_IDEAS: ProjectIdea[] = [
  { slug: "tires", title: "Replace aging run-flats with a quality tire setup", description: "A fresh, correctly sized tire is often the biggest ride, grip, and noise improvement on an F30.", payoff: "Ride · grip · confidence", appliesTo: {} },
  { slug: "suspension-refresh", title: "Refresh dampers and tired bushings as a system", description: "Restore the chassis before adding stiffness. Pair confirmed wear items with an alignment instead of chasing noises part by part.", payoff: "Control · comfort", appliesTo: {} },
  { slug: "carplay", title: "Add a reversible CarPlay / Android Auto interface", description: "A model-year-correct interface can modernize navigation and audio without turning the dashboard into an aftermarket science project.", payoff: "Daily usability", appliesTo: {} },
  { slug: "charge-pipe", title: "Upgrade the plastic charge path", description: "A well-fitting metal charge pipe is a popular preventative project after the maintenance baseline is current.", payoff: "Reliability · response", appliesTo: { engines: ["N20", "N26", "B58"] } },
  { slug: "rwd-lsd", title: "Plan a limited-slip differential", description: "For a RWD enthusiast build, a professionally selected LSD can add usable traction without pretending it is required maintenance.", payoff: "Traction · balance", appliesTo: { drivetrains: ["RWD"], engines: ["N20", "N26", "B58"] } },
  { slug: "brake-feel", title: "Dial in brake feel", description: "Fresh correct fluid, healthy rubber, quality street pads, and good tires come before larger calipers.", payoff: "Pedal feel · confidence", appliesTo: {} },
  { slug: "e36-cooling-baseline", title: "Build a documented E36 cooling baseline", description: "After inspection, replace only the age-critical cooling parts your engine family and history justify, then record the date and mileage.", payoff: "Reliability · confidence", appliesTo: { platforms: ["E36"] } },
  { slug: "e36-shifter-refresh", title: "Refresh shifter wear after the driveline is healthy", description: "Bushings and linkage parts can restore a precise feel without masking a damaged guibo, mount, or center-support bearing.", payoff: "Tactility · control", appliesTo: { platforms: ["E36"], transmissions: ["5-speed manual"] } },
  { slug: "e36-head-unit", title: "Add a reversible period-correct audio upgrade", description: "Modern Bluetooth or CarPlay can fit the cabin cleanly after water leaks, charging health, and mechanical priorities are handled.", payoff: "Daily usability", appliesTo: { platforms: ["E36"] } },
  { slug: "e46-cooling-log", title: "Build a dated E46 cooling-system record", description: "Pressure-test first, then document the age and condition of the tank, radiator, pump, thermostat, hoses, cap, fan, and pulleys.", payoff: "Reliability · history", appliesTo: { platforms: ["E46"] } },
  { slug: "e46-chassis-baseline", title: "Restore the E46 chassis before adding stiffness", description: "Inspect the rear axle carrier panel, front arms, trailing-arm bushings, rear mounts, tires, and alignment as one system.", payoff: "Balance · confidence", appliesTo: { platforms: ["E46"] } },
  { slug: "e46-audio", title: "Plan a reversible, period-aware audio upgrade", description: "Preserve the dashboard and factory wiring while adding the connectivity you actually use.", payoff: "Daily usability", appliesTo: { platforms: ["E46"] } },
  { slug: "e39-cooling-log", title: "Build a dated E39 cooling-system record", description: "Pressure-test first, then document the tank, radiator, pump, thermostat, hoses, fan, clutch, and auxiliary fan.", payoff: "Reliability · history", appliesTo: { platforms: ["E39"] } },
  { slug: "e39-chassis-refresh", title: "Restore the E39's original chassis balance", description: "Fresh thrust arms, confirmed rear links, healthy dampers, correct tires, and a careful alignment are more rewarding than random stiffness.", payoff: "Ride · control", appliesTo: { platforms: ["E39"] } },
  { slug: "e39-period-audio", title: "Add discreet modern audio to the E39 cabin", description: "Choose a reversible solution that keeps the dashboard, steering controls, and factory character intact.", payoff: "Daily usability", appliesTo: { platforms: ["E39"] } },
];

export function getCatalogItem(slug: string) {
  return [...MAINTENANCE_CATALOG, ...E36_MAINTENANCE_CATALOG].find((item) => item.slug === slug);
}
