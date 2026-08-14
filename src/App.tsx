import { useCallback, useMemo, useState } from "react";
import {
  KNOWN_ISSUES,
  PLATFORM_OPTIONS,
  PROJECT_IDEAS,
  getEngineOptions,
  getMaintenanceCatalog,
  getPlatform,
  getTransmissionOptions,
  getTrimOptions,
  inferEngine,
  matchesApplicability,
  type KnownIssue,
  type VehicleProfile,
} from "../lib/catalog";
import { AuthPanel } from "./AuthPanel";
import { useGarage } from "./useGarage";
import { useKeeperAuth } from "./useKeeperAuth";

type LibraryView = "mine" | "all" | string;

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
  N47T: "N47T 2.0L diesel",
  "B48-PHEV": "B48 2.0L · plug-in hybrid",
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
};

function KeeperMark() {
  return <span className="keeper-mark" aria-hidden="true"><i /><i /><i /></span>;
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

  const auth = useKeeperAuth();
  const loadVehicle = useCallback((vehicle: VehicleProfile) => {
    setProfile(vehicle);
    setLibraryView("mine");
    setWatchExpanded(false);
    setMaintenanceExpanded(false);
  }, []);
  const garage = useGarage(auth.user, loadVehicle);

  const platform = getPlatform(profile.platform);
  const trimOptions = getTrimOptions(profile.platform);
  const selectedTrim = trimOptions.find((option) => option.value === profile.trim) ?? trimOptions[0];
  const years = Array.from({ length: selectedTrim.yearEnd - selectedTrim.yearStart + 1 }, (_, index) => selectedTrim.yearEnd - index);
  const drivetrains = [...selectedTrim.drivetrains] as string[];
  const transmissions = getTransmissionOptions(profile.platform, profile.trim, profile.drivetrain);
  const engines = getEngineOptions(profile.platform, profile.trim, profile.year);

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
    if (nextPlatform === "E36") {
      setProfile({ platform: "E36", year: 1997, trim: "328i", engineCode: "M52B28", drivetrain: "RWD", transmission: "5-speed manual" });
      return;
    }
    setProfile({ platform: "F30", year: 2016, trim: "328i", engineCode: "N26", drivetrain: "RWD", transmission: "8-speed automatic" });
  }

  function selectTrim(trim: string) {
    const option = trimOptions.find((candidate) => candidate.value === trim);
    if (!option) return;
    const nextDrivetrains = option.drivetrains as readonly string[];
    const drivetrain = nextDrivetrains.includes(profile.drivetrain) ? profile.drivetrain : option.drivetrains[0];
    const nextTransmissions = getTransmissionOptions(profile.platform, trim, drivetrain);
    const transmission = nextTransmissions.includes(profile.transmission) ? profile.transmission : nextTransmissions[0];
    const year = profile.year >= option.yearStart && profile.year <= option.yearEnd ? profile.year : option.yearEnd;
    setProfile((current) => ({ ...current, trim, year, transmission, drivetrain, engineCode: inferEngine(current.platform, trim, year) }));
  }

  function selectYear(year: number) {
    setProfile((current) => ({
      ...current,
      year,
      engineCode: inferEngine(current.platform, current.trim, year),
    }));
  }

  function selectDrivetrain(drivetrain: string) {
    setProfile((current) => {
      const nextTransmissions = getTransmissionOptions(current.platform, current.trim, drivetrain);
      const transmission = nextTransmissions.includes(current.transmission) ? current.transmission : nextTransmissions[0];
      return { ...current, drivetrain, transmission };
    });
  }

  async function saveGarage() {
    setSaveNotice(null);
    if (!auth.user) {
      setAuthOpen(true);
      return;
    }
    const saved = await garage.saveVehicle(profile);
    setSaveNotice(saved ? "Garage saved." : null);
  }

  const accountLabel = !auth.ready
    ? "Checking…"
    : auth.isGuest
      ? "Guest garage"
      : auth.user?.email ?? "Log in";

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#top"><KeeperMark /><span>KEEPER</span><small>BMW ownership intelligence</small></a>
        <nav aria-label="Primary navigation"><a href="#priorities">Priorities</a><a href="#maintenance">Maintenance</a><a href="#library">Issue library</a><a href="#sources">Sources</a></nav>
        <div className="topbar-actions"><a className="github-link" href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">GitHub ↗</a><button className={`account-button ${auth.user ? "active" : ""}`} onClick={() => { auth.clearStatus(); setAuthOpen(true); }}>{accountLabel}</button></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">BMW 3 Series · E36 + F30</p>
            <h1>Know what your car needs next.</h1>
            <p className="hero-intro">Factory information, researched owner patterns, and specialist maintenance guidance—filtered for the exact generation, year, engine, drivetrain, and transmission.</p>
            <div className="hero-actions"><a href="#priorities" className="button button-primary">See my priorities</a><a href="#library" className="button button-quiet">Browse all {KNOWN_ISSUES.length} issues</a></div>
          </div>
          <aside className="configuration-panel" aria-labelledby="config-title">
            <div className="configuration-heading"><span>Configure this visit</span><strong id="config-title">Your exact BMW</strong></div>
            <div className="config-grid">
              <label>Brand<select disabled><option>BMW</option></select></label>
              <label>Model<select value={profile.platform} onChange={(event) => selectPlatform(event.target.value as VehicleProfile["platform"])}>{PLATFORM_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label>Year<select value={profile.year} onChange={(event) => selectYear(Number(event.target.value))}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
              <label>Specific model<select value={profile.trim} onChange={(event) => selectTrim(event.target.value)}>{trimOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <label>Drivetrain<select value={profile.drivetrain} onChange={(event) => selectDrivetrain(event.target.value)}>{drivetrains.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Transmission<select value={profile.transmission} onChange={(event) => setProfile((current) => ({ ...current, transmission: event.target.value }))}>{transmissions.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Engine<select value={profile.engineCode} disabled={engines.length === 1} onChange={(event) => setProfile((current) => ({ ...current, engineCode: event.target.value }))}>{engines.map((engine) => <option value={engine} key={engine}>{engineLabels[engine] ?? engine}</option>)}</select></label>
            </div>
            {(engines.length > 1 || profile.platform === "E36") && <div className="inference-note"><strong>{engineLabels[profile.engineCode] ?? profile.engineCode} selected</strong><p>Keeper uses the year as a starting point. Confirm the VIN, production date, emissions label, engine stamp, and transmission tag before ordering parts or fluids.</p></div>}
            <div className="garage-save">
              <label>Garage name<input value={garage.nickname} onChange={(event) => garage.setNickname(event.target.value)} maxLength={60} placeholder="My BMW" /></label>
              <label>Mileage<input value={garage.mileage} onChange={(event) => garage.setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Optional" /></label>
              <button className="button button-primary" disabled={garage.loading || garage.saving} onClick={() => void saveGarage()}>{garage.saving ? "Saving…" : garage.vehicleId ? "Update garage" : "Save to garage"}</button>
            </div>
            {(saveNotice || garage.error) && <p className={`save-status ${garage.error ? "error" : ""}`}>{garage.error ?? saveNotice}</p>}
            <p className="session-note">{auth.user ? `${auth.isGuest ? "Guest" : "Permanent"} account active. Your saved car is protected by owner-only database policies.` : "Browse freely, then continue as a guest or use email when you want to save this car."}</p>
          </aside>
        </section>

        <section className="vehicle-band">
          <div><span>Selected profile</span><strong>{profile.year} BMW {profile.trim} · {profile.platform}</strong></div>
          <div><span>Engine</span><strong>{engineLabels[profile.engineCode]}</strong></div>
          <div><span>Drive</span><strong>{profile.drivetrain}</strong></div>
          <div><span>Matched research</span><strong>{matchedIssues.length} issue patterns · {maintenance.length} service items</strong></div>
        </section>

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

        <section className="maintenance-section" id="maintenance">
          <header className="section-heading"><div><p className="eyebrow">No account required</p><h2>Maintenance baseline.</h2></div><p>Factory documentation stays separate from the conservative planning layer. The E36 view preserves all 25 workbook categories; exact manuals, VIN data, production dates, and component labels remain controlling.</p></header>
          <div className="maintenance-list">
            {maintenance.slice(0, maintenanceExpanded ? undefined : 8).map((item) => <details key={item.slug}>
              <summary><span className={`severity-dot ${item.severity}`} /><div><h3>{item.name}</h3><p>{item.category} · {item.description}</p></div><div><span className="source-tag oem">DOCUMENTED</span><strong>{item.oem.label}</strong></div><div><span className="source-tag community">PLAN</span><strong>{item.community.label}</strong></div><b>＋</b></summary>
              <div className="maintenance-detail"><article><span>Factory position</span><p>{item.oem.summary}</p></article><article><span>Planning baseline</span><p>{item.community.summary}</p></article><article><span>Before service</span><ul>{item.diy.map((note) => <li key={note}>{note}</li>)}</ul></article><footer>{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><b>{source.type}</b>{source.title} ↗</a>)}</footer></div>
            </details>)}
            {maintenance.length > 8 && <button className="expand-button" onClick={() => setMaintenanceExpanded((value) => !value)}>{maintenanceExpanded ? "Show the short list" : `Show all ${maintenance.length} service items`}</button>}
          </div>
        </section>

        <section className="library-section" id="library">
          <header className="section-heading"><div><p className="eyebrow">Stored research · {KNOWN_ISSUES.length} patterns</p><h2>{platform.label} issue library.</h2></div><p>Coverage follows the selected generation and its U.S.-market engine and transmission combinations. Each record keeps fitment, evidence type, symptoms, and next action visible.</p></header>
          <div className="library-toolbar">
            <label className="search-field"><span>⌕</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search symptoms, systems, or issues" aria-label="Search the issue library" /></label>
            <label><span>Fitment view</span><select value={libraryView} onChange={(event) => setLibraryView(event.target.value)}><option value="mine">My selected car</option><option value="all">All {profile.platform} research</option>{trimOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
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
      </main>

      <footer className="site-footer"><div><KeeperMark /><strong>KEEPER</strong></div><p>Independent BMW ownership research for the E36 and F30. Not affiliated with or endorsed by BMW.</p><p>This site cannot inspect or diagnose a vehicle. Verify recalls, parts, fluids, capacities, and procedures against current VIN-specific information.</p><a href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">View source on GitHub ↗</a></footer>
      <AuthPanel auth={auth} open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
