import { useCallback, useMemo, useState } from "react";
import {
  KNOWN_ISSUES,
  MAINTENANCE_CATALOG,
  PROJECT_IDEAS,
  TRIM_OPTIONS,
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
  B58: "B58 3.0L turbo I6",
};

const numberFormatter = new Intl.NumberFormat("en-US");

function KeeperMark() {
  return <span className="keeper-mark" aria-hidden="true"><i /><i /><i /></span>;
}

function EvidenceTag({ value }: { value: string }) {
  const tone = value.includes("recall") ? "recall" : value.includes("bulletin") ? "bulletin" : "community";
  return <span className={`evidence-tag ${tone}`}>{value}</span>;
}

function intervalLabel(miles: number | null, months: number | null) {
  if (!miles && !months) return "Condition based";
  const values: string[] = [];
  if (miles) values.push(`${numberFormatter.format(miles)} mi`);
  if (months) values.push(months % 12 === 0 ? `${months / 12} yr` : `${months} mo`);
  return values.join(" / ");
}

function issueMatchesTrim(issue: KnownIssue, trim: string) {
  const option = TRIM_OPTIONS.find((candidate) => candidate.value === trim);
  if (!option) return true;
  const rules = issue.appliesTo;
  return (!rules.trims || rules.trims.includes(trim)) &&
    (!rules.engines || rules.engines.some((engine) => (option.engines as readonly string[]).includes(engine)));
}

