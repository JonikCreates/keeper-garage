import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BRAND_OPTIONS,
  KNOWN_ISSUES,
  PLATFORM_OPTIONS,
  PROJECT_IDEAS,
  getEngineOptions,
  getMaintenanceCatalog,
  getPlatform,
  getTransmissionOptions,
  getTrimOptions,
  getYearOptions,
  inferEngine,
  matchesApplicability,
  type KnownIssue,
  type VehicleProfile,
} from "../lib/catalog";
import { AuthPanel } from "./AuthPanel";
import { useGarage } from "./useGarage";
import { useKeeperAuth } from "./useKeeperAuth";

type LibraryView = "mine" | "all" | string;
type Theme = "dark" | "light";
type AppPage = "garage" | "maintenance" | "issues";

const pageLinks: Array<{ page: AppPage; label: string }> = [
  { page: "garage", label: "My garage" },
  { page: "maintenance", label: "Maintenance" },
  { page: "issues", label: "Known issues" },
];

function getPageFromHash(): AppPage {
  const hash = window.location.hash.replace("#", "");
  return pageLinks.some((link) => link.page === hash) ? hash as AppPage : "garage";
}

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

function KeeperMark() {
  return <span className="keeper-mark" aria-hidden="true"><i /><i /><i /></span>;
}

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
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} aria-pressed={theme === "light"}>
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

function resolveProfile(platform: VehicleProfile["platform"], year: number, trim: string | undefined, current?: VehicleProfile): VehicleProfile {
  const options = getTrimOptions(platform, year);
  const selected = options.find((option) => option.value === trim) ?? options[0];
  const drivetrains = [...selected.drivetrains] as string[];
  const drivetrain = drivetrains.includes(current?.drivetrain ?? "") ? current!.drivetrain : drivetrains[0];
  const transmissions = getTransmissionOptions(platform, selected.value, drivetrain, year);
  const transmission = transmissions.includes(current?.transmission ?? "") ? current!.transmission : transmissions[0];
  return {
    platform,
    year,
    trim: selected.value,
    drivetrain,
    transmission,
    engineCode: inferEngine(platform, selected.value, year, transmission, current?.engineCode),
  };
}

