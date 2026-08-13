"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ServiceRecord = {
  id: number; maintenanceItemId: number; maintenanceName: string; maintenanceSlug: string;
  serviceDate: string; mileage: number; cost: number | null; shop: string | null;
  notes: string | null; fluid: string | null; fluidQuantity: string | null; partsUsed: string | null;
};

type ScheduleItem = {
  id: number; slug: string; name: string; category: string; description: string; severity: string;
  oemMileageInterval: number | null; oemTimeMonths: number | null;
  communityMileageInterval: number | null; communityTimeMonths: number | null;
  lastService: ServiceRecord | null; nextDueMileage: number | null; nextDueDate: string | null;
  milesRemaining: number | null; daysRemaining: number | null;
  status: "overdue" | "due-soon" | "up-to-date" | "untracked"; statusLabel: string;
};

type Issue = {
  id: number; slug: string; system: string; issue: string; description: string; symptoms: string;
  typicalMileage: string; severity: string; urgency: "urgent" | "watch"; evidence: string;
  preventativeAction: string; isApplicable: boolean;
  applicability: { trims: string[]; engines: string[]; drivetrains: string[]; transmissions: string[] };
  sources: Array<{ type: string; title: string; url: string; publisher: string; note: string | null }>;
};

type Project = { slug: string; title: string; description: string; payoff: string };

type Vehicle = {
  id: number; year: number; make: string; model: string; trim: string; engine: string;
  engineCode: string; drivetrain: string; transmission: string; emissions: string;
  market: string; bodyCode: string; nickname: string | null; currentMileage: number;
  purchaseMileage: number | null; purchaseDate: string | null; productionDate: string | null;
  vinLast7: string | null;
};

type DashboardData = {
  identity: { isDemo: boolean; canWrite: boolean; email: string | null };
  vehicle: Vehicle | null; schedule: ScheduleItem[]; records: ServiceRecord[];
  applicableIssues: Issue[]; allIssues: Issue[]; projects: Project[]; healthScore: number;
  counts: { overdue: number; dueSoon: number; onTrack: number; untracked: number };
};

type ConfigState = {
  trim: string; drivetrain: string; transmission: string; engineCode: string;
  nickname: string; currentMileage: string; purchaseMileage: string; purchaseDate: string;
  productionDate: string; vinLast7: string;
};

