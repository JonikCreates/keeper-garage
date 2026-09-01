import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BRAND_OPTIONS,
  LEGACY_SAVED_PROFILE_PLATFORMS,
  KNOWN_ISSUES,
  PROJECT_IDEAS,
  dedupeEngineOptionsByLabel,
  getEngineOptions,
  getEngineLabel,
  getDrivetrainOptions,
  getMaintenanceCatalog,
  getPlatform,
  getTransmissionOptions,
  getTrimOptions,
  getVehicleFamilyForPlatform,
  getVehicleFamilyOptions,
  getVehicleVariantOptions,
  getYearOptionsForTrim,
  inferEngine,
  isPrePurchaseIssue,
  matchesApplicability,
  type MaintenanceCatalogItem,
  type KnownIssue,
  type VehicleProfile,
  type VehicleBrand,
} from "../lib/catalog";
import { getOwnershipInsights } from "../lib/enhancedCatalog";
import { searchKnownIssues } from "../lib/knownIssueSearch";
import { AuthPanel, type AuthIntent } from "./AuthPanel";
import { CustomIssueForm } from "./CustomIssueForm";
import { CustomMaintenanceForm } from "./CustomMaintenanceForm";
import { DEMO_MAINTENANCE_RECORDS, DEMO_TRACKED_ITEMS, DEMO_VEHICLE } from "./demoGarage";
import { LegalPage } from "./LegalPage";
import { canAddVehicle, type KeeperProductCode } from "./keeperEntitlements";
import { useKeeperPromotions } from "./keeperPromotions";
import { KeeperUpgradeDialog, type UpgradePromptContext } from "./KeeperUpgradeDialog";
import { MaintenanceExportMenu } from "./MaintenanceExportMenu";
import { formatUsdCents, maintenanceTotalCents } from "./maintenanceExport";
import { MaintenanceRecordPanel } from "./MaintenanceRecordPanel";
import { OwnershipDashboard } from "./OwnershipDashboard";
import {
  createOwnershipInsights,
  type OwnershipStatusTone,
  type RecommendationType,
} from "./ownershipIntelligence";
import { ProfilePage } from "./ProfilePage";
import { PaymentResultPage } from "./PaymentResultPage";
import { SiteFooter } from "./SiteFooter";
import { createCheckout } from "./payments";
import { RemoveTrackedItemButton, TrackedIssueAction } from "./TrackedIssueAction";
import { VehicleRemovalDialog } from "./VehicleRemovalDialog";
import { useGarage } from "./useGarage";
import { useKeeperAuth } from "./useKeeperAuth";
import { KeeperBrand, KeeperLogo } from "./KeeperBrand";
import { useMaintenanceRecords } from "./useMaintenanceRecords";
import { useTrackedMaintenance } from "./useTrackedMaintenance";
import type { MaintenanceRecordRow, VehicleMaintenanceItemRow, VehicleRemovalSummary } from "./supabase";
import { getPageFromLocation, pageHref, type AppPage } from "./routing";
import {
  EMPTY_VEHICLE_SELECTION,
  selectVehicleBrand,
  selectVehicleFamily,
  selectVehicleVariant,
  selectVehicleYear,
  selectionFromProfile,
  vehicleSelectionIsComplete,
} from "./vehicleSelection";

type LibraryView = "mine" | "all" | string;
type Theme = "dark" | "light";
type MaintenanceStatus = { label: string; tone: OwnershipStatusTone };
type MaintenanceFilter = "all" | "soon" | "overdue" | "fluids" | "no_schedule";

type DashboardItem = {
  slug: string;
  name: string;
  category: string;
  severity: "critical" | "important" | "routine";
  kind: "baseline" | "known_issue" | "custom" | "custom_issue";
  planLabel: string;
  notes: string | null;
  catalog: MaintenanceCatalogItem | null;
  issue: KnownIssue | null;
  trackedItem: VehicleMaintenanceItemRow | null;
  mileageInterval: number | null;
  timeIntervalMonths: number | null;
  tracksFluid: boolean;
  records: MaintenanceRecordRow[];
  status: MaintenanceStatus;
};

const pageLinks: Array<{ page: AppPage; label: string }> = [
  { page: "garage", label: "Garage" },
  { page: "maintenance", label: "Maintenance" },
  { page: "issues", label: "Known issues" },
  { page: "profile", label: "Profile" },
];

const emergencyChecks = [
  {
    title: "Oil-pressure or timing warning",
    body: "Shut the engine down safely. Do not keep driving while a red oil-pressure warning, severe chain noise, or timing fault is active.",
  },
  {
    title: "Overheating or rapid coolant loss",
    body: "Stop before heat turns a cooling-system fault into engine damage. Never open a hot pressurized system.",
  },
  {
    title: "Brake, steering, smoke, fuel, or high-voltage warning",
    body: "Treat a change in control, visible smoke, fuel odor, or hybrid-system warning as a professional inspection item—not an internet diagnosis.",
  },
];

const engineLabels: Record<string, string> = {
  N20: "N20 2.0L turbo",
  N26: "N26 2.0L turbo · SULEV",
  N47T: "N47T 2.0L · Diesel",
  "B48-PHEV": "B48 2.0L · Plug-in Hybrid",
  B46: "B46 2.0L turbo",
  N55: "N55 3.0L turbo I6",
  B58: "B58 3.0L turbo I6",
  M42: "M42B18 1.8L I4",
  M44: "M44B19 1.9L I4",
  "M50-NV": "M50B25 2.5L I6 · non-VANOS",
  M50TU: "M50B25TU 2.5L I6 · single VANOS",
  M52B25: "M52B25 2.5L I6",
  M52B28: "M52B28 2.8L I6",
  S50US: "S50B30US 3.0L I6",
  S52US: "S52B32 3.2L I6",
  M52TUB25: "M52TUB25 2.5L I6 · double VANOS",
  M52TUB28: "M52TUB28 2.8L I6 · double VANOS",
  M54B25: "M54B25 2.5L I6",
  M56B25: "M56B25 2.5L I6 · SULEV",
  M54B30: "M54B30 3.0L I6",
  S54B32: "S54B32 3.2L I6",
  M62B44: "M62B44 4.4L V8 · non-VANOS",
  M62TUB44: "M62TUB44 4.4L V8 · VANOS",
  S62B50: "S62B50 5.0L V8",
};

function MParallelWheel() {
  return <svg className="theme-wheel" viewBox="0 0 64 64" aria-hidden="true">
    <circle className="wheel-tire" cx="32" cy="32" r="29" />
    <circle className="wheel-rim" cx="32" cy="32" r="23" />
    <g className="wheel-spokes">
      {Array.from({ length: 5 }, (_, index) => <g key={index} transform={`rotate(${index * 72} 32 32)`}>
        <path d="M28.3 28.3 20 12.5 25.4 10 31.1 27.2Z" />
        <path d="M35.7 28.3 44 12.5 38.6 10 32.9 27.2Z" />
      </g>)}
    </g>
    <circle className="wheel-hub" cx="32" cy="32" r="7" />
    <circle className="wheel-cap" cx="32" cy="32" r="3" />
    {Array.from({ length: 5 }, (_, index) => <circle key={index} className="wheel-lug" cx="32" cy="26.6" r="1" transform={`rotate(${index * 72} 32 32)`} />)}
  </svg>;
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const next = theme === "dark" ? "light" : "dark";
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} aria-pressed={theme === "dark"}>
    <span className="theme-icon" aria-hidden="true">☾</span>
    <span className="theme-wheel-travel"><MParallelWheel /></span>
    <span className="theme-icon" aria-hidden="true">☀</span>
    <span className="sr-only">{theme} mode</span>
  </button>;
}

function EvidenceTag({ value }: { value: string }) {
  const tone = value.includes("recall") ? "recall" : value.includes("bulletin") ? "bulletin" : "community";
  return <span className={`evidence-tag ${tone}`}>{value}</span>;
}

function issueMatchesTrim(issue: KnownIssue, platform: VehicleProfile["platform"], trim: string) {
  const option = getTrimOptions(platform).find((candidate) => candidate.value === trim);
  if (!option) return true;
  const rules = issue.appliesTo;
  return (rules.platforms ?? ["F30"]).includes(platform) &&
    (!rules.trims || rules.trims.includes(trim)) &&
    (!rules.engines || rules.engines.some((engine) => (option.engines as readonly string[]).includes(engine)));
}

function shortServiceDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function maintenancePlanStatus(miles: number | null, months: number | null, latest: { mileage: number; completed_at: string } | undefined, currentMileage: number | null): MaintenanceStatus {
  if (!latest) return { label: "No history", tone: "unrecorded" };
  if (!miles && !months) return { label: "Condition based", tone: "current" };

  const dueMileage = miles ? latest.mileage + miles : null;
  const completedDate = new Date(`${latest.completed_at}T00:00:00Z`);
  const dueDate = months ? addServiceMonths(completedDate, months) : null;
  const mileageRemaining = dueMileage !== null && currentMileage !== null ? dueMileage - currentMileage : null;
  const timeRemaining = dueDate ? dueDate.getTime() - Date.now() : null;
  const overdue = (mileageRemaining !== null && mileageRemaining <= 0) || (timeRemaining !== null && timeRemaining <= 0);
  if (overdue) return { label: "Overdue", tone: "overdue" };
  const dueSoon = (mileageRemaining !== null && mileageRemaining <= Math.max(1_000, (miles ?? 0) * .1)) || (timeRemaining !== null && timeRemaining <= 30 * 86_400_000);
  return dueSoon ? { label: "Due soon", tone: "soon" } : { label: "On plan", tone: "current" };
}

function addServiceMonths(date: Date, months: number) {
  if (Number.isInteger(months)) return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  return new Date(date.getTime() + months * 30.4375 * 86_400_000);
}

const maintenanceSections: Array<{ key: "overdue" | "soon" | "done"; tones: OwnershipStatusTone[]; label: string; description: string }> = [
  { key: "overdue", tones: ["overdue"], label: "Overdue", description: "Past its mileage or time plan. Start here." },
  { key: "soon", tones: ["soon", "unrecorded"], label: "Due Soon", description: "Approaching its plan, newly tracked, or waiting for a first record." },
  { key: "done", tones: ["current"], label: "Done", description: "Completed work that is currently on plan." },
];

const fluidTerms = /oil|coolant|fluid|lubric|differential|transfer case|transmission|brake flush|power steering|clutch hydraulic/i;

function isFluidCatalogItem(item: MaintenanceCatalogItem) {
  return fluidTerms.test(`${item.name} ${item.category}`);
}

function maintenancePlanLabel(miles: number | null, months: number | null) {
  if (!miles && !months) return "No scheduled interval";
  const values = [miles ? `${miles.toLocaleString()} miles` : null, months ? months % 12 === 0 ? `${months / 12} year${months === 12 ? "" : "s"}` : `${months} months` : null].filter(Boolean);
  return `Every ${values.join(" or ")}`;
}

function nextDueLabel(item: Pick<DashboardItem, "mileageInterval" | "timeIntervalMonths">, latest: MaintenanceRecordRow | undefined) {
  if (!item.mileageInterval && !item.timeIntervalMonths) return "No recurring schedule";
  if (!latest) return maintenancePlanLabel(item.mileageInterval, item.timeIntervalMonths).replace(/^Every /, "Plan: ");
  const mileage = item.mileageInterval ? `${(latest.mileage + item.mileageInterval).toLocaleString()} mi` : null;
  const date = item.timeIntervalMonths ? (() => {
    const value = new Date(`${latest.completed_at}T00:00:00Z`);
    return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric", timeZone: "UTC" }).format(addServiceMonths(value, item.timeIntervalMonths!));
  })() : null;
  return [mileage, date].filter(Boolean).join(" / ");
}

function maintenanceRecordFluid(record: MaintenanceRecordRow) {
  const product = [record.fluid_brand, record.fluid_product, record.fluid_viscosity ?? record.fluid_type].filter(Boolean).join(" · ");
  const quantity = record.fluid_quantity !== null ? `${record.fluid_quantity} ${record.fluid_unit ?? "units"}` : "";
  return [product, quantity].filter(Boolean).join(" · ");
}

const severityRank: Record<DashboardItem["severity"], number> = { critical: 0, important: 1, routine: 2 };

const CONFIGURED_PROFILE_KEY = "keeper-configured-vehicle";
const DEFAULT_PROFILE: VehicleProfile = {
  brand: "BMW",
  platform: "F30",
  year: 2014,
  trim: "328i",
  engineCode: "N20",
  drivetrain: "RWD",
  transmission: "8-speed automatic",
};

function dashboardRecommendationType(item: DashboardItem): RecommendationType {
  if (item.kind === "known_issue" || item.kind === "custom_issue") return "inspection";
  if (item.kind === "custom") return "owner";
  if (!item.catalog) return "preventative";
  const guidance = `${item.catalog.name} ${item.catalog.description} ${item.catalog.community.label}`;
  if (/inspect|check|condition based/i.test(guidance)) return "inspection";
  const oem = item.catalog.oem;
  const communityMatchesOem = item.mileageInterval === oem.mileage && item.timeIntervalMonths === oem.months;
  if (communityMatchesOem && (oem.mileage || oem.months)) return "manufacturer";
  return item.mileageInterval || item.timeIntervalMonths ? "keeper" : "preventative";
}

function resolveProfile(platform: VehicleProfile["platform"], year: number, trim: string | undefined, current?: VehicleProfile): VehicleProfile {
  const options = getTrimOptions(platform, year);
  const selected = options.find((option) => option.value === trim) ?? options[0];
  const drivetrains = getDrivetrainOptions(platform, selected.value, year);
  const drivetrain = drivetrains.includes(current?.drivetrain ?? "") ? current!.drivetrain : drivetrains[0];
  const transmissions = getTransmissionOptions(platform, selected.value, drivetrain, year);
  const transmission = transmissions.includes(current?.transmission ?? "") ? current!.transmission : transmissions[0];
  return {
    brand: getPlatform(platform).brand,
    platform,
    year,
    trim: selected.value,
    drivetrain,
    transmission,
    engineCode: inferEngine(platform, selected.value, year, transmission, current?.engineCode),
  };
}