export default function App() {
  const [profile, setProfile] = useState<VehicleProfile>({
    platform: "F30",
    year: 2016,
    trim: "328i",
    engineCode: "N26",
    drivetrain: "RWD",
    transmission: "8-speed automatic",
  });
  const [libraryView, setLibraryView] = useState<LibraryView>("mine");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [watchExpanded, setWatchExpanded] = useState(false);
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(() => new URLSearchParams(window.location.search).has("account"));
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  // REVIEW DECISION: hash routes keep each view directly addressable without creating GitHub Pages 404s or adding a routing dependency.
  const [page, setPage] = useState<AppPage>(getPageFromHash);
  // REVIEW DECISION: new visitors start in light mode, while a deliberate theme choice remains local to that browser.
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("keeper-theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#121416" : "#0d2b46");
    localStorage.setItem("keeper-theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncPage = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  useEffect(() => {
    document.title = page === "garage"
      ? "Keeper — My Garage"
      : page === "maintenance"
        ? `Keeper — ${profile.year} ${profile.trim} Maintenance`
        : `Keeper — ${profile.year} ${profile.trim} Known Issues`;
  }, [page, profile.trim, profile.year]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const auth = useKeeperAuth();
  const loadVehicle = useCallback((vehicle: VehicleProfile) => {
    setProfile(vehicle);
    setLibraryView("mine");
    setWatchExpanded(false);
    setMaintenanceExpanded(false);
  }, []);
  const garage = useGarage(auth.user, loadVehicle);

  const platform = getPlatform(profile.platform);
  const years = getYearOptions(profile.platform);
  const trimOptions = getTrimOptions(profile.platform, profile.year);
  const libraryTrimOptions = getTrimOptions(profile.platform);
  const selectedTrim = trimOptions.find((option) => option.value === profile.trim) ?? trimOptions[0];
  const drivetrains = [...selectedTrim.drivetrains] as string[];
  const transmissions = getTransmissionOptions(profile.platform, profile.trim, profile.drivetrain, profile.year);
  const engines = getEngineOptions(profile.platform, profile.trim, profile.year, profile.transmission);

  const maintenance = useMemo(() => getMaintenanceCatalog(profile), [profile]);
  const matchedIssues = useMemo(
    () => KNOWN_ISSUES.filter((issue) => matchesApplicability(profile, issue.appliesTo)),
    [profile],
  );
  const urgentIssues = matchedIssues.filter((issue) => issue.urgency === "urgent");
  const watchIssues = matchedIssues.filter((issue) => issue.urgency === "watch");
  const projects = PROJECT_IDEAS.filter((project) => matchesApplicability(profile, project.appliesTo));

  const libraryIssues = useMemo(() => KNOWN_ISSUES.filter((issue) => {
    const query = libraryQuery.trim().toLowerCase();
    const textMatches = !query || `${issue.issue} ${issue.system} ${issue.description} ${issue.symptoms}`.toLowerCase().includes(query);
    const platformMatches = (issue.appliesTo.platforms ?? ["F30"]).includes(profile.platform);
    if (!textMatches || libraryView === "all") return textMatches && platformMatches;
    if (libraryView === "mine") return textMatches && matchesApplicability(profile, issue.appliesTo);
    return textMatches && issueMatchesTrim(issue, profile.platform, libraryView);
  }), [libraryQuery, libraryView, profile]);

  function resetGenerationView() {
    setLibraryView("mine");
    setWatchExpanded(false);
    setMaintenanceExpanded(false);
  }

  function selectPlatform(nextPlatform: VehicleProfile["platform"]) {
    resetGenerationView();
    const year = getPlatform(nextPlatform).yearEnd;
    setProfile((current) => resolveProfile(nextPlatform, year, current.trim, current));
  }

  function selectTrim(trim: string) {
    setProfile((current) => resolveProfile(current.platform, current.year, trim, current));
  }

  function selectYear(year: number) {
    setProfile((current) => resolveProfile(current.platform, year, current.trim, current));
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
      setAuthOpen(true);
      return;
    }
    const editing = Boolean(garage.vehicleId);
    const saved = await garage.saveVehicle(profile);
    setSaveNotice(saved ? editing ? "Vehicle changes saved." : "Vehicle added to My Garage." : null);
  }

  function closeAuth() {
    setAuthOpen(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("account")) {
      url.searchParams.delete("account");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  const accountLabel = !auth.ready
    ? "Checking…"
    : auth.isGuest
      ? "Guest garage"
      : auth.user
        ? "Member account"
        : "Log in";

  return (
    <div className="site-shell">
      <section className="forum-banner" aria-label="Keeper workshop network">
        <div><span>Keeper workshop network</span><strong>Owner-built maintenance archive</strong></div>
        <p><span>Service schedules</span><i /><span>Known issues</span><i /><span>Garage records</span></p>
      </section>
      <header className="topbar">
        <a className="brand-lockup" href="#garage"><KeeperMark /><span>KEEPER</span><small>Owner&apos;s workshop log</small></a>
        <nav aria-label="Primary navigation">{pageLinks.map((link) => <a className={page === link.page ? "active" : ""} aria-current={page === link.page ? "page" : undefined} href={`#${link.page}`} key={link.page}>{link.label}</a>)}</nav>
        <div className="topbar-actions"><ThemeToggle theme={theme} onToggle={() => setTheme((value) => value === "dark" ? "light" : "dark")} /><a className="github-link" href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">GitHub ↗</a><button className={`account-button ${auth.user ? "active" : ""} ${auth.access.kind}`} onClick={() => { auth.clearStatus(); setAuthOpen(true); }}>{accountLabel}</button></div>
      </header>

      <main id="top">
        {page === "garage" && <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">BMW archive · E36 / E39 / E46 / F30</p>
            <h1>Know what your car needs next.</h1>
            <p className="hero-intro">Factory information, researched owner patterns, and specialist maintenance guidance—filtered for the exact generation, year, engine, drivetrain, and transmission.</p>
            <div className="hero-actions"><a href="#maintenance" className="button button-primary">Open maintenance list</a><a href="#issues" className="button button-quiet">Browse all {KNOWN_ISSUES.length} issues</a></div>
          </div>
          <aside className="configuration-panel" aria-labelledby="config-title">
            <div className="configuration-heading"><span>Configure this visit</span><strong id="config-title">Your exact BMW</strong></div>
            <div className="garage-picker">
              <div className="garage-picker-copy"><span>My garage</span><strong>{!auth.user ? "Sign in to save vehicles" : garage.loading ? "Loading saved vehicles…" : garage.vehicles.length ? `${garage.vehicles.length} saved vehicle${garage.vehicles.length === 1 ? "" : "s"}` : "No saved vehicles yet"}</strong></div>
              {auth.user ? <>
                <label><span>Saved vehicles</span><select aria-label="Saved vehicles" value={garage.vehicleId ?? "new"} disabled={garage.loading || garage.saving} onChange={(event) => { setSaveNotice(null); if (event.target.value === "new") garage.startNewVehicle(); else garage.selectVehicle(event.target.value); }}>
                  {garage.vehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.nickname} · {vehicle.model_year} {vehicle.trim}</option>)}
                  <option value="new">＋ Add another vehicle</option>
                </select></label>
                <p>{garage.vehicleId ? `Editing ${garage.nickname}. Changes update this saved vehicle.` : "Creating a new garage entry. Your other vehicles will not be changed."}</p>
              </> : <button className="button button-quiet garage-login" onClick={() => { auth.clearStatus(); setAuthOpen(true); }}>Log in to open My Garage</button>}
            </div>
            <p className="configuration-flow">Choose in order. Each selection narrows the choices that follow.</p>
            <div className="config-grid">
              <label>Brand<select value={BRAND_OPTIONS[0].value} onChange={() => undefined}>{BRAND_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label>Model<select value={profile.platform} onChange={(event) => selectPlatform(event.target.value as VehicleProfile["platform"])}>{PLATFORM_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label>Year<select value={profile.year} onChange={(event) => selectYear(Number(event.target.value))}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
              <label>Type<select value={profile.trim} onChange={(event) => selectTrim(event.target.value)}>{trimOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label>Drivetrain<select value={profile.drivetrain} onChange={(event) => selectDrivetrain(event.target.value)}>{drivetrains.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Transmission<select value={profile.transmission} onChange={(event) => selectTransmission(event.target.value)}>{transmissions.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Engine<select value={profile.engineCode} disabled={engines.length === 1} onChange={(event) => setProfile((current) => ({ ...current, engineCode: event.target.value }))}>{engines.map((engine) => <option value={engine} key={engine}>{engineLabels[engine] ?? engine}</option>)}</select></label>
            </div>
            {(engines.length > 1 || profile.platform === "E36") && <div className="inference-note"><strong>{engineLabels[profile.engineCode] ?? profile.engineCode} selected</strong><p>Keeper uses the year as a starting point. Confirm the VIN, production date, emissions label, engine stamp, and transmission tag before ordering parts or fluids.</p></div>}
            <div className="garage-save">
              <label>Garage name<input value={garage.nickname} onChange={(event) => garage.setNickname(event.target.value)} maxLength={60} placeholder="My BMW" /></label>
              <label>Mileage<input value={garage.mileage} onChange={(event) => garage.setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Optional" /></label>
              <button className="button button-primary" disabled={garage.loading || garage.saving} onClick={() => void saveGarage()}>{garage.saving ? "Saving…" : !auth.user ? "Sign in to save" : garage.vehicleId ? "Save changes" : "Add to garage"}</button>
            </div>
            {(saveNotice || garage.error) && <p className={`save-status ${garage.error ? "error" : ""}`}>{garage.error ?? saveNotice}</p>}
            <div className={`session-note ${auth.access.kind}`}>
              <strong>{auth.access.label}</strong>
              <span>{auth.access.description}</span>
            </div>
            <a className="plan-launch" href="#maintenance"><span>Next work order</span><strong>View {maintenance.length}-item maintenance list</strong><b>→</b></a>
          </aside>
        </section>

        <section className="garage-route-strip" aria-label="How Keeper works">
          <article><span>01</span><div><strong>Choose the exact car</strong><p>Generation, year, body, drivetrain, transmission, and engine.</p></div></article>
          <article><span>02</span><div><strong>Open maintenance</strong><p>Only the service rows that match the selected configuration.</p></div></article>
          <article><span>03</span><div><strong>Check known issues</strong><p>Urgent signals and researched patterns stay on their own page.</p></div></article>
        </section>
        </>}

        {page !== "garage" && <>
        <section className="page-masthead">
          <div>
            <p className="eyebrow">{profile.year} BMW {profile.trim} · {profile.platform}</p>
            <h1>{page === "maintenance" ? "Maintenance list." : "Known issues."}</h1>
            <p>{page === "maintenance" ? "Factory positions and conservative planning intervals, filtered to the car you configured." : "Urgent warning signs, recurring owner patterns, and supporting evidence kept separate from routine service."}</p>
          </div>
          <div className="page-masthead-actions"><a className="button button-quiet" href="#garage">Change vehicle</a><a className="button button-primary" href={page === "maintenance" ? "#issues" : "#maintenance"}>{page === "maintenance" ? "Known issues" : "Maintenance list"}</a></div>
        </section>

        <section className="vehicle-band">
          <div><span>Selected profile</span><strong>{profile.year} BMW {profile.trim} · {profile.platform}</strong></div>
          <div><span>Engine</span><strong>{engineLabels[profile.engineCode]}</strong></div>
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
              {emergencyChecks.map((item) => <article className="priority-card emergency-card" key={item.title}><span className="priority-kind">Any BMW</span><div><h4>{item.title}</h4><p>{item.body}</p></div><span className="action-label">STOP / CHECK</span></article>)}
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
          <header className="section-heading"><div><p className="eyebrow">No account required</p><h2>Maintenance baseline.</h2></div><p>Factory documentation stays separate from the conservative planning layer. E36 preserves 25 workbook categories; E39 and E46 add engine, body, drivetrain, and transmission-specific rows. Exact manuals, VIN data, production dates, and component labels remain controlling.</p></header>
          <div className="maintenance-list">
            {maintenance.slice(0, maintenanceExpanded ? undefined : 8).map((item) => <details key={item.slug}>
              <summary><span className={`severity-dot ${item.severity}`} /><div><h3>{item.name}</h3><p>{item.category} · {item.description}</p></div><div><span className="source-tag oem">DOCUMENTED</span><strong>{item.oem.label}</strong></div><div><span className="source-tag community">PLAN</span><strong>{item.community.label}</strong></div><b>＋</b></summary>
              <div className="maintenance-detail"><article><span>Factory position</span><p>{item.oem.summary}</p></article><article><span>Planning baseline</span><p>{item.community.summary}</p></article><article><span>Before service</span><ul>{item.diy.map((note) => <li key={note}>{note}</li>)}</ul></article><footer>{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><b>{source.type}</b>{source.title} ↗</a>)}</footer></div>
            </details>)}
            {maintenance.length > 8 && <button className="expand-button" onClick={() => setMaintenanceExpanded((value) => !value)}>{maintenanceExpanded ? "Show the short list" : `Show all ${maintenance.length} service items`}</button>}
          </div>
        </section>}

        {page === "issues" && <>
        <section className="library-section" id="library">
          <header className="section-heading"><div><p className="eyebrow">Stored research · {KNOWN_ISSUES.length} patterns</p><h2>{platform.label} issue library.</h2></div><p>Coverage follows the selected generation and its U.S.-market engine and transmission combinations. Each record keeps fitment, evidence type, symptoms, and next action visible.</p></header>
          <div className="library-toolbar">
            <label className="search-field"><span>⌕</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search symptoms, systems, or issues" aria-label="Search the issue library" /></label>
            <label><span>Fitment view</span><select value={libraryView} onChange={(event) => setLibraryView(event.target.value)}><option value="mine">My selected car</option><option value="all">All {profile.platform} research</option>{libraryTrimOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <strong>{libraryIssues.length} shown</strong>
          </div>
          <div className="issue-library-list">
            {libraryIssues.map((issue) => {
              const matched = matchesApplicability(profile, issue.appliesTo);
              const appliesTo = [
                ...(issue.appliesTo.years ?? []).map(String),
                ...(issue.appliesTo.trims ?? []),
                ...(issue.appliesTo.engines ?? []),
                ...(issue.appliesTo.drivetrains ?? []),
                ...(issue.appliesTo.transmissions ?? []),
              ];
              return <details className={matched ? "matched" : ""} key={issue.slug}>
                <summary><span className="issue-system">{issue.system}</span><div><h3>{issue.issue}</h3><p>{issue.description}</p></div><EvidenceTag value={issue.evidence} /><b>{matched ? "MATCH" : "LIBRARY"}</b></summary>
                <div className="issue-detail-grid"><article><span>Watch for</span><p>{issue.symptoms}</p></article><article><span>Context</span><p>{issue.typicalMileage}</p></article><article><span>What to do</span><p>{issue.preventativeAction}</p></article><article><span>Applies to</span><p>{appliesTo.length ? appliesTo.join(" · ") : `All ${profile.platform} variants`}</p></article></div>
                <footer>{issue.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</footer>
              </details>;
            })}
          </div>
        </section>

        <section className="sources-section" id="sources">
          <p className="eyebrow">Evidence policy</p>
          <h2>Useful, without pretending every forum post is a fact.</h2>
          <div className="evidence-grid"><article><span>01</span><h3>BMW / official</h3><p>Maintenance schedules, recalls, and service bulletins define factory positions, affected production, and VIN-specific actions.</p></article><article><span>02</span><h3>Community consensus</h3><p>Repeated patterns from BMW specialists, platform forums, and technical videos become watch items—not automatic diagnoses.</p></article><article><span>03</span><h3>Individual experience</h3><p>StartMyCar and isolated owner reports help discover symptoms, but remain visibly labeled and carry the lowest confidence.</p></article></div>
        </section>
        </>}
      </main>

      <footer className="site-footer"><div><KeeperMark /><strong>KEEPER</strong></div><p>Independent vehicle ownership research, beginning with BMW E36, E39, E46, and F30. Not affiliated with or endorsed by BMW.</p><p>This site cannot inspect or diagnose a vehicle. Verify recalls, parts, fluids, capacities, and procedures against current VIN-specific information.</p><a href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">View source on GitHub ↗</a></footer>
      <AuthPanel auth={auth} open={authOpen} onClose={closeAuth} />
    </div>
  );
}