export default function App() {
  const [profile, setProfile] = useState<VehicleProfile>({
    trim: "328i",
    engineCode: "N26",
    drivetrain: "RWD",
    transmission: "8-speed automatic",
  });
  const [libraryView, setLibraryView] = useState<LibraryView>("mine");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [watchExpanded, setWatchExpanded] = useState(false);
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const auth = useKeeperAuth();
  const loadVehicle = useCallback((vehicle: VehicleProfile) => setProfile(vehicle), []);
  const garage = useGarage(auth.user, loadVehicle);

  const selectedTrim = TRIM_OPTIONS.find((option) => option.value === profile.trim) ?? TRIM_OPTIONS[1];
  const drivetrains = [...selectedTrim.drivetrains] as string[];
  const transmissions = [...selectedTrim.transmissions] as string[];

  const maintenance = useMemo(
    () => MAINTENANCE_CATALOG.filter((item) => matchesApplicability(profile, item.appliesTo)),
    [profile],
  );
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
    if (!textMatches || libraryView === "all") return textMatches;
    if (libraryView === "mine") return textMatches && matchesApplicability(profile, issue.appliesTo);
    return textMatches && issueMatchesTrim(issue, libraryView);
  }), [libraryQuery, libraryView, profile]);

  function selectTrim(trim: string) {
    const option = TRIM_OPTIONS.find((candidate) => candidate.value === trim);
    if (!option) return;
    const nextTransmissions = option.transmissions as readonly string[];
    const nextDrivetrains = option.drivetrains as readonly string[];
    const transmission = nextTransmissions.includes(profile.transmission) ? profile.transmission : option.transmissions[0];
    const drivetrain = nextDrivetrains.includes(profile.drivetrain) ? profile.drivetrain : option.drivetrains[0];
    setProfile({ trim, transmission, drivetrain, engineCode: inferEngine(trim, transmission) });
  }

  function selectTransmission(transmission: string) {
    setProfile((current) => ({
      ...current,
      transmission,
      engineCode: inferEngine(current.trim, transmission),
    }));
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
        <a className="brand-lockup" href="#top"><KeeperMark /><span>KEEPER</span><small>F30 intelligence</small></a>
        <nav aria-label="Primary navigation"><a href="#priorities">Priorities</a><a href="#maintenance">Maintenance</a><a href="#library">Issue library</a><a href="#sources">Sources</a></nav>
        <div className="topbar-actions"><a className="github-link" href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">GitHub ↗</a><button className={`account-button ${auth.user ? "active" : ""}`} onClick={() => { auth.clearStatus(); setAuthOpen(true); }}>{accountLabel}</button></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">2016 BMW 3 Series · F30</p>
            <h1>Know what your car needs next.</h1>
            <p className="hero-intro">Factory schedules, recurring owner patterns, and specialist guidance—filtered for the exact engine and drivetrain instead of treating every 3 Series as the same car.</p>
            <div className="hero-actions"><a href="#priorities" className="button button-primary">See my priorities</a><a href="#library" className="button button-quiet">Browse all {KNOWN_ISSUES.length} issues</a></div>
          </div>
          <aside className="configuration-panel" aria-labelledby="config-title">
            <div className="configuration-heading"><span>Configure this visit</span><strong id="config-title">Your exact F30</strong></div>
            <div className="config-grid">
              <label>Brand<select disabled><option>BMW</option></select></label>
              <label>Model<select disabled><option>3 Series (F30)</option></select></label>
              <label>Specific model<select value={profile.trim} onChange={(event) => selectTrim(event.target.value)}>{TRIM_OPTIONS.map((option) => <option key={option.value}>{option.value}</option>)}</select></label>
              <label>Drivetrain<select value={profile.drivetrain} onChange={(event) => setProfile((current) => ({ ...current, drivetrain: event.target.value }))}>{drivetrains.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Transmission<select value={profile.transmission} onChange={(event) => selectTransmission(event.target.value)}>{transmissions.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Engine<select value={profile.engineCode} disabled><option>{engineLabels[profile.engineCode]}</option></select></label>
            </div>
            {profile.trim === "328i" && <div className="inference-note"><strong>{profile.engineCode} inferred</strong><p>For the U.S. 2016 328i, BMW maps the automatic to N26 SULEV and the manual to N20. Confirm with the under-hood emissions label or VIN data.</p></div>}
            <div className="garage-save">
              <label>Garage name<input value={garage.nickname} onChange={(event) => garage.setNickname(event.target.value)} maxLength={60} placeholder="My F30" /></label>
              <label>Mileage<input value={garage.mileage} onChange={(event) => garage.setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="Optional" /></label>
              <button className="button button-primary" disabled={garage.loading || garage.saving} onClick={() => void saveGarage()}>{garage.saving ? "Saving…" : garage.vehicleId ? "Update garage" : "Save to garage"}</button>
            </div>
            {(saveNotice || garage.error) && <p className={`save-status ${garage.error ? "error" : ""}`}>{garage.error ?? saveNotice}</p>}
            <p className="session-note">{auth.user ? `${auth.isGuest ? "Guest" : "Permanent"} account active. Your saved car is protected by owner-only database policies.` : "Browse freely, then continue as a guest or use email when you want to save this car."}</p>
          </aside>
        </section>

        <section className="vehicle-band">
          <div><span>Selected profile</span><strong>2016 BMW {profile.trim}</strong></div>
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
              {emergencyChecks.map((item) => <article className="priority-card emergency-card" key={item.title}><span className="priority-kind">Any F30</span><div><h4>{item.title}</h4><p>{item.body}</p></div><span className="action-label">STOP / CHECK</span></article>)}
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
          <header className="section-heading"><div><p className="eyebrow">No account required</p><h2>Maintenance baseline.</h2></div><p>BMW’s published position stays separate from the more conservative owner-planning layer. Your CBS display and VIN-specific service information remain controlling.</p></header>
          <div className="maintenance-list">
            {maintenance.slice(0, maintenanceExpanded ? undefined : 8).map((item) => <details key={item.slug}>
              <summary><span className={`severity-dot ${item.severity}`} /><div><h3>{item.name}</h3><p>{item.category} · {item.description}</p></div><div><span className="source-tag oem">BMW</span><strong>{intervalLabel(item.oem.mileage, item.oem.months)}</strong></div><div><span className="source-tag community">PLAN</span><strong>{intervalLabel(item.community.mileage, item.community.months)}</strong></div><b>＋</b></summary>
              <div className="maintenance-detail"><article><span>Factory position</span><p>{item.oem.summary}</p></article><article><span>Planning baseline</span><p>{item.community.summary}</p></article><article><span>Before service</span><ul>{item.diy.map((note) => <li key={note}>{note}</li>)}</ul></article><footer>{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><b>{source.type}</b>{source.title} ↗</a>)}</footer></div>
            </details>)}
            {maintenance.length > 8 && <button className="expand-button" onClick={() => setMaintenanceExpanded((value) => !value)}>{maintenanceExpanded ? "Show the short list" : `Show all ${maintenance.length} service items`}</button>}
          </div>
        </section>

        <section className="library-section" id="library">
          <header className="section-heading"><div><p className="eyebrow">Stored research · {KNOWN_ISSUES.length} patterns</p><h2>2016 F30 issue library.</h2></div><p>Coverage spans the 320i, 328i, 328d, 330e, and 340i. Each record stores its engine, drivetrain, transmission, evidence type, symptoms, and next action.</p></header>
          <div className="library-toolbar">
            <label className="search-field"><span>⌕</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search symptoms, systems, or issues" aria-label="Search the issue library" /></label>
            <label><span>Fitment view</span><select value={libraryView} onChange={(event) => setLibraryView(event.target.value)}><option value="mine">My selected car</option><option value="all">All 320i–340i</option>{TRIM_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.value}</option>)}</select></label>
            <strong>{libraryIssues.length} shown</strong>
          </div>
          <div className="issue-library-list">
            {libraryIssues.map((issue) => {
              const matched = matchesApplicability(profile, issue.appliesTo);
              const appliesTo = [issue.appliesTo.trims, issue.appliesTo.engines, issue.appliesTo.drivetrains, issue.appliesTo.transmissions].flatMap((values) => values ?? []);
              return <details className={matched ? "matched" : ""} key={issue.slug}>
                <summary><span className="issue-system">{issue.system}</span><div><h3>{issue.issue}</h3><p>{issue.description}</p></div><EvidenceTag value={issue.evidence} /><b>{matched ? "MATCH" : "LIBRARY"}</b></summary>
                <div className="issue-detail-grid"><article><span>Watch for</span><p>{issue.symptoms}</p></article><article><span>Context</span><p>{issue.typicalMileage}</p></article><article><span>What to do</span><p>{issue.preventativeAction}</p></article><article><span>Applies to</span><p>{appliesTo.length ? appliesTo.join(" · ") : "All 2016 F30 variants"}</p></article></div>
                <footer>{issue.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</footer>
              </details>;
            })}
          </div>
        </section>

        <section className="sources-section" id="sources">
          <p className="eyebrow">Evidence policy</p>
          <h2>Useful, without pretending every forum post is a fact.</h2>
          <div className="evidence-grid"><article><span>01</span><h3>BMW / official</h3><p>Maintenance schedules, recalls, and service bulletins define factory positions, affected production, and VIN-specific actions.</p></article><article><span>02</span><h3>Community consensus</h3><p>Repeated patterns from specialists, F30 forums, and technical videos become watch items—not automatic diagnoses.</p></article><article><span>03</span><h3>Individual experience</h3><p>StartMyCar and isolated owner reports help discover symptoms, but remain visibly labeled and carry the lowest confidence.</p></article></div>
        </section>
      </main>

      <footer className="site-footer"><div><KeeperMark /><strong>KEEPER</strong></div><p>Independent 2016 BMW F30 research. Not affiliated with or endorsed by BMW.</p><p>This site cannot inspect or diagnose a vehicle. Verify recalls, parts, fluids, capacities, and procedures against current VIN-specific information.</p><a href="https://github.com/JonikCreates/keeper-garage" target="_blank" rel="noreferrer">View source on GitHub ↗</a></footer>
      <AuthPanel auth={auth} open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