function initialConfiguredProfile(): VehicleProfile {
  try {
    const stored = JSON.parse(sessionStorage.getItem(CONFIGURED_PROFILE_KEY) ?? "null") as Partial<VehicleProfile> | null;
    if (!stored?.platform || getPlatform(stored.platform).value !== stored.platform || !Number.isInteger(stored.year)) return DEFAULT_PROFILE;
    const platform = getPlatform(stored.platform);
    if (stored.year! < platform.yearStart || stored.year! > platform.yearEnd) return DEFAULT_PROFILE;
    return resolveProfile(stored.platform, stored.year!, stored.trim, stored as VehicleProfile);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function App() {
  const [profile, setProfile] = useState<VehicleProfile>(initialConfiguredProfile);
  // The draft stays independent from the last complete profile so a new garage
  // entry can require explicit Make -> Family -> Variant -> Year choices.
  const [vehicleSelection, setVehicleSelection] = useState(EMPTY_VEHICLE_SELECTION);
  const [libraryView, setLibraryView] = useState<LibraryView>("mine");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [maintenanceFilter, setMaintenanceFilter] = useState<MaintenanceFilter>("all");
  const [maintenanceCategory, setMaintenanceCategory] = useState("all");
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [watchExpanded, setWatchExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(() => new URLSearchParams(window.location.search).has("account"));
  const [authIntent, setAuthIntent] = useState<AuthIntent>("account");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [vehicleRemovalTargetId, setVehicleRemovalTargetId] = useState<string | null>(null);
  const [vehicleRemovalSummary, setVehicleRemovalSummary] = useState<VehicleRemovalSummary | null>(null);
  const [vehicleRemovalLoading, setVehicleRemovalLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<UpgradePromptContext | null>(null);
  const [upgradeCheckoutBusy, setUpgradeCheckoutBusy] = useState(false);
  const [upgradeCheckoutMessage, setUpgradeCheckoutMessage] = useState<string | null>(null);
  // REVIEW DECISION: Cloudflare uses clean page paths while the fallback GitHub Pages build retains addressable hash routes.
  const [page, setPage] = useState<AppPage>(getPageFromLocation);
  // REVIEW DECISION: new visitors start in light mode, while a deliberate theme choice remains local to that browser.
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("keeper-theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#121416" : "#0d2b46");
    localStorage.setItem("keeper-theme", theme);
  }, [theme]);

  // Keep an unsaved vehicle configuration intact across Keeper's clean-path page reloads.
  // Saved-garage loading still wins afterward, and guest mode still resets to the public demo.
  useEffect(() => {
    sessionStorage.setItem(CONFIGURED_PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const syncPage = () => setPage(getPageFromLocation());
    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  useEffect(() => {
    document.title = page === "garage"
      ? "Keeper | Garage"
      : page === "maintenance"
        ? `Keeper | ${profile.year} ${profile.trim} Maintenance`
        : page === "issues"
          ? `Keeper | ${profile.year} ${profile.trim} Known Issues`
          : page === "profile"
            ? "Keeper | Profile"
            : `Keeper | ${page === "terms" ? "Terms of Service" : page === "privacy" ? "Privacy Policy" : "Contact"}`;
  }, [page, profile.trim, profile.year]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const auth = useKeeperAuth();
  const promotions = useKeeperPromotions(auth.access.kind === "account", auth.refreshAccountState);
  const loadVehicle = useCallback((vehicle: VehicleProfile) => {
    setProfile(vehicle);
    setVehicleSelection(selectionFromProfile(vehicle));
    setLibraryView("mine");
    setWatchExpanded(false);
  }, []);
  const garage = useGarage(auth.dataUser, loadVehicle, auth.dataVersion);
  const serviceRecords = useMaintenanceRecords(auth.dataUser, garage.vehicleId);
  const trackedMaintenance = useTrackedMaintenance(auth.dataUser, garage.vehicleId);
  const formDraftScope = auth.dataUser && garage.vehicleId ? `${auth.dataUser.id}:${garage.vehicleId}` : null;

  useEffect(() => {
    if (!auth.ready || auth.access.kind !== "guest") return;
    queueMicrotask(() => {
      setProfile(DEFAULT_PROFILE);
      setVehicleSelection(selectionFromProfile(DEFAULT_PROFILE));
    });
  }, [auth.access.kind, auth.ready]);

  const platform = getPlatform(profile.platform);
  const displayFamily = getVehicleFamilyForPlatform(profile.platform);
  const displayVariant = getVehicleVariantOptions(displayFamily.value)
    .find((variant) => variant.platform === profile.platform && variant.trim === profile.trim);
  const familyOptions = vehicleSelection.brand ? getVehicleFamilyOptions(vehicleSelection.brand) : [];
  const selectableVariantOptions = vehicleSelection.family ? getVehicleVariantOptions(vehicleSelection.family) : [];
  const legacySavedVariant = vehicleSelection.family === displayFamily.value
    && vehicleSelection.variant
    && LEGACY_SAVED_PROFILE_PLATFORMS.some((platformId) => platformId === profile.platform)
    && !selectableVariantOptions.some((variant) => variant.value === vehicleSelection.variant)
      ? {
          value: vehicleSelection.variant,
          platform: profile.platform,
          trim: profile.trim,
          label: `Legacy ${profile.trim} · body style not recorded`,
          yearStart: platform.yearStart,
          yearEnd: platform.yearEnd,
        }
      : undefined;
  const variantOptions = legacySavedVariant ? [...selectableVariantOptions, legacySavedVariant] : selectableVariantOptions;
  const selectedVariant = vehicleSelection.variant
    ? variantOptions.find((variant) => variant.value === vehicleSelection.variant)
    : undefined;
  const years = selectedVariant ? getYearOptionsForTrim(selectedVariant.platform, selectedVariant.trim) : [];
  const configurationReady = vehicleSelectionIsComplete(vehicleSelection) && Boolean(selectedVariant);
  const libraryTrimOptions = getTrimOptions(profile.platform);
  const drivetrains = configurationReady ? getDrivetrainOptions(profile.platform, profile.trim, profile.year) : [];
  const transmissions = configurationReady ? getTransmissionOptions(profile.platform, profile.trim, profile.drivetrain, profile.year) : [];
  const engineOptions = configurationReady ? dedupeEngineOptionsByLabel(
    getEngineOptions(profile.platform, profile.trim, profile.year, profile.transmission).map((engine) => ({
      value: engine,
      label: engineLabels[engine] ?? getEngineLabel({ ...profile, engineCode: engine }),
    })),
    profile.engineCode,
  ) : [];
  const selectedEngineLabel = engineOptions.find((option) => option.value === profile.engineCode)?.label
    ?? engineLabels[profile.engineCode]
    ?? getEngineLabel(profile);
  const profileLabel = `${profile.year} ${profile.brand} ${displayVariant?.label ?? profile.trim} · ${displayFamily.label}`;

  const maintenance = useMemo(() => getMaintenanceCatalog(profile), [profile]);
  const matchedIssues = useMemo(
    () => KNOWN_ISSUES.filter((issue) => matchesApplicability(profile, issue.appliesTo)),
    [profile],
  );
  const catalogOwnershipInsights = useMemo(() => getOwnershipInsights(profile), [profile]);
  const urgentIssues = matchedIssues.filter((issue) => issue.urgency === "urgent");
  const watchIssues = matchedIssues.filter((issue) => issue.urgency === "watch");
  const projects = PROJECT_IDEAS.filter((project) => matchesApplicability(profile, project.appliesTo));
  const demoMode = auth.access.kind === "guest";
  const demoVehicleSelected = demoMode && profile.brand === "BMW" && profile.platform === "F30" && profile.year === 2014 && profile.trim === "328i" && profile.engineCode === "N20" && profile.drivetrain === "RWD" && profile.transmission === "8-speed automatic";
  const selectedSavedVehicle = demoVehicleSelected ? DEMO_VEHICLE : garage.vehicles.find((vehicle) => vehicle.id === garage.vehicleId) ?? null;
  const vehicleRemovalTarget = garage.vehicles.find((vehicle) => vehicle.id === vehicleRemovalTargetId) ?? null;
  const currentVehicleMileage = demoVehicleSelected ? DEMO_VEHICLE.mileage : demoMode ? null : garage.mileage.trim() ? Number(garage.mileage) : null;
  const displayRecords = useMemo(() => demoVehicleSelected ? DEMO_MAINTENANCE_RECORDS : demoMode ? [] : serviceRecords.records, [demoMode, demoVehicleSelected, serviceRecords.records]);
  const totalSpentCents = useMemo(() => maintenanceTotalCents(displayRecords), [displayRecords]);
  const displayTrackedItems = useMemo(() => demoVehicleSelected ? DEMO_TRACKED_ITEMS : demoMode ? [] : trackedMaintenance.items, [demoMode, demoVehicleSelected, trackedMaintenance.items]);
  const displayRecordsBySlug = useMemo(() => {
    const grouped = new Map<string, MaintenanceRecordRow[]>();
    for (const record of displayRecords) {
      const records = grouped.get(record.maintenance_slug) ?? [];
      records.push(record);
      grouped.set(record.maintenance_slug, records);
    }
    return grouped;
  }, [displayRecords]);

  const dashboardItems = useMemo<DashboardItem[]>(() => {
    const baselineItems = maintenance.map((item): DashboardItem => {
      const records = displayRecordsBySlug.get(item.slug) ?? [];
      const mileageInterval = item.community.mileage ?? item.oem.mileage;
      const timeIntervalMonths = item.community.months ?? item.oem.months;
      return {
        slug: item.slug,
        name: item.name,
        category: item.category,
        severity: item.severity,
        kind: "baseline",
        planLabel: item.community.label,
        notes: null,
        catalog: item,
        issue: null,
        trackedItem: null,
        mileageInterval,
        timeIntervalMonths,
        tracksFluid: isFluidCatalogItem(item),
        records,
        status: maintenancePlanStatus(mileageInterval, timeIntervalMonths, records[0], currentVehicleMileage),
      };
    });
    const addedItems = displayTrackedItems.map((item): DashboardItem => {
      const records = displayRecordsBySlug.get(item.item_slug) ?? [];
      const issueSlug = item.item_type === "known_issue" ? item.item_slug.replace(/^issue-/, "") : null;
      const scheduled = item.item_type === "custom" && item.plan_type !== "none";
      const unscheduledStatus: MaintenanceStatus = records.length || item.issue_status === "repaired"
        ? { label: "Done", tone: "current" }
        : { label: item.issue_status === "watching" ? "Watching" : item.issue_status === "needs_repair" ? "Needs repair" : item.plan_type === "none" ? "No schedule" : "Due Soon", tone: "soon" };
      return {
        slug: item.item_slug,
        name: item.item_name,
        category: item.category,
        severity: item.severity,
        kind: item.item_type,
        planLabel: scheduled ? maintenancePlanLabel(item.mileage_interval, item.time_interval_months) : item.item_type === "known_issue" ? "Owner-tracked issue" : item.item_type === "custom_issue" ? "Owner-reported issue" : "No scheduled interval",
        notes: item.notes,
        catalog: null,
        issue: issueSlug ? KNOWN_ISSUES.find((issue) => issue.slug === issueSlug) ?? null : null,
        trackedItem: item,
        mileageInterval: scheduled ? item.mileage_interval : null,
        timeIntervalMonths: scheduled ? item.time_interval_months : null,
        tracksFluid: item.tracks_fluid,
        records,
        status: scheduled ? maintenancePlanStatus(item.mileage_interval, item.time_interval_months, records[0], currentVehicleMileage) : unscheduledStatus,
      };
    });
    const toneRank: Record<OwnershipStatusTone, number> = { overdue: 0, soon: 1, unrecorded: 1, current: 2 };
    return [...baselineItems, ...addedItems].sort((left, right) =>
      toneRank[left.status.tone] - toneRank[right.status.tone]
      || severityRank[left.severity] - severityRank[right.severity]
      || left.name.localeCompare(right.name));
  }, [currentVehicleMileage, displayRecordsBySlug, displayTrackedItems, maintenance]);

  const maintenanceCategories = useMemo(() => [...new Set(dashboardItems.map((item) => item.category))].sort(), [dashboardItems]);
  const activeTrackedIssues = useMemo(() => displayTrackedItems.filter((item) =>
    (item.item_type === "known_issue" || item.item_type === "custom_issue") && item.issue_status !== "repaired").length, [displayTrackedItems]);
  const ownershipInsights = useMemo(() => createOwnershipInsights({
    currentMileage: currentVehicleMileage,
    records: displayRecords.map((record) => ({
      name: record.maintenance_name,
      completedAt: record.completed_at,
      mileage: record.mileage,
      costCents: record.cost_cents,
    })),
    items: dashboardItems.map((item) => ({
      slug: item.slug,
      name: item.name,
      category: item.category,
      severity: item.severity,
      kind: item.kind,
      statusTone: item.status.tone,
      recommendationType: dashboardRecommendationType(item),
      description: item.issue?.description ?? item.catalog?.description ?? item.notes,
      mileageInterval: item.mileageInterval,
      timeIntervalMonths: item.timeIntervalMonths,
      latestRecord: item.records[0] ? { completedAt: item.records[0].completed_at, mileage: item.records[0].mileage } : null,
      issueStatus: item.trackedItem?.issue_status ?? null,
      knownIssueUrgency: item.issue?.urgency ?? null,
    })),
  }), [currentVehicleMileage, dashboardItems, displayRecords]);
  const visibleDashboardItems = useMemo(() => dashboardItems.filter((item) => {
    if (maintenanceCategory !== "all" && item.category !== maintenanceCategory) return false;
    if (maintenanceFilter === "overdue") return item.status.tone === "overdue";
    if (maintenanceFilter === "soon") return item.status.tone === "soon" || item.status.tone === "unrecorded";
    if (maintenanceFilter === "fluids") return item.tracksFluid;
    if (maintenanceFilter === "no_schedule") return !item.mileageInterval && !item.timeIntervalMonths;
    return true;
  }), [dashboardItems, maintenanceCategory, maintenanceFilter]);
  const currentFluids = useMemo(() => dashboardItems.flatMap((item) => {
    if (!item.tracksFluid) return [];
    const record = item.records.find((candidate) => maintenanceRecordFluid(candidate));
    return record ? [{ item, record, label: maintenanceRecordFluid(record) }] : [];
  }), [dashboardItems]);

  const ppiIssuesAvailable = useMemo(() => KNOWN_ISSUES.some((issue) =>
    (issue.appliesTo.platforms ?? ["F30"]).includes(profile.platform)
      && isPrePurchaseIssue(issue)), [profile.platform]);

  const browseIssues = useMemo(() => KNOWN_ISSUES.filter((issue) => {
    const platformMatches = (issue.appliesTo.platforms ?? ["F30"]).includes(profile.platform);
    if (libraryView === "all") return platformMatches;
    if (libraryView === "mine") return matchesApplicability(profile, issue.appliesTo);
    if (libraryView === "ppi") return matchesApplicability(profile, issue.appliesTo) && isPrePurchaseIssue(issue);
    return issueMatchesTrim(issue, profile.platform, libraryView);
  }), [libraryView, profile]);
  const issueSearchResults = useMemo(() => searchKnownIssues(libraryQuery, matchedIssues, profile), [libraryQuery, matchedIssues, profile]);
  const libraryIssues = libraryQuery.trim() ? issueSearchResults.map((result) => result.issue) : browseIssues;
  const issueSearchBySlug = useMemo(() => new Map(issueSearchResults.map((result) => [result.issue.slug, result])), [issueSearchResults]);

  function resetGenerationView() {
    setLibraryView("mine");
    setWatchExpanded(false);
  }

  function selectBrand(brand: VehicleBrand) {
    resetGenerationView();
    setVehicleSelection(selectVehicleBrand(brand));
  }

  function selectFamily(family: string) {
    resetGenerationView();
    setVehicleSelection((current) => selectVehicleFamily(current, family));
  }

  function selectVariant(variant: string) {
    if (!vehicleSelection.family) return;
    resetGenerationView();
    setVehicleSelection((current) => selectVehicleVariant(current, variant));
  }

  function selectYear(year: number) {
    if (!selectedVariant) return;
    resetGenerationView();
    setVehicleSelection((current) => selectVehicleYear(current, year));
    setProfile((current) => resolveProfile(selectedVariant.platform, year, selectedVariant.trim, current));
  }

  function selectDrivetrain(drivetrain: string) {
    setProfile((current) => {
      const nextTransmissions = getTransmissionOptions(current.platform, current.trim, drivetrain, current.year);
      const transmission = nextTransmissions.includes(current.transmission) ? current.transmission : nextTransmissions[0];
      return { ...current, drivetrain, transmission, engineCode: inferEngine(current.platform, current.trim, current.year, transmission, current.engineCode) };
    });
  }

  function selectTransmission(transmission: string) {
    setProfile((current) => ({
      ...current,
      transmission,
      engineCode: inferEngine(current.platform, current.trim, current.year, transmission, current.engineCode),
    }));
  }

  async function saveGarage() {
  setSaveNotice(null);

  if (!auth.access.canSaveGarage) {
    openAccount("save");
    return;
  }

  const editing = Boolean(garage.vehicleId);

  if (!configurationReady) {
    setSaveNotice("Choose a make, model/generation, trim/variant, and year before saving this vehicle.");
    return;
  }

  if (!editing && !canAddVehicle(auth.access.keeper, garage.vehicles.length)) {
    setUpgradeCheckoutMessage(null);
    setUpgradePrompt("limit");
    return;
  }

  const saved = await garage.saveVehicle(profile);

  setSaveNotice(
    saved
      ? editing
        ? "Vehicle changes saved."
        : "Vehicle added to My Garage."
      : null,
  );
}

  async function openVehicleRemoval() {
    const vehicleId = garage.vehicleId;
    if (!vehicleId || auth.access.kind !== "account") return;
    setSaveNotice(null);
    setVehicleRemovalTargetId(vehicleId);
    setVehicleRemovalSummary(null);
    setVehicleRemovalLoading(true);
    const summary = await garage.getRemovalSummary(vehicleId);
    setVehicleRemovalSummary(summary);
    setVehicleRemovalLoading(false);
  }

  function closeVehicleRemoval() {
    if (garage.removing) return;
    setVehicleRemovalTargetId(null);
    setVehicleRemovalSummary(null);
    setVehicleRemovalLoading(false);
  }

  async function confirmVehicleRemoval() {
    if (!vehicleRemovalTarget) return;
    const label = `${vehicleRemovalTarget.model_year} ${vehicleRemovalTarget.brand} ${vehicleRemovalTarget.trim}`;
    const hadOtherVehicles = garage.vehicles.length > 1;
    const removed = await garage.removeVehicle(vehicleRemovalTarget.id);
    if (!removed) return;
    closeVehicleRemoval();
    setSaveNotice(hadOtherVehicles ? `${label} was removed. Keeper selected another vehicle in your garage.` : `${label} was removed. Your Garage is empty.`);
  }

  async function addIssueToMaintenance(issue: KnownIssue) {
    if (!auth.access.canCustomize) {
      openAccount("save");
      return;
    }
    if (!garage.vehicleId) {
      setSaveNotice("Save this vehicle before adding an issue to its maintenance plan.");
      window.location.assign(pageHref("garage"));
      return;
    }
    await trackedMaintenance.addKnownIssue(issue);
  }

  function requireSavedVehicle() {
    if (!auth.access.canCustomize) {
      openAccount("save");
      return;
    }
    if (!garage.vehicleId) {
      setSaveNotice("Save this vehicle before adding work to its maintenance plan.");
      window.location.assign(pageHref("garage"));
    }
  }

  function closeAuth() {
    setAuthOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("account")) {
      url.searchParams.delete("account");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function openAccount(intent: AuthIntent = "account") {
    auth.clearStatus();
    setAuthIntent(intent);
    setAuthOpen(true);
  }

  function openUpgrade(context: UpgradePromptContext) {
    setUpgradeCheckoutMessage(null);
    setUpgradePrompt(context);
  }

  function requestNewVehicle() {
    setSaveNotice(null);
    if (!canAddVehicle(auth.access.keeper, garage.vehicles.length)) {
      openUpgrade("limit");
      return;
    }
    garage.startNewVehicle();
    setVehicleSelection(EMPTY_VEHICLE_SELECTION);
  }

  async function beginUpgradeCheckout(productCode: KeeperProductCode) {
    setUpgradeCheckoutBusy(true);
    setUpgradeCheckoutMessage(null);
    try {
      const result = await createCheckout(productCode);
      if (result.status === "redirect") {
        window.location.assign(result.url);
        return;
      }
      if (result.status === "already_owned") {
        setUpgradeCheckoutMessage("This Keeper plan is already active. Refreshing account access…");
        await auth.refreshAccountState();
        return;
      }
      if (result.status === "invalid_transition") {
        setUpgradeCheckoutMessage(result.message);
        await auth.refreshAccountState();
        return;
      }
      setUpgradeCheckoutMessage(result.message);
    } finally {
      setUpgradeCheckoutBusy(false);
    }
  }

  const accountLabel = !auth.ready ? "Checking…" : auth.access.kind === "account" ? "My Profile" : auth.access.kind === "setup" ? "Finish setup" : "Sign In";
  const garageTitle = auth.access.kind === "account" ? "My Garage" : auth.access.kind === "legacy" ? "Existing Garage" : auth.access.kind === "setup" ? "Profile setup" : "Demo Garage";
  const hasPersonalVehicle = Boolean(selectedSavedVehicle);
  return (
    <div className="site-shell">
      <section className="forum-banner" aria-label="Keeper workshop archive">
        <div><span>Keeper Workshop Archive</span><strong>Enthusiast maintenance intelligence</strong></div>
        <p><span>KNOWLEDGE + ORGANIZATION + VEHICLE HISTORY</span></p>
      </section>
      <header className="topbar">
        <KeeperBrand href={pageHref("garage")} />
        <nav aria-label="Primary navigation">{pageLinks.map((link) => <a className={page === link.page ? "active" : ""} aria-current={page === link.page ? "page" : undefined} href={pageHref(link.page)} key={link.page}>{link.label}</a>)}</nav>
        <div className="topbar-actions"><ThemeToggle theme={theme} onToggle={() => setTheme((value) => value === "dark" ? "light" : "dark")} /><button className={`account-button ${auth.access.kind === "account" ? "active" : ""} ${auth.access.kind}`} onClick={() => {
          if (auth.access.kind === "account") {
            window.location.assign(pageHref("profile"));
            return;
          }
          openAccount("account");
        }}>{accountLabel}</button></div>
      </header>

      <main id="top">
        {page === "garage" && <>
        <section className={`hero ${hasPersonalVehicle ? "personal-garage-layout" : ""}`}>
{hasPersonalVehicle && selectedSavedVehicle ? <section className="personal-garage-dashboard" aria-labelledby="personal-garage-title">
  <header className="personal-garage-identity">
    <KeeperLogo className="personal-garage-logo" context="auto" />
    <p className="eyebrow">{garageTitle}</p>
    <span>{selectedSavedVehicle.nickname}</span>

    <div className="personal-garage-title-block">
      <span className="personal-garage-year">
        {selectedSavedVehicle.model_year}
      </span>

      <h1 id="personal-garage-title">
        {selectedSavedVehicle.brand} {selectedSavedVehicle.trim}
      </h1>
    </div>
              <p><strong>{currentVehicleMileage === null ? "Mileage not entered" : `${currentVehicleMileage.toLocaleString()} miles`}</strong><i />{selectedSavedVehicle.model}</p>
{garage.vehicles.length > 1 && <label className="mobile-garage-switcher">
  <span>Switch vehicle</span>
  <select
    aria-label="Switch saved vehicle"
    value={garage.vehicleId ?? "new"}
    disabled={garage.loading || garage.saving}
    onChange={(event) => {
      setSaveNotice(null);
      if (event.target.value === "new") garage.startNewVehicle();
      else garage.selectVehicle(event.target.value);
    }}
  >
    {garage.vehicles.map((vehicle) => (
      <option value={vehicle.id} key={vehicle.id}>
        {vehicle.nickname} · {vehicle.model_year} {vehicle.trim}
      </option>
    ))}
  </select>
</label>}
              <div><a href={pageHref("maintenance")} className="button button-primary">View Maintenance</a><a href={pageHref("issues")} className="button button-quiet">Known Issues</a></div>
            </header>
            <dl className="personal-garage-specs">
              <div><dt>Engine</dt><dd>{selectedEngineLabel}</dd></div>
              <div><dt>Drivetrain</dt><dd>{profile.drivetrain}</dd></div>
              <div><dt>Transmission</dt><dd>{profile.transmission}</dd></div>
              <div><dt>Platform</dt><dd>{platform.label}</dd></div>
            </dl>
            <div className="personal-garage-stats">
              <div><span>Completed services</span><strong>{displayRecords.length}</strong></div>
              <div><span>Tracked issues</span><strong>{activeTrackedIssues}</strong></div>
              <div><span>Recorded spending</span><strong>{formatUsdCents(totalSpentCents)}</strong></div>
              <div><span>Matched research</span><strong>{matchedIssues.length} patterns</strong></div>
            </div>
            <OwnershipDashboard
  insights={ownershipInsights}
  currentMileage={currentVehicleMileage}
  maintenanceHref={pageHref("maintenance")}
/>
          </section> : <div className="hero-copy">
            <p className="eyebrow">Multi-brand workshop archive · {BRAND_OPTIONS.length} enthusiast makes</p>
            <h1>Know what your car needs next.</h1>
            <p className="hero-intro">Factory information, researched owner patterns, and specialist maintenance guidance—filtered for the exact generation, year, engine, drivetrain, and transmission.</p>
            <div className="hero-actions"><a href={pageHref("maintenance")} className="button button-primary">Open maintenance list</a><a href={pageHref("issues")} className="button button-quiet">Browse all {KNOWN_ISSUES.length} issues</a></div>
          </div>}
          <aside className="configuration-panel" aria-labelledby="config-title">
            <div className="configuration-heading"><span>{hasPersonalVehicle ? "Edit saved vehicle" : "Configure this visit"}</span><strong id="config-title">{hasPersonalVehicle ? "Vehicle Settings" : "Your exact vehicle"}</strong></div>
            <div className="garage-picker">
              <div className="garage-picker-copy"><span>{garageTitle}</span><strong>{demoVehicleSelected ? "2014 BMW 328i · Demo Vehicle" : demoMode ? `${profileLabel} · Guest preview` : garage.loading ? "Loading saved vehicles…" : garage.vehicles.length ? `${garage.vehicles.length} saved vehicle${garage.vehicles.length === 1 ? "" : "s"}` : auth.access.kind === "setup" ? "Finish Profile setup to load your garage" : "No saved vehicles yet"}</strong></div>
              {auth.dataUser ? <>
                <label><span>Saved vehicles</span><select aria-label="Saved vehicles" value={garage.vehicleId ?? "new"} disabled={garage.loading || garage.saving} onChange={(event) => { setSaveNotice(null); if (event.target.value === "new") requestNewVehicle(); else garage.selectVehicle(event.target.value); }}>
                  {garage.vehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.nickname} · {vehicle.model_year} {vehicle.trim}</option>)}
                  {auth.access.canSaveGarage && <option value="new">＋ Add another vehicle</option>}
                </select></label>
                <p>{auth.access.kind === "legacy" ? "Read-only until this existing garage is linked to a Keeper Profile." : garage.vehicleId ? `Editing ${garage.nickname}. Changes update this saved vehicle.` : "Creating a new garage entry. Your other vehicles will not be changed."}</p>
              </> : <button className="button button-quiet garage-login" onClick={() => openAccount("save")}>{demoMode ? "Create a Profile to build your garage" : "Finish Keeper Profile setup"}</button>}
            </div>
            <p className="configuration-flow">{hasPersonalVehicle ? "Update the exact specification or ownership details below." : "Choose in order. Each selection narrows the choices that follow."}</p>
            <div className="config-grid">
              <label>Make<select value={vehicleSelection.brand ?? ""} onChange={(event) => selectBrand(event.target.value as VehicleBrand)}>
                <option value="" disabled>Select make</option>
                {BRAND_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select></label>
              <label>Model / Generation<select value={vehicleSelection.family ?? ""} disabled={!vehicleSelection.brand} onChange={(event) => selectFamily(event.target.value)}>
                <option value="" disabled>{vehicleSelection.brand ? "Select model / generation" : "Select make first"}</option>
                {familyOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select></label>
              <label>Trim / Variant<select value={vehicleSelection.variant ?? ""} disabled={!vehicleSelection.family} onChange={(event) => selectVariant(event.target.value)}>
                <option value="" disabled>{vehicleSelection.family ? "Select trim / variant" : "Select model first"}</option>
                {variantOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select></label>
              <label>Year<select value={vehicleSelection.year ?? ""} disabled={!selectedVariant} onChange={(event) => selectYear(Number(event.target.value))}>
                <option value="" disabled>{selectedVariant ? "Select year" : "Select trim first"}</option>
                {years.map((year) => <option value={year} key={year}>{year}</option>)}
              </select></label>
              <label>Engine<select value={configurationReady ? profile.engineCode : ""} disabled={!configurationReady || engineOptions.length === 1} onChange={(event) => setProfile((current) => ({ ...current, engineCode: event.target.value }))}>
                {!configurationReady && <option value="">Select model first</option>}
                {engineOptions.map((engine) => <option value={engine.value} key={engine.label}>{engine.label}</option>)}
              </select></label>
              <label>Drivetrain<select value={configurationReady ? profile.drivetrain : ""} disabled={!configurationReady} onChange={(event) => selectDrivetrain(event.target.value)}>
                {!configurationReady && <option value="">Select model first</option>}
                {drivetrains.map((value) => <option key={value}>{value}</option>)}
              </select></label>
              <label>Transmission<select value={configurationReady ? profile.transmission : ""} disabled={!configurationReady} onChange={(event) => selectTransmission(event.target.value)}>
                {!configurationReady && <option value="">Select model first</option>}
                {transmissions.map((value) => <option key={value}>{value}</option>)}
              </select></label>
            </div>
            {configurationReady && (engineOptions.length > 1 || profile.platform === "E36") && <div className="inference-note"><strong>{selectedEngineLabel} selected</strong><p>Keeper uses the year as a starting point. Confirm the VIN, production date, emissions label, engine stamp, and transmission tag before ordering parts or fluids.</p></div>}
            <div className="garage-save">
              <label>Garage name<input value={demoVehicleSelected ? DEMO_VEHICLE.nickname : demoMode ? "" : garage.nickname} onChange={(event) => garage.setNickname(event.target.value)} maxLength={60} placeholder={`My ${profile.brand}`} disabled={!auth.access.canSaveGarage} /></label>
              <label>Mileage<input value={demoVehicleSelected ? String(DEMO_VEHICLE.mileage) : demoMode ? "" : garage.mileage} onChange={(event) => garage.setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Optional" disabled={!auth.access.canSaveMileage} /></label>
              <button className="button button-primary" disabled={garage.loading || garage.saving} onClick={() => void saveGarage()}>{garage.saving ? "Saving…" : !auth.access.canSaveGarage ? auth.access.kind === "legacy" ? "Upgrade to save" : "Create Profile to save" : garage.vehicleId ? "Save changes" : "Add to garage"}</button>
            </div>
            {auth.access.kind === "account" && garage.vehicleId && <div className="garage-danger-zone"><div><span>Vehicle settings</span><p>Only remove a vehicle when you intend to permanently delete its Keeper records.</p></div><button className="button button-danger-outline" type="button" disabled={garage.loading || garage.saving || garage.removing} onClick={() => void openVehicleRemoval()}>Remove from Garage</button></div>}
            {(saveNotice || garage.error) && <p className={`save-status ${garage.error ? "error" : ""}`}>{garage.error ?? saveNotice}</p>}
            <div className={`session-note ${auth.access.kind}`}>
              <strong>{auth.access.label}</strong>
              <span>{auth.access.description}</span>
            </div>
            <a className="plan-launch" href={pageHref("maintenance")}><span>Next work order</span><strong>View {maintenance.length}-item maintenance list</strong><b>→</b></a>
          </aside>
        </section>

        <section className="garage-route-strip" aria-label="How Keeper works">
          <article><span>01</span><div><strong>Choose the exact car</strong><p>Generation, year, body, drivetrain, transmission, and engine.</p></div></article>
          <article><span>02</span><div><strong>Open maintenance</strong><p>Only the service rows that match the selected configuration.</p></div></article>
          <article><span>03</span><div><strong>Check known issues</strong><p>Urgent signals and researched patterns stay on their own page.</p></div></article>
        </section>

        {catalogOwnershipInsights.length > 0 && <section className="ownership-intelligence" aria-labelledby="ownership-intelligence-title">
          <header className="section-heading"><div><p className="eyebrow">Platform-specific research</p><h2 id="ownership-intelligence-title">Ownership intelligence.</h2></div><p>Configuration notes, factory changes, preservation checks, and enthusiast context that do not belong in a routine maintenance interval.</p></header>
          <div>{catalogOwnershipInsights.slice(0, 8).map((insight) => <article key={insight.slug}><span>{insight.category}</span><h3>{insight.title}</h3><p>{insight.summary}</p>{insight.sourceUrl && <a href={insight.sourceUrl} target="_blank" rel="noreferrer">Research source ↗</a>}</article>)}</div>
        </section>}
        </>}

        {(page === "maintenance" || page === "issues") && <>
        <section className="page-masthead">
          <div>
            <p className="eyebrow">{profileLabel}</p>
            <h1>{page === "maintenance" ? "Maintenance list." : "Known issues."}</h1>
            <p>{page === "maintenance" ? "Factory positions and conservative planning intervals, filtered to the car you configured." : "Urgent warning signs, recurring owner patterns, and supporting evidence kept separate from routine service."}</p>
          </div>
          <div className="page-masthead-actions"><a className="button button-quiet" href={pageHref("garage")}>Change vehicle</a><a className="button button-primary" href={pageHref(page === "maintenance" ? "issues" : "maintenance")}>{page === "maintenance" ? "Known issues" : "Maintenance list"}</a></div>
        </section>

        <section className="vehicle-band">
          <div><span>Selected profile</span><strong>{profileLabel}</strong></div>
          <div><span>Engine</span><strong>{selectedEngineLabel}</strong></div>
          <div><span>Drive</span><strong>{profile.drivetrain}</strong></div>
          <div><span>Matched research</span><strong>{matchedIssues.length} issue patterns · {maintenance.length} service items</strong></div>
        </section>
        </>}

        {page === "issues" && <>
        <section className="priorities-section" id="priorities">
          <header className="section-heading"><div><p className="eyebrow">Ordered by consequence</p><h2>Start here.</h2></div><p>Keeper does not claim that a known issue is present on your car. It tells you what deserves immediate attention, what to watch, and what can wait.</p></header>

          <div className="priority-lane urgent-lane">
            <div className="lane-label"><span>01</span><div><h3>Urgent</h3><p>Stop-driving symptoms and VIN-specific safety actions.</p></div></div>
            <div className="lane-items">
              {urgentIssues.map((issue) => <article className="priority-card" key={issue.slug}><EvidenceTag value={issue.evidence} /><div><h4>{issue.issue}</h4><p>{issue.preventativeAction}</p><small>Watch for: {issue.symptoms}</small></div>{issue.sources[0] && <a href={issue.sources[0].url} target="_blank" rel="noreferrer">Official source ↗</a>}</article>)}
              {emergencyChecks.map((item) => <article className="priority-card emergency-card" key={item.title}><span className="priority-kind">Any vehicle</span><div><h4>{item.title}</h4><p>{item.body}</p></div><span className="action-label">STOP / CHECK</span></article>)}
            </div>
          </div>

          <div className="priority-lane watch-lane">
            <div className="lane-label"><span>02</span><div><h3>Be on the lookout</h3><p>Recurring patterns matched to {profile.engineCode}, {profile.drivetrain}, and this transmission.</p></div><b>{watchIssues.length}</b></div>
            <div className="lane-items">
              {watchIssues.slice(0, watchExpanded ? undefined : 7).map((issue) => <article className="priority-card" key={issue.slug}><EvidenceTag value={issue.evidence} /><div><h4>{issue.issue}</h4><p>{issue.description}</p><small>Watch for: {issue.symptoms}</small></div>{issue.sources[0] && <a href={issue.sources[0].url} target="_blank" rel="noreferrer">Evidence ↗</a>}</article>)}
              {watchIssues.length > 7 && <button className="expand-button" onClick={() => setWatchExpanded((value) => !value)}>{watchExpanded ? "Show the short list" : `Show all ${watchIssues.length} matched patterns`}</button>}
            </div>
          </div>

          <div className="priority-lane fun-lane">
            <div className="lane-label"><span>03</span><div><h3>For fun</h3><p>Projects for after safety, leaks, fluids, tires, and service history are handled.</p></div></div>
            <div className="project-grid">{projects.map((project) => <article key={project.slug}><span>{project.payoff}</span><h4>{project.title}</h4><p>{project.description}</p></article>)}</div>
          </div>
        </section>
        </>}

        {page === "maintenance" &&
        <section className="maintenance-section" id="maintenance">
          <div className="maintenance-vehicle-toolbar">
            <label><span>Maintenance for</span><select aria-label="Maintenance vehicle" value={demoVehicleSelected ? "demo" : garage.vehicleId ?? "configured"} disabled={demoMode || garage.loading || garage.vehicles.length === 0} onChange={(event) => garage.selectVehicle(event.target.value)}>
              {demoVehicleSelected && <option value="demo">2014 BMW 328i · Demo Vehicle</option>}
              {demoMode && !demoVehicleSelected && <option value="configured">{profile.year} {profile.brand} {profile.trim} · Guest preview</option>}
              {!demoMode && !garage.vehicleId && <option value="configured">{profile.year} {profile.brand} {profile.trim} · not saved</option>}
              {garage.vehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.nickname} · {vehicle.model_year} {vehicle.brand} {vehicle.trim}</option>)}
            </select></label>
            <div><span>Vehicle mileage</span><strong>{currentVehicleMileage === null ? "Not entered" : `${currentVehicleMileage.toLocaleString()} mi`}</strong></div>
            <div><span>Completed records</span><strong>{serviceRecords.loading && !demoMode ? "Loading…" : displayRecords.length}</strong></div>
            <div className="maintenance-total-spent"><span>Total spent</span><strong>{serviceRecords.loading && !demoMode ? "Loading…" : formatUsdCents(totalSpentCents)}</strong></div>
            <MaintenanceExportMenu vehicle={selectedSavedVehicle} records={displayRecords} canExport={auth.access.canExport} canExportPdf={auth.access.canDownloadPdf} onRequireAccount={() => openAccount("export")} onRequireUpgrade={() => openUpgrade("pdf")} />
            {!auth.user && <button className="button button-primary" onClick={() => openAccount("save")}>Create Profile to use My Garage</button>}
            {auth.access.kind === "account" && !garage.vehicleId && <a className="button button-primary" href={pageHref("garage")}>Save this vehicle</a>}
          </div>
          {(serviceRecords.error || trackedMaintenance.error) && <p className="maintenance-record-error">{serviceRecords.error ?? trackedMaintenance.error}</p>}
          <header className="maintenance-overview">
            <div><p className="eyebrow">Maintenance overview</p><h2>Maintenance</h2><p>Simple at first glance. Detailed when you want it.</p></div>
            <dl><div><dt>Items tracked</dt><dd>{dashboardItems.length}</dd></div><div className="soon"><dt>Due soon</dt><dd>{dashboardItems.filter((item) => item.status.tone === "soon").length}</dd></div><div className="overdue"><dt>Overdue</dt><dd>{dashboardItems.filter((item) => item.status.tone === "overdue").length}</dd></div></dl>
          </header>

          <section className="maintenance-items-section" aria-labelledby="maintenance-items-title">
            <header><div><p className="eyebrow">What does this vehicle need?</p><h3 id="maintenance-items-title">Maintenance items</h3></div><p>Open an item to log work, review its plan, or see technical context.</p></header>
            <div className="maintenance-filters">
              <div role="group" aria-label="Maintenance status filter">{([['all', 'All'], ['soon', 'Due Soon'], ['overdue', 'Overdue'], ['fluids', 'Fluids'], ['no_schedule', 'No Schedule']] as const).map(([value, label]) => <button className={maintenanceFilter === value ? "active" : ""} type="button" aria-pressed={maintenanceFilter === value} onClick={() => setMaintenanceFilter(value)} key={value}>{label}</button>)}</div>
              <label><span>Category</span><select value={maintenanceCategory} onChange={(event) => setMaintenanceCategory(event.target.value)}><option value="all">All categories</option>{maintenanceCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
            </div>
            <div className="maintenance-dashboard simplified">
            {maintenanceSections.map((section) => {
              const groupedItems = visibleDashboardItems.filter((item) => section.tones.includes(item.status.tone));
              if (maintenanceFilter === "overdue" && section.key !== "overdue") return null;
              if (maintenanceFilter === "soon" && section.key !== "soon") return null;
              return <section className={`maintenance-status-section ${section.key}`} key={section.key} aria-labelledby={`maintenance-${section.key}`}>
                <header><div><span aria-hidden="true" /><strong id={`maintenance-${section.key}`}>{section.label}</strong><b>{groupedItems.length}</b></div><p>{section.description}</p></header>
                {groupedItems.map((item) => {
                  const latest = item.records[0];
                  return <details className={`maintenance-dashboard-item ${item.records.length ? "completed" : ""} ${item.kind}`} key={`${selectedSavedVehicle?.id ?? "configured"}:${item.slug}`}>
                    <summary><div className="maintenance-item-name"><strong>{item.name}</strong><small>{item.category}{item.tracksFluid ? " · Fluid tracking" : ""}</small></div><div data-label="Last completed"><strong>{latest ? `${latest.mileage.toLocaleString()} mi` : "Not recorded"}</strong><small>{latest ? shortServiceDate(latest.completed_at) : "No service history"}</small></div><div data-label="Plan"><strong>{maintenancePlanLabel(item.mileageInterval, item.timeIntervalMonths)}</strong><small>{item.planLabel}</small></div><div data-label="Next due"><strong>{nextDueLabel(item, latest)}</strong></div><div className={`maintenance-status-pill ${item.status.tone}`} data-label="Status"><span aria-hidden="true">●</span>{item.status.label}</div><b aria-hidden="true">＋</b></summary>
                    <div className="maintenance-record-drawer">
                      {(item.catalog || item.notes || item.issue) && <details className="maintenance-technical-notes"><summary>Technical notes and sources</summary>
                        {item.catalog && <>
                          <div className="maintenance-technical-grid">
                            <article><span>Factory position</span><p>{item.catalog.oem.summary}</p></article>
                            <article><span>Planning baseline</span><p>{item.catalog.community.summary}</p></article>
                            {item.catalog.diy.length > 0 && <article><span>Before service</span><ul>{item.catalog.diy.map((note) => <li key={note}>{note}</li>)}</ul></article>}
                          </div>
                          {item.catalog.research && <div className="maintenance-research-grid">
                            <article><span>Guidance type</span><strong>{item.catalog.research.entryType}</strong><p>{item.catalog.research.basis}</p></article>
                            <article><span>Recommended action</span><strong>{item.catalog.research.action || "Inspect by condition"}</strong><p>{item.catalog.research.trigger}</p></article>
                            {(item.catalog.research.fluidAmount || item.catalog.research.fluidSpecification) && <article><span>Fluid / specification</span><strong>{item.catalog.research.fluidAmount || "Verify service quantity"}</strong><p>{item.catalog.research.fluidSpecification}</p></article>}
                            <article><span>Evidence check</span><strong>{item.catalog.research.verification || "Verify exact configuration"}</strong><p>{item.catalog.research.notes}</p></article>
                          </div>}
                        </>}
                        {!item.catalog && <p>{item.notes ?? "Owner-added maintenance or repair."}</p>}
                        <footer>{(item.catalog?.sources ?? item.issue?.sources ?? []).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><b>{source.type}</b>{source.title} ↗</a>)}</footer>
                      </details>}
                      <MaintenanceRecordPanel item={item} records={item.records} tracksFluid={item.tracksFluid} signedIn={auth.access.canSaveMaintenance} isGuest={!auth.access.canSaveMaintenance} hasSavedVehicle={Boolean(garage.vehicleId && auth.access.canSaveMaintenance)} defaultMileage={demoMode ? String(DEMO_VEHICLE.mileage) : garage.mileage} draftScope={formDraftScope} saving={serviceRecords.savingSlug === item.slug} onOpenAuth={() => openAccount("save")} onAdd={(input) => serviceRecords.addRecord(item.slug, item.name, input)} />
                      {item.kind !== "baseline" && <div className="tracked-item-removal"><div><strong>Active-plan controls</strong><p>Removal hides this tracked item from the plan. Any completed service records remain in your account.</p></div><RemoveTrackedItemButton removing={trackedMaintenance.removingSlug === item.slug} onRemove={() => auth.access.canCustomize ? trackedMaintenance.removeItem(item.slug) : (openAccount("save"), Promise.resolve(false))} /></div>}
                    </div>
                  </details>;
                })}
                {!groupedItems.length && <p className="maintenance-status-empty">Nothing in this section right now.</p>}
              </section>;
            })}
            {!visibleDashboardItems.length && <p className="maintenance-empty-state">No maintenance items match these filters.</p>}
            </div>
            <CustomMaintenanceForm key={formDraftScope ?? "no-vehicle-draft"} enabled={Boolean(auth.access.canCustomize && garage.vehicleId)} saving={trackedMaintenance.saving} draftScope={formDraftScope} onRequireVehicle={() => { if (!auth.access.canCustomize) openAccount("save"); else window.location.assign(pageHref("garage")); }} onAdd={trackedMaintenance.addCustomItem} />
          </section>

          <details className="fluid-summary-section" open={currentFluids.length > 0}>
            <summary><div><p className="eyebrow">Quick reference</p><h3>Current fluids</h3></div><span>{currentFluids.length ? `${currentFluids.length} products remembered` : "No products logged"}</span></summary>
            <div>{currentFluids.length ? currentFluids.map(({ item, record, label }) => <article key={item.slug}><span>{item.name}</span><strong>{label}</strong><small>Last used {shortServiceDate(record.completed_at)}</small></article>) : <p>Log a fluid service and its product will appear here for the selected vehicle.</p>}</div>
          </details>

          <section className="maintenance-history-section" id="maintenance-history" aria-labelledby="maintenance-history-title">
            <header><div><p className="eyebrow">What has been recorded?</p><h3 id="maintenance-history-title">Maintenance history</h3></div><strong>{displayRecords.length} completed record{displayRecords.length === 1 ? "" : "s"}</strong></header>
            {demoMode && <p className="demo-history-note"><strong>Demo history</strong> These sample records demonstrate Keeper. They are not verified service records for a real vehicle.</p>}
            {displayRecords.length ? <div className="maintenance-history-list">{displayRecords.slice(0, historyExpanded ? undefined : 5).map((record) => <details key={record.id}><summary><div><strong>{record.maintenance_name}</strong><span>{shortServiceDate(record.completed_at)} · {record.mileage.toLocaleString()} mi</span></div><small>{record.cost_cents === null ? "Cost not entered" : formatUsdCents(record.cost_cents)}{maintenanceRecordFluid(record) ? ` · ${maintenanceRecordFluid(record)}` : ""}</small><b aria-hidden="true">＋</b></summary><div><p><strong>Work completed</strong>{record.work_performed}</p><p><strong>Cost</strong>{record.cost_cents === null ? "Not entered" : formatUsdCents(record.cost_cents)}</p>{record.notes && <p><strong>Notes</strong>{record.notes}</p>}{maintenanceRecordFluid(record) && <p><strong>Fluid / product</strong>{maintenanceRecordFluid(record)}{record.fluid_specification ? ` · ${record.fluid_specification}` : ""}{record.filter_product ? ` · Filter: ${record.filter_product}` : ""}</p>}{auth.access.canSaveMaintenance && <button type="button" onClick={() => void serviceRecords.deleteRecord(record.id)}>Remove record</button>}</div></details>)}</div> : <p className="maintenance-empty-state">No completed maintenance has been logged for this vehicle yet.</p>}
            {displayRecords.length > 5 && <button className="button button-quiet maintenance-history-toggle" type="button" onClick={() => setHistoryExpanded((value) => !value)}>{historyExpanded ? "Show recent only" : "View full history"}</button>}
          </section>
        </section>}

        {page === "issues" && <>
        <section className="library-section" id="library">
          <header className="section-heading"><div><p className="eyebrow">Stored research · {KNOWN_ISSUES.length} patterns</p><h2>{displayFamily.label} issue library.</h2></div><p>Coverage follows the selected generation and its U.S.-market engine and transmission combinations. Each record keeps fitment, evidence type, symptoms, and next action visible.</p></header>
          <div className="library-toolbar">
            <label className="search-field"><span>⌕</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search a part, symptom, issue, or common name…" aria-label="Search Known Issues" /></label>
            <label><span>Fitment view</span><select value={libraryView} disabled={Boolean(libraryQuery.trim())} onChange={(event) => setLibraryView(event.target.value)}><option value="mine">My selected car</option>{ppiIssuesAvailable && <option value="ppi">PPI checklist</option>}<option value="all">All {profile.platform} research</option>{libraryTrimOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <strong>{libraryIssues.length} shown</strong>
          </div>
          <div className="known-issue-search-context"><span>{libraryView === "ppi" ? "Pre-purchase inspection for" : "Searching for"}</span><strong>{profileLabel} · {selectedEngineLabel} · {profile.drivetrain}</strong><p>{libraryQuery.trim() ? "Search results are limited to records that match this exact vehicle configuration." : libraryView === "ppi" ? "Showing the PPI-tagged checks that match this exact configuration." : "Choose a broader fitment view to browse the full generation library."}</p></div>
          {libraryQuery.trim() && <div className={`issue-search-status ${issueSearchResults[0]?.matchLabel === "High match" ? "exact" : "closest"}`}><strong>{issueSearchResults[0]?.matchLabel === "High match" ? "Best matches" : "No exact match found"}</strong><p>{issueSearchResults.length ? issueSearchResults[0]?.matchLabel === "High match" ? "Ranked by terminology, symptoms, components, common names, and vehicle fitment." : "Here are the closest matches for your selected vehicle. Review the details, or add your own issue below." : "No strong library match was found for this vehicle. You can still add it as a custom issue below."}</p></div>}
          <div className="issue-library-list">
            {libraryIssues.map((issue) => {
              const matched = matchesApplicability(profile, issue.appliesTo);
              const appliesTo = [
                ...(issue.appliesTo.years ?? []).map(String),
                ...(issue.appliesTo.trims ?? []),
                ...(issue.appliesTo.engines ?? []),
                ...(issue.appliesTo.drivetrains ?? []),
                ...(issue.appliesTo.transmissions ?? []),
                ...(issue.configuration ? [issue.configuration] : []),
              ];
              const addedToMaintenance = trackedMaintenance.itemSlugs.has(`issue-${issue.slug}`);
              const searchMatch = issueSearchBySlug.get(issue.slug);
              return <details className={matched ? "matched" : ""} key={issue.slug}>
                <summary><span className="issue-system">{issue.system}</span><div><h3>{issue.issue}</h3><p>{issue.description}</p></div><EvidenceTag value={issue.evidence} /><b className={searchMatch ? "issue-match-badge" : ""}>{searchMatch?.matchLabel ?? (matched ? "MATCH" : "LIBRARY")}</b></summary>
                {searchMatch && <div className="issue-match-explanation"><span>Why this matched</span><p>{searchMatch.reason}</p>{issue.aliases?.length ? <small>Also known as: {issue.aliases.slice(0, 5).join(" · ")}</small> : null}</div>}
                <div className="issue-detail-grid"><article><span>Watch for</span><p>{issue.symptoms}</p></article><article><span>Context</span><p>{issue.typicalMileage}</p></article><article><span>What to do</span><p>{issue.preventativeAction}</p></article><article><span>Applies to</span><p>{appliesTo.length ? appliesTo.join(" · ") : `All ${profile.platform} variants`}</p></article></div>
                {(issue.evidenceLabel || issue.inspectionReminder || issue.verification || issue.clarification) && <div className="issue-intelligence-grid">
                  {issue.evidenceLabel && <article><span>Evidence layer</span><p>{issue.evidenceLabel}</p></article>}
                  {issue.inspectionReminder && <article><span>Inspection / reminder</span><p>{issue.inspectionReminder}</p></article>}
                  {issue.verification && <article><span>Verification</span><p>{issue.verification}</p></article>}
                  {issue.clarification && <article><span>Important clarification</span><p>{issue.clarification}</p></article>}
                </div>}
                <footer>{issue.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</footer>
                <TrackedIssueAction matched={matched} added={addedToMaintenance} saving={trackedMaintenance.saving} removing={trackedMaintenance.removingSlug === `issue-${issue.slug}`} onAdd={() => addIssueToMaintenance(issue)} onRemove={() => auth.access.canCustomize ? trackedMaintenance.removeItem(`issue-${issue.slug}`) : (openAccount("save"), Promise.resolve(false))} />
              </details>;
            })}
          </div>
          {libraryQuery.trim() && <CustomIssueForm key={formDraftScope ?? "no-vehicle-draft"} query={libraryQuery} enabled={Boolean(auth.access.canCustomize && garage.vehicleId)} saving={trackedMaintenance.saving} defaultMileage={garage.mileage} draftScope={formDraftScope} onRequireVehicle={requireSavedVehicle} onAdd={trackedMaintenance.addCustomIssue} />}
          {trackedMaintenance.error && <p className="maintenance-record-error">{trackedMaintenance.error}</p>}
        </section>

        <section className="sources-section" id="sources">
          <p className="eyebrow">Evidence policy</p>
          <h2>Useful, without pretending every forum post is a fact.</h2>
          <div className="evidence-grid"><article><span>01</span><h3>Manufacturer / official</h3><p>Maintenance schedules, recalls, and service bulletins define factory positions, affected production, and VIN-specific actions.</p></article><article><span>02</span><h3>Community consensus</h3><p>Repeated patterns from marque specialists, platform forums, and technical videos become watch items—not automatic diagnoses.</p></article><article><span>03</span><h3>Individual experience</h3><p>Isolated owner reports help discover symptoms, but remain visibly labeled and carry the lowest confidence.</p></article></div>
        </section>
        </>}

        {page === "profile" && <ProfilePage auth={auth} vehicleCount={garage.vehicles.length} promotions={promotions} onOpenAccount={openAccount} onUpgrade={() => openUpgrade("profile")} />}
        {page === "payment-success" && <PaymentResultPage kind="success" auth={auth} />}
        {page === "payment-cancelled" && <PaymentResultPage kind="cancelled" auth={auth} />}
        {(page === "terms" || page === "privacy" || page === "contact") && <LegalPage page={page} onOpenAccount={() => openAccount("account")} />}
      </main>

      <SiteFooter />
      {vehicleRemovalTarget && <VehicleRemovalDialog vehicle={vehicleRemovalTarget} summary={vehicleRemovalSummary} loading={vehicleRemovalLoading} removing={garage.removing} onCancel={closeVehicleRemoval} onConfirm={confirmVehicleRemoval} />}
      <KeeperUpgradeDialog open={upgradePrompt !== null} context={upgradePrompt ?? "profile"} planCode={auth.access.keeper.planCode} busy={upgradeCheckoutBusy} message={upgradeCheckoutMessage} onClose={() => setUpgradePrompt(null)} onCheckout={(productCode) => void beginUpgradeCheckout(productCode)} />
      <AuthPanel key={`${authOpen}-${authIntent}-${auth.user?.id ?? "guest"}`} auth={auth} open={authOpen} intent={authIntent} onClose={closeAuth} />
    </div>
  );
}