const trimOptions = [
  { value: "320i", engines: ["N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { value: "328i", engines: ["N26", "N20"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
  { value: "328d", engines: ["N47T"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic"] },
  { value: "330e", engines: ["B48-PHEV"], drivetrains: ["RWD"], transmissions: ["8-speed automatic"] },
  { value: "340i", engines: ["B58"], drivetrains: ["RWD", "xDrive"], transmissions: ["8-speed automatic", "6-speed manual"] },
];

const trimEngines: Record<string, string[]> = {
  "320i": ["N20"], "328i": ["N20", "N26"], "328d": ["N47T"],
  "330e": ["B48-PHEV"], "340i": ["B58"],
};

const initialConfig: ConfigState = {
  trim: "328i", drivetrain: "RWD", transmission: "8-speed automatic", engineCode: "N26",
  nickname: "My F30", currentMileage: "", purchaseMileage: "", purchaseDate: "",
  productionDate: "", vinLast7: "",
};

const numberFormatter = new Intl.NumberFormat("en-US");
const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(`${value}T12:00:00Z`)) : "—";
}

function intervalLabel(miles: number | null, months: number | null) {
  if (!miles && !months) return "Condition based";
  const values = [];
  if (miles) values.push(`${numberFormatter.format(miles)} mi`);
  if (months) values.push(months % 12 === 0 ? `${months / 12} yr` : `${months} mo`);
  return values.join(" / ");
}

function dueContext(item: ScheduleItem) {
  if (item.status === "untracked") return "History unknown — establish a baseline";
  if (item.milesRemaining !== null && item.milesRemaining < 0) return `${numberFormatter.format(Math.abs(item.milesRemaining))} miles past baseline`;
  if (item.daysRemaining !== null && item.daysRemaining < 0) return `${Math.max(1, Math.round(Math.abs(item.daysRemaining) / 30))} months past baseline`;
  if (item.milesRemaining !== null) return `${numberFormatter.format(item.milesRemaining)} miles remaining`;
  if (item.daysRemaining !== null) return `${item.daysRemaining} days remaining`;
  return "No fixed interval";
}

function KeeperMark() {
  return <span className="keeper-mark" aria-hidden="true"><i /><i /><i /></span>;
}

function EvidenceTag({ value }: { value: string }) {
  const tone = value.includes("recall") ? "recall" : value.includes("bulletin") ? "bulletin" : "community";
  return <span className={`evidence-tag ${tone}`}>{value}</span>;
}

export default function GarageDashboard({
  signedIn, displayName, signInPath, signOutPath,
}: {
  signedIn: boolean; displayName: string; signInPath: string; signOutPath: string;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [mileageOpen, setMileageOpen] = useState(false);
  const [recordItem, setRecordItem] = useState("");
  const [config, setConfig] = useState<ConfigState>(initialConfig);
  const [watchExpanded, setWatchExpanded] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryTrim, setLibraryTrim] = useState("mine");
  const [scheduleQuery, setScheduleQuery] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = await response.json() as DashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to load the garage.");
      setData(payload);
      const first = payload.schedule.find((item) => item.status === "overdue") ?? payload.schedule[0];
      if (first) setRecordItem(String(first.id));
      if (!payload.vehicle && signedIn) setProfileOpen(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the garage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as DashboardData & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load the garage.");
        setData(payload);
        const first = payload.schedule.find((item) => item.status === "overdue") ?? payload.schedule[0];
        if (first) setRecordItem(String(first.id));
        if (!payload.vehicle && signedIn) setProfileOpen(true);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load the garage."))
      .finally(() => setLoading(false));
  }, [signedIn]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const urgentMaintenance = useMemo(() => data?.schedule.filter((item) => item.status === "overdue") ?? [], [data]);
  const urgentIssues = useMemo(() => data?.applicableIssues.filter((issue) => issue.urgency === "urgent") ?? [], [data]);
  const watchMaintenance = useMemo(() => data?.schedule.filter((item) => item.status === "due-soon" || (item.status === "untracked" && item.severity !== "routine")) ?? [], [data]);
  const watchIssues = useMemo(() => data?.applicableIssues.filter((issue) => issue.urgency === "watch") ?? [], [data]);

  const filteredSchedule = useMemo(() => (data?.schedule ?? []).filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(scheduleQuery.toLowerCase()),
  ).sort((a, b) => {
    const rank = { overdue: 0, "due-soon": 1, untracked: 2, "up-to-date": 3 };
    return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name);
  }), [data, scheduleQuery]);

  const filteredLibrary = useMemo(() => (data?.allIssues ?? []).filter((issue) => {
    const textMatch = `${issue.issue} ${issue.system} ${issue.description} ${issue.symptoms}`.toLowerCase().includes(libraryQuery.toLowerCase());
    if (!textMatch) return false;
    if (libraryTrim === "all") return true;
    if (libraryTrim === "mine") return issue.isApplicable;
    const rule = issue.applicability;
    return (!rule.trims.length || rule.trims.includes(libraryTrim)) &&
      (!rule.engines.length || rule.engines.some((engine) => trimEngines[libraryTrim]?.includes(engine)));
  }), [data, libraryQuery, libraryTrim]);

  function openProfile() {
    if (data?.vehicle) {
      const vehicle = data.vehicle;
      setConfig({
        trim: vehicle.trim, drivetrain: vehicle.drivetrain, transmission: vehicle.transmission,
        engineCode: vehicle.engineCode, nickname: vehicle.nickname ?? "", currentMileage: String(vehicle.currentMileage),
        purchaseMileage: vehicle.purchaseMileage ? String(vehicle.purchaseMileage) : "",
        purchaseDate: vehicle.purchaseDate ?? "", productionDate: vehicle.productionDate ?? "",
        vinLast7: vehicle.vinLast7 ?? "",
      });
    }
    setProfileOpen(true);
  }

  function changeTrim(trim: string) {
    const option = trimOptions.find((candidate) => candidate.value === trim)!;
    const transmission = option.transmissions.includes(config.transmission) ? config.transmission : option.transmissions[0];
    const drivetrain = option.drivetrains.includes(config.drivetrain) ? config.drivetrain : option.drivetrains[0];
    const engineCode = trim === "328i" ? (transmission === "6-speed manual" ? "N20" : "N26") : option.engines[0];
    setConfig((current) => ({ ...current, trim, transmission, drivetrain, engineCode }));
  }

  function changeTransmission(transmission: string) {
    setConfig((current) => ({ ...current, transmission, engineCode: current.trim === "328i" ? (transmission === "6-speed manual" ? "N20" : "N26") : current.engineCode }));
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn && !data?.identity.canWrite) {
      window.location.assign(signInPath);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, year: 2016 }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to save the vehicle.");
      setProfileOpen(false);
      setToast("Vehicle profile saved. Applicability recalculated.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save the vehicle.");
    } finally {
      setSaving(false);
    }
  }

  function beginRecord(itemId?: number) {
    if (!signedIn && !data?.identity.canWrite) {
      window.location.assign(signInPath);
      return;
    }
    if (itemId) setRecordItem(String(itemId));
    setRecordOpen(true);
  }

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/records", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to save service.");
      setRecordOpen(false);
      setToast("Service recorded. Urgency list updated.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save service.");
    } finally { setSaving(false); }
  }

  async function submitMileage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/vehicles", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMileage: form.get("currentMileage") }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to update mileage.");
      setMileageOpen(false);
      setToast("Mileage updated. Priorities recalculated.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update mileage.");
    } finally { setSaving(false); }
  }

  if (loading && !data) return <main className="loading-screen"><KeeperMark /><p>Loading the F30 intelligence library…</p></main>;
  if (!data || error && !data.vehicle) return <main className="loading-screen"><KeeperMark /><p>{error || "The garage could not be loaded."}</p><button onClick={() => void loadDashboard()}>Try again</button></main>;
  const vehicle = data.vehicle;
  const selectedTrim = trimOptions.find((option) => option.value === config.trim)!;

  return (
    <div className="garage-app">
      <header className="topbar">
        <a href="#top" className="brand-lockup"><KeeperMark /><span>KEEPER</span><small>F30 intelligence</small></a>
        <nav><a href="#triage">Priorities</a><a href="#plan">Maintenance</a><a href="#library">Issue library</a><a href="#history">History</a></nav>
        <div className="account-area"><span><b>{signedIn ? displayName : "Research demo"}</b><small>{signedIn ? "Private garage" : "Sign in to save"}</small></span>{signedIn ? <a href={signOutPath}>Sign out</a> : <a className="mini-button" href={signInPath}>Sign in</a>}</div>
      </header>

      <main id="top">
        {!vehicle ? (
          <section className="empty-garage">
            <p className="eyebrow">Build the exact car first</p>
            <h1>Brand. Model. Then the details that change the answer.</h1>
            <p>Keeper separates the 2016 F30 by trim, engine, drivetrain, transmission, and emissions package before it shows a maintenance or issue list.</p>
            <button className="button button-primary" onClick={openProfile}>Configure your BMW</button>
          </section>
        ) : (
          <>
            <section className="vehicle-hero">
              <div className="hero-copy">
                <p className="eyebrow">Your configured garage</p>
                <h1>{vehicle.nickname || "My F30"}</h1>
                <p className="vehicle-title">{vehicle.year} {vehicle.make} {vehicle.trim} <span>{vehicle.bodyCode}</span></p>
                <div className="spec-strip">
                  <span><small>Engine</small><strong>{vehicle.engineCode} · {vehicle.emissions}</strong></span>
                  <span><small>Drive</small><strong>{vehicle.drivetrain}</strong></span>
                  <span><small>Transmission</small><strong>{vehicle.transmission}</strong></span>
                  <span><small>Market</small><strong>{vehicle.market}</strong></span>
                </div>
                <button className="text-button" onClick={openProfile}>Edit exact configuration →</button>
              </div>
              <div className="mileage-panel">
                <span>Current mileage</span><strong>{numberFormatter.format(vehicle.currentMileage)}</strong><small>miles</small>
                <button onClick={() => signedIn || data.identity.canWrite ? setMileageOpen(true) : window.location.href = signInPath}>Update odometer</button>
              </div>
              <div className="score-panel">
                <div className="score-ring" style={{ "--score": `${data.healthScore * 3.6}deg` } as React.CSSProperties}><span>{data.healthScore}</span></div>
                <div><span>Record coverage</span><strong>{data.counts.onTrack} on track</strong><small>{data.counts.untracked} baselines still unknown</small></div>
              </div>
            </section>

            {data.identity.isDemo && <aside className="demo-ribbon"><span>Live research demo</span><p>Showing a 2016 328i RWD automatic profile. Sign in and confirm your own transmission, mileage, build date, and VIN details.</p><a href={signInPath}>Create my private garage →</a></aside>}

            <section className="triage-section" id="triage">
              <header className="section-heading"><div><p className="eyebrow">Ordered by consequence</p><h2>What should I do next?</h2></div><p>Known issues are watch items, not diagnoses. An urgent maintenance item means the saved record is past the planning baseline.</p></header>

              <div className="priority-lane urgent-lane">
                <div className="lane-label"><span>01</span><div><h3>Urgent</h3><p>Safety, active recall checks, high-voltage warnings, or overdue critical service.</p></div><strong>{urgentMaintenance.length + urgentIssues.length}</strong></div>
                <div className="lane-items">
                  {!urgentMaintenance.length && !urgentIssues.length && <div className="all-clear"><i>✓</i><div><strong>No urgent item from the records you have saved.</strong><p>That is not a mechanical inspection; stay alert to warning lights, leaks, overheating, braking, or steering changes.</p></div></div>}
                  {urgentMaintenance.map((item) => <article className="priority-card maintenance-priority" key={item.slug}><span className="priority-kind">Overdue service</span><div><h4>{item.name}</h4><p>{dueContext(item)}</p><small>{item.description}</small></div><button onClick={() => beginRecord(item.id)}>Record service</button></article>)}
                  {urgentIssues.map((issue) => <article className="priority-card issue-priority" key={issue.slug}><EvidenceTag value={issue.evidence} /><div><h4>{issue.issue}</h4><p>{issue.preventativeAction}</p><small>Watch for: {issue.symptoms}</small></div>{issue.sources[0] && <a href={issue.sources[0].url} target="_blank" rel="noreferrer">Source ↗</a>}</article>)}
                </div>
              </div>

              <div className="priority-lane watch-lane">
                <div className="lane-label"><span>02</span><div><h3>Be on the lookout</h3><p>Due soon, unknown history, and recurring issues matched to this exact configuration.</p></div><strong>{watchMaintenance.length + watchIssues.length}</strong></div>
                <div className="lane-items">
                  {watchMaintenance.map((item) => <article className="priority-card maintenance-priority" key={item.slug}><span className={`priority-kind ${item.status}`}>{item.statusLabel}</span><div><h4>{item.name}</h4><p>{dueContext(item)}</p><small>Enthusiast baseline: {intervalLabel(item.communityMileageInterval, item.communityTimeMonths)}</small></div><button onClick={() => beginRecord(item.id)}>Add record</button></article>)}
                  {watchIssues.slice(0, watchExpanded ? undefined : 6).map((issue) => <article className="priority-card issue-priority" key={issue.slug}><EvidenceTag value={issue.evidence} /><div><h4>{issue.issue}</h4><p>{issue.description}</p><small>Watch for: {issue.symptoms}</small></div>{issue.sources[0] && <a href={issue.sources[0].url} target="_blank" rel="noreferrer">Evidence ↗</a>}</article>)}
                  {watchIssues.length > 6 && <button className="expand-button" onClick={() => setWatchExpanded((value) => !value)}>{watchExpanded ? "Show the short list" : `Show all ${watchIssues.length} matched watch items`}</button>}
                </div>
              </div>

              <div className="priority-lane fun-lane">
                <div className="lane-label"><span>03</span><div><h3>For fun</h3><p>Only after the urgent and watch lists fit your time and budget.</p></div><strong>{data.projects.length}</strong></div>
                <div className="project-grid">{data.projects.map((project) => <article key={project.slug}><span>{project.payoff}</span><h4>{project.title}</h4><p>{project.description}</p></article>)}</div>
              </div>
            </section>

            <section className="plan-section" id="plan">
              <header className="section-heading"><div><p className="eyebrow">Service planner</p><h2>Your configuration-filtered plan</h2></div><label className="search-field"><span>⌕</span><input value={scheduleQuery} onChange={(event) => setScheduleQuery(event.target.value)} placeholder="Search service items" /></label></header>
              <div className="maintenance-table">
                <div className="maintenance-head"><span>Item</span><span>Last record</span><span>BMW position</span><span>Planning baseline</span><span>State</span><span /></div>
                {filteredSchedule.map((item) => <div className="maintenance-row" key={item.slug}>
                  <div className="item-name"><i className={item.status} /><span><Link href={`/maintenance/${item.slug}`}>{item.name}</Link><small>{item.category}</small></span></div>
                  <div data-label="Last record"><strong>{item.lastService ? formatDate(item.lastService.serviceDate) : "No record"}</strong><small>{item.lastService ? `${numberFormatter.format(item.lastService.mileage)} mi` : "Unknown"}</small></div>
                  <div data-label="BMW position"><span className="source-tag oem">BMW</span><strong>{intervalLabel(item.oemMileageInterval, item.oemTimeMonths)}</strong></div>
                  <div data-label="Planning baseline"><span className="source-tag community">PLAN</span><strong>{intervalLabel(item.communityMileageInterval, item.communityTimeMonths)}</strong></div>
                  <div data-label="State"><span className={`status-badge ${item.status}`}>{item.statusLabel}</span><small>{dueContext(item)}</small></div>
                  <div className="row-actions"><button onClick={() => beginRecord(item.id)}>＋</button><Link href={`/maintenance/${item.slug}`}>→</Link></div>
                </div>)}
              </div>
            </section>

            <section className="library-section" id="library">
              <header className="section-heading"><div><p className="eyebrow">Stored research · {data.allIssues.length} issue patterns</p><h2>2016 F30 issue library</h2></div><p>320i, 328i, 328d, 330e, and 340i. Filtered by engine and drivetrain for your car, preserved in full for the whole family.</p></header>
              <div className="library-toolbar">
                <label className="search-field"><span>⌕</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Search symptoms, systems, issues" /></label>
                <label><span>Fitment view</span><select value={libraryTrim} onChange={(event) => setLibraryTrim(event.target.value)}><option value="mine">My exact car</option><option value="all">All 320i–340i</option>{trimOptions.map((option) => <option value={option.value} key={option.value}>{option.value}</option>)}</select></label>
                <strong>{filteredLibrary.length} shown</strong>
              </div>
              <div className="issue-library-list">
                {filteredLibrary.map((issue) => <details key={issue.slug} className={issue.isApplicable ? "matched" : ""}>
                  <summary><span className="issue-system">{issue.system}</span><div><h3>{issue.issue}</h3><p>{issue.description}</p></div><EvidenceTag value={issue.evidence} /><b>{issue.isApplicable ? "MATCH" : "LIBRARY"}</b></summary>
                  <div className="issue-detail-grid"><div><span>Watch for</span><p>{issue.symptoms}</p></div><div><span>Context</span><p>{issue.typicalMileage}</p></div><div><span>What to do</span><p>{issue.preventativeAction}</p></div><div><span>Applies to</span><p>{[...issue.applicability.trims, ...issue.applicability.engines, ...issue.applicability.drivetrains, ...issue.applicability.transmissions].join(" · ") || "All 2016 F30 variants"}</p></div></div>
                  <footer>{issue.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</footer>
                </details>)}
              </div>
            </section>

            <section className="history-section" id="history">
              <header className="section-heading"><div><p className="eyebrow">Digital service journal</p><h2>Recent history</h2></div><button className="text-button" onClick={() => beginRecord()}>＋ Add record</button></header>
              <div className="history-list">{data.records.length ? data.records.slice(0, 8).map((record) => <article key={record.id}><time dateTime={record.serviceDate}><strong>{new Date(`${record.serviceDate}T12:00:00Z`).getUTCDate()}</strong><span>{new Date(`${record.serviceDate}T12:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" })}</span></time><div><Link href={`/maintenance/${record.maintenanceSlug}`}>{record.maintenanceName}</Link><p>{record.notes || record.partsUsed || "Service completed"}</p></div><div><strong>{numberFormatter.format(record.mileage)} mi</strong><span>{record.shop || "Shop not saved"}</span></div><b>{record.cost !== null ? moneyFormatter.format(record.cost) : "—"}</b></article>) : <div className="empty-history">No service records yet. Start with your latest oil service or purchase inspection.</div>}</div>
            </section>
          </>
        )}

        <footer className="site-footer"><div><KeeperMark /><strong>KEEPER</strong></div><p>Maintenance intelligence for cars worth keeping.</p><p>Research organizes what to inspect; it does not diagnose the car. Warning lights, overheating, fuel leaks, brake or steering changes, smoke, and high-voltage messages require qualified inspection.</p></footer>
      </main>

      {profileOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && data.vehicle && setProfileOpen(false)}>
        <section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
          <header><div><p className="eyebrow">Exact configuration</p><h2 id="profile-title">Build your 2016 F30 profile</h2></div>{data.vehicle && <button onClick={() => setProfileOpen(false)} aria-label="Close">×</button>}</header>
          <p className="modal-intro">The trim badge is not enough. Engine, drive system, transmission, and emissions equipment change which problems and service items apply.</p>
          <form onSubmit={submitProfile}>
            <div className="identity-fields"><label>Brand<select disabled><option>BMW</option></select></label><label>Model<select disabled><option>3 Series (F30)</option></select></label><label>Year<select disabled><option>2016</option></select></label></div>
            <div className="config-fields"><label>Specific model<select value={config.trim} onChange={(event) => changeTrim(event.target.value)}>{trimOptions.map((option) => <option key={option.value}>{option.value}</option>)}</select></label><label>Drivetrain<select value={config.drivetrain} onChange={(event) => setConfig((current) => ({ ...current, drivetrain: event.target.value }))}>{selectedTrim.drivetrains.map((value) => <option key={value}>{value}</option>)}</select></label><label>Transmission<select value={config.transmission} onChange={(event) => changeTransmission(event.target.value)}>{selectedTrim.transmissions.map((value) => <option key={value}>{value}</option>)}</select></label><label>Engine / emissions<select value={config.engineCode} onChange={(event) => setConfig((current) => ({ ...current, engineCode: event.target.value }))} disabled={config.trim === "328i"}>{selectedTrim.engines.map((value) => <option key={value} value={value}>{value}{value === "N26" ? " · SULEV" : value === "B48-PHEV" ? " · hybrid" : value === "N47T" ? " · diesel" : ""}</option>)}</select></label></div>
            {config.trim === "328i" && <div className="inference-note"><strong>{config.transmission === "8-speed automatic" ? "N26 SULEV inferred" : "N20 inferred"}</strong><p>BMW&apos;s U.S. 2016 bulletin maps the 328i automatic to N26 SULEV and the 6-speed manual to N20. Confirm with the under-hood emissions label or VIN/build data.</p></div>}
            <div className="ownership-fields"><label>Nickname<input value={config.nickname} onChange={(event) => setConfig((current) => ({ ...current, nickname: event.target.value }))} placeholder="My F30" /></label><label>Current mileage<input required type="number" min="0" value={config.currentMileage} onChange={(event) => setConfig((current) => ({ ...current, currentMileage: event.target.value }))} /></label><label>Purchase mileage<input type="number" min="0" value={config.purchaseMileage} onChange={(event) => setConfig((current) => ({ ...current, purchaseMileage: event.target.value }))} /></label><label>Purchase date<input type="date" value={config.purchaseDate} onChange={(event) => setConfig((current) => ({ ...current, purchaseDate: event.target.value }))} /></label><label>Production month<input type="month" value={config.productionDate} onChange={(event) => setConfig((current) => ({ ...current, productionDate: event.target.value }))} /></label><label>VIN last 7 <span>optional</span><input maxLength={7} value={config.vinLast7} onChange={(event) => setConfig((current) => ({ ...current, vinLast7: event.target.value.toUpperCase() }))} placeholder="A123456" /></label></div>
            <footer>{data.vehicle && <button type="button" className="button button-quiet" onClick={() => setProfileOpen(false)}>Cancel</button>}<button disabled={saving} className="button button-primary">{saving ? "Saving…" : signedIn || data.identity.canWrite ? "Save exact vehicle" : "Sign in to save"}</button></footer>
          </form>
        </section>
      </div>}

      {recordOpen && vehicle && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setRecordOpen(false)}><section className="modal record-modal" role="dialog" aria-modal="true"><header><div><p className="eyebrow">Update the journal</p><h2>Record completed service</h2></div><button onClick={() => setRecordOpen(false)}>×</button></header><form onSubmit={submitRecord}><label className="wide">Maintenance item<select name="maintenanceItemId" value={recordItem} onChange={(event) => setRecordItem(event.target.value)} required>{data.schedule.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Service date<input name="serviceDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>Mileage<input name="mileage" type="number" min="0" defaultValue={vehicle.currentMileage} required /></label><label>Cost<input name="cost" type="number" min="0" step="0.01" /></label><label>Shop / mechanic<input name="shop" placeholder="DIY or shop name" /></label><label>Fluid used<input name="fluid" placeholder="Brand and specification" /></label><label>Quantity<input name="fluidQuantity" placeholder="e.g. 5 L" /></label><label className="wide">Parts used<input name="partsUsed" placeholder="Part names and numbers" /></label><label className="wide">Notes<textarea name="notes" rows={3} placeholder="Observations and follow-up items" /></label><footer><button type="button" className="button button-quiet" onClick={() => setRecordOpen(false)}>Cancel</button><button disabled={saving} className="button button-primary">{saving ? "Saving…" : "Save service record"}</button></footer></form></section></div>}

      {mileageOpen && vehicle && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMileageOpen(false)}><section className="modal mileage-modal" role="dialog" aria-modal="true"><header><div><p className="eyebrow">Odometer</p><h2>Update current mileage</h2></div><button onClick={() => setMileageOpen(false)}>×</button></header><form onSubmit={submitMileage}><label className="wide">Current mileage<input name="currentMileage" type="number" min="0" defaultValue={vehicle.currentMileage} required /></label><footer><button type="button" className="button button-quiet" onClick={() => setMileageOpen(false)}>Cancel</button><button disabled={saving} className="button button-primary">Update priorities</button></footer></form></section></div>}

      {error && data.vehicle && <div className="error-toast" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
