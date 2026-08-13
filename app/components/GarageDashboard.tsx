"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ServiceRecord = {
  id: number;
  maintenanceItemId: number;
  maintenanceName: string;
  maintenanceSlug: string;
  serviceDate: string;
  mileage: number;
  cost: number | null;
  shop: string | null;
  notes: string | null;
  fluid: string | null;
  fluidQuantity: string | null;
  partsUsed: string | null;
};

type ScheduleItem = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  severity: string;
  oemMileageInterval: number | null;
  oemTimeMonths: number | null;
  communityMileageInterval: number | null;
  communityTimeMonths: number | null;
  lastService: ServiceRecord | null;
  nextDueMileage: number | null;
  nextDueDate: string | null;
  milesRemaining: number | null;
  daysRemaining: number | null;
  status: "overdue" | "due-soon" | "up-to-date" | "untracked";
  statusLabel: string;
};

type KnownIssue = {
  slug: string;
  issue: string;
  description: string;
  symptoms: string;
  typicalMileage: string;
  severity: string;
  preventativeAction: string;
  sourceUrl: string;
};

type DashboardData = {
  identity: {
    isDemo: boolean;
    canWrite: boolean;
    email: string | null;
  };
  vehicle: null | {
    id: number;
    year: number;
    make: string;
    model: string;
    trim: string;
    engine: string;
    transmission: string;
    nickname: string | null;
    currentMileage: number;
    purchaseMileage: number | null;
    purchaseDate: string | null;
  };
  schedule: ScheduleItem[];
  records: ServiceRecord[];
  knownIssues: KnownIssue[];
  healthScore: number;
  counts: {
    overdue: number;
    dueSoon: number;
    onTrack: number;
    untracked: number;
  };
};

const numberFormatter = new Intl.NumberFormat("en-US");
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const statusRank = { overdue: 0, "due-soon": 1, untracked: 2, "up-to-date": 3 };

function formatDate(value: string | null) {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value}T12:00:00Z`));
}

function intervalLabel(miles: number | null, months: number | null) {
  if (!miles && !months) return "Condition based";
  const parts = [];
  if (miles) parts.push(`${numberFormatter.format(miles)} mi`);
  if (months) parts.push(months % 12 === 0 ? `${months / 12} yr` : `${months} mo`);
  return parts.join(" / ");
}

function nextDueLabel(item: ScheduleItem) {
  const parts = [];
  if (item.nextDueMileage) parts.push(`${numberFormatter.format(item.nextDueMileage)} mi`);
  if (item.nextDueDate) parts.push(formatDate(item.nextDueDate));
  return parts.length ? parts.join(" · ") : "Add a baseline record";
}

function dueContext(item: ScheduleItem) {
  if (item.status === "untracked") return "Service history unknown";
  if (item.milesRemaining !== null && item.milesRemaining < 0) {
    return `${numberFormatter.format(Math.abs(item.milesRemaining))} mi past baseline`;
  }
  if (item.daysRemaining !== null && item.daysRemaining < 0) {
    const months = Math.max(1, Math.round(Math.abs(item.daysRemaining) / 30));
    return `${months} mo past baseline`;
  }
  if (item.milesRemaining !== null) {
    return `${numberFormatter.format(item.milesRemaining)} mi remaining`;
  }
  if (item.daysRemaining !== null) return `${item.daysRemaining} days remaining`;
  return "No fixed community interval";
}

function KeeperMark() {
  return (
    <span className="keeper-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function GarageDashboard({
  signedIn,
  displayName,
  signInPath,
  signOutPath,
}: {
  signedIn: boolean;
  displayName: string;
  signInPath: string;
  signOutPath: string;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("urgency");
  const [recordOpen, setRecordOpen] = useState(false);
  const [mileageOpen, setMileageOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [recordItem, setRecordItem] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = (await response.json()) as DashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to load the garage.");
      setData(payload);
      if (!recordItem && payload.schedule.length) {
        const first = payload.schedule.find((item) => item.status === "overdue") ?? payload.schedule[0];
        setRecordItem(String(first.id));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the garage.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
    // The dashboard is intentionally loaded once on entry; save actions refresh it explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categories = useMemo(
    () => Array.from(new Set(data?.schedule.map((item) => item.category) ?? [])).sort(),
    [data],
  );

  const filteredSchedule = useMemo(() => {
    const items = [...(data?.schedule ?? [])].filter((item) => {
      const matchesQuery = `${item.name} ${item.category}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return (
        matchesQuery &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (categoryFilter === "all" || item.category === categoryFilter)
      );
    });
    items.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "last") {
        return (b.lastService?.serviceDate ?? "").localeCompare(a.lastService?.serviceDate ?? "");
      }
      if (sort === "mileage") {
        return (a.nextDueMileage ?? Number.MAX_SAFE_INTEGER) - (b.nextDueMileage ?? Number.MAX_SAFE_INTEGER);
      }
      return statusRank[a.status] - statusRank[b.status] || a.name.localeCompare(b.name);
    });
    return items;
  }, [categoryFilter, data, query, sort, statusFilter]);

  const urgentItems = data?.schedule
    .filter((item) => item.status === "overdue" || item.status === "due-soon")
    .slice(0, 3);

  function beginRecord(itemId?: number) {
    if (!data?.identity.canWrite) {
      window.location.href = signInPath;
      return;
    }
    if (itemId) setRecordItem(String(itemId));
    setRecordOpen(true);
  }

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to save service.");
      setRecordOpen(false);
      setToast("Service recorded. Your schedule is recalculated.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function submitMileage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMileage: form.get("currentMileage") }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to update mileage.");
      setMileageOpen(false);
      setToast("Mileage updated. Due states are current.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update mileage.");
    } finally {
      setSaving(false);
    }
  }

  async function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to add vehicle.");
      setToast("Vehicle added. Your maintenance plan is ready.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to add vehicle.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <main className="loading-screen">
        <KeeperMark />
        <p>Preparing your garage</p>
      </main>
    );
  }

  if (!data || error && !data.vehicle) {
    return (
      <main className="error-screen">
        <KeeperMark />
        <h1>We couldn&apos;t open the garage.</h1>
        <p>{error || "The maintenance data is temporarily unavailable."}</p>
        <button className="button button-primary" onClick={() => void loadDashboard()}>
          Try again
        </button>
      </main>
    );
  }

  if (!data.vehicle) {
    return (
      <main className="onboarding-shell">
        <header className="onboarding-header">
          <Link href="/" className="brand-lockup">
            <KeeperMark />
            <span>KEEPER</span>
          </Link>
          <a href={signOutPath} className="text-link">Sign out</a>
        </header>
        <section className="onboarding-card">
          <p className="eyebrow">Your first garage</p>
          <h1>Add the car worth keeping.</h1>
          <p className="onboarding-copy">
            The prototype currently supports one deeply researched platform: the 2007–2010 BMW 335i with the N54 engine.
          </p>
          <form onSubmit={submitVehicle} className="onboarding-form">
            <label>
              Model year
              <select name="year" defaultValue="2008">
                <option>2007</option><option>2008</option><option>2009</option><option>2010</option>
              </select>
            </label>
            <label>
              Transmission
              <select name="transmission" defaultValue="6-speed automatic">
                <option>6-speed automatic</option><option>6-speed manual</option>
              </select>
            </label>
            <label>
              Current mileage
              <input name="currentMileage" type="number" min="0" required placeholder="91,240" />
            </label>
            <label>
              Purchase mileage
              <input name="purchaseMileage" type="number" min="0" placeholder="Optional" />
            </label>
            <label>
              Purchase date
              <input name="purchaseDate" type="date" />
            </label>
            <label>
              Nickname
              <input name="nickname" placeholder="The E90" />
            </label>
            <button disabled={saving} className="button button-primary onboarding-submit">
              {saving ? "Building your plan…" : "Create maintenance plan"}
            </button>
          </form>
          {error && <p className="form-error">{error}</p>}
        </section>
      </main>
    );
  }

  const vehicle = data.vehicle;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand-lockup sidebar-brand" aria-label="Keeper dashboard">
          <KeeperMark />
          <span>KEEPER</span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          <a href="#overview" className="active"><span>01</span>Overview</a>
          <a href="#schedule"><span>02</span>Maintenance</a>
          <a href="#watchlist"><span>03</span>Watchlist</a>
          <a href="#history"><span>04</span>Service history</a>
        </nav>
        <div className="sidebar-foot">
          <div className="dataset-stamp">
            <span className="live-dot" /> Curated dataset
            <strong>BMW E9x · N54</strong>
            <small>Prototype v0.1</small>
          </div>
          <p>Sources stay attached. OEM facts never blur into owner advice.</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <Link href="/" className="mobile-brand brand-lockup">
            <KeeperMark /><span>KEEPER</span>
          </Link>
          <div className="breadcrumb"><span>Garage</span><b>/</b>{vehicle.nickname || `${vehicle.year} ${vehicle.trim}`}</div>
          <div className="topbar-actions">
            {!signedIn && !data.identity.canWrite ? (
              <a href={signInPath} className="button button-quiet">Sign in to save</a>
            ) : null}
            <button className="button button-primary" onClick={() => beginRecord()}>
              <span>＋</span> Record service
            </button>
            <div className="user-chip" title={displayName}>{displayName.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        {data.identity.isDemo && (
          <div className="demo-banner">
            <span>Live prototype</span>
            You&apos;re viewing a realistic sample garage. {data.identity.canWrite ? "Try recording a service—local changes persist." : "Sign in to create your own persistent garage."}
            {!data.identity.canWrite && <a href={signInPath}>Make it yours →</a>}
          </div>
        )}

        {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}

        <section className="vehicle-hero" id="overview">
          <div className="vehicle-heading">
            <div className="vehicle-kicker"><span className="platform-pill">E90</span> Chassis-focused maintenance intelligence</div>
            <h1>{vehicle.year} {vehicle.make} <em>{vehicle.trim}</em></h1>
            <p>{vehicle.engine} <i /> {vehicle.transmission}</p>
            <div className="vehicle-facts">
              <div><span>Current mileage</span><strong>{numberFormatter.format(vehicle.currentMileage)}</strong><small>miles</small></div>
              <div><span>Purchase mileage</span><strong>{vehicle.purchaseMileage ? numberFormatter.format(vehicle.purchaseMileage) : "—"}</strong><small>{vehicle.purchaseDate ? formatDate(vehicle.purchaseDate) : "not recorded"}</small></div>
              <button className="mileage-update" onClick={() => data.identity.canWrite ? setMileageOpen(true) : window.location.assign(signInPath)}>
                Update odometer <span>↗</span>
              </button>
            </div>
          </div>
          <div className="hero-health">
            <div className="health-ring" style={{ "--score": `${data.healthScore * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{data.healthScore}</strong><span>/ 100</span></div>
            </div>
            <div className="health-copy">
              <p className="eyebrow">Maintenance health</p>
              <h2>{data.counts.overdue ? "Needs attention" : "Looking healthy"}</h2>
              <p>Based on recorded history and the selected enthusiast baseline—not a mechanical diagnosis.</p>
            </div>
          </div>
        </section>

        <section className="status-strip" aria-label="Maintenance status summary">
          <button onClick={() => setStatusFilter("overdue")} className="status-stat danger">
            <span>Overdue</span><strong>{data.counts.overdue.toString().padStart(2, "0")}</strong><small>needs action</small>
          </button>
          <button onClick={() => setStatusFilter("due-soon")} className="status-stat warning">
            <span>Due soon</span><strong>{data.counts.dueSoon.toString().padStart(2, "0")}</strong><small>next 1k mi / 45d</small>
          </button>
          <button onClick={() => setStatusFilter("up-to-date")} className="status-stat good">
            <span>On track</span><strong>{data.counts.onTrack.toString().padStart(2, "0")}</strong><small>within baseline</small>
          </button>
          <button onClick={() => setStatusFilter("untracked")} className="status-stat neutral">
            <span>Unknown</span><strong>{data.counts.untracked.toString().padStart(2, "0")}</strong><small>add a baseline</small>
          </button>
          <div className="urgent-stack">
            <span className="eyebrow">Next actions</span>
            {urgentItems?.length ? urgentItems.map((item) => (
              <button key={item.id} onClick={() => beginRecord(item.id)}>
                <i className={`mini-status ${item.status}`} />
                <span>{item.name}<small>{dueContext(item)}</small></span><b>＋</b>
              </button>
            )) : <p>Everything tracked is currently on schedule.</p>}
          </div>
        </section>

        <section className="schedule-section" id="schedule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your maintenance plan</p>
              <h2>What does the car need?</h2>
            </div>
            <div className="basis-note">
              <span>Tracking baseline</span>
              <strong>Enthusiast / conservative</strong>
              <small>OEM interval remains visible beside it.</small>
            </div>
          </div>
          <div className="schedule-toolbar">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search maintenance" aria-label="Search maintenance" />
            </label>
            <label>
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All states</option>
                <option value="overdue">Overdue</option>
                <option value="due-soon">Due soon</option>
                <option value="up-to-date">On track</option>
                <option value="untracked">Unknown</option>
              </select>
            </label>
            <label>
              <span>Category</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All systems</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="urgency">Most urgent</option>
                <option value="mileage">Next mileage</option>
                <option value="last">Last completed</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          <div className="maintenance-table" role="table" aria-label="Maintenance schedule">
            <div className="maintenance-head" role="row">
              <span>Maintenance item</span><span>Last completed</span><span>OEM</span><span>Enthusiast</span><span>Next due</span><span>State</span><span />
            </div>
            {filteredSchedule.map((item) => (
              <div className="maintenance-row" role="row" key={item.id}>
                <div className="item-name" role="cell">
                  <i className={`status-orb ${item.status}`} />
                  <span><Link href={`/maintenance/${item.slug}`}>{item.name}</Link><small>{item.category}</small></span>
                </div>
                <div className="last-service" role="cell" data-label="Last completed">
                  <strong>{item.lastService ? formatDate(item.lastService.serviceDate) : "No record"}</strong>
                  <small>{item.lastService ? `${numberFormatter.format(item.lastService.mileage)} mi` : "History unknown"}</small>
                </div>
                <div role="cell" data-label="OEM"><span className="source-tag oem">BMW</span><strong>{intervalLabel(item.oemMileageInterval, item.oemTimeMonths)}</strong></div>
                <div role="cell" data-label="Enthusiast"><span className="source-tag community">COMMUNITY</span><strong>{intervalLabel(item.communityMileageInterval, item.communityTimeMonths)}</strong></div>
                <div className="next-due" role="cell" data-label="Next due"><strong>{nextDueLabel(item)}</strong><small>{dueContext(item)}</small></div>
                <div role="cell" data-label="State"><span className={`status-badge ${item.status}`}>{item.statusLabel}</span></div>
                <div className="row-actions" role="cell">
                  <button onClick={() => beginRecord(item.id)} aria-label={`Record ${item.name}`}>＋</button>
                  <Link href={`/maintenance/${item.slug}`} aria-label={`View ${item.name} details`}>→</Link>
                </div>
              </div>
            ))}
            {!filteredSchedule.length && <div className="empty-table">No maintenance items match those filters.</div>}
          </div>
        </section>

        <section className="watchlist-section" id="watchlist">
          <div className="section-heading compact">
            <div><p className="eyebrow">N54 owner knowledge</p><h2>Known issues to watch</h2></div>
            <p className="section-intro">Mileage can shape relevance, but these are watch items—not predictions or diagnoses.</p>
          </div>
          <div className="issue-grid">
            {data.knownIssues.map((issue, index) => (
              <article className="issue-card" key={issue.slug}>
                <header><span>{String(index + 1).padStart(2, "0")}</span><i className={`severity-line ${issue.severity}`} /></header>
                <h3>{issue.issue}</h3>
                <p>{issue.description}</p>
                <dl>
                  <div><dt>Watch for</dt><dd>{issue.symptoms}</dd></div>
                  <div><dt>Context</dt><dd>{issue.typicalMileage}</dd></div>
                </dl>
                <footer><a href={issue.sourceUrl} target="_blank" rel="noreferrer">View community source ↗</a><span className="source-tag community">COMMUNITY</span></footer>
              </article>
            ))}
          </div>
        </section>

        <section className="history-section" id="history">
          <div className="section-heading compact">
            <div><p className="eyebrow">Digital service journal</p><h2>Recent history</h2></div>
            <button className="text-button" onClick={() => beginRecord()}>＋ Add record</button>
          </div>
          <div className="history-list">
            {data.records.slice(0, 6).map((record) => (
              <article key={record.id}>
                <time dateTime={record.serviceDate}><strong>{new Date(`${record.serviceDate}T12:00:00Z`).getUTCDate()}</strong><span>{new Date(`${record.serviceDate}T12:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" })}</span></time>
                <div className="history-main"><Link href={`/maintenance/${record.maintenanceSlug}`}>{record.maintenanceName}</Link><p>{record.notes || record.partsUsed || "Service completed"}</p></div>
                <div className="history-meta"><strong>{numberFormatter.format(record.mileage)} mi</strong><span>{record.shop || "Shop not recorded"}</span></div>
                <div className="history-cost">{record.cost !== null ? moneyFormatter.format(record.cost) : "—"}</div>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div><KeeperMark /><strong>KEEPER</strong></div>
          <p>Maintenance intelligence for cars worth keeping.</p>
          <p className="disclaimer">This prototype organizes records and published guidance. It does not inspect your vehicle, replace the factory service information for your VIN, or provide a mechanical diagnosis.</p>
        </footer>
      </main>

      {recordOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setRecordOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="record-title">
            <header><div><p className="eyebrow">Update the journal</p><h2 id="record-title">Record completed service</h2></div><button onClick={() => setRecordOpen(false)} aria-label="Close">×</button></header>
            <form onSubmit={submitRecord}>
              <label className="wide">Maintenance item<select name="maintenanceItemId" value={recordItem} onChange={(event) => setRecordItem(event.target.value)} required>{data.schedule.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label>Service date<input name="serviceDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
              <label>Mileage<input name="mileage" type="number" min="0" defaultValue={vehicle.currentMileage} required /></label>
              <label>Cost<input name="cost" type="number" min="0" step="0.01" placeholder="0.00" /></label>
              <label>Shop / mechanic<input name="shop" placeholder="DIY or shop name" /></label>
              <label>Fluid used<input name="fluid" placeholder="Brand and specification" /></label>
              <label>Fluid quantity<input name="fluidQuantity" placeholder="e.g. 6.9 qt" /></label>
              <label className="wide">Parts used / part numbers<input name="partsUsed" placeholder="Filter kit 11 42 7 953 129" /></label>
              <label className="wide">Notes<textarea name="notes" rows={3} placeholder="Observations, torque checks, follow-up items…" /></label>
              <footer><button type="button" className="button button-quiet" onClick={() => setRecordOpen(false)}>Cancel</button><button disabled={saving} className="button button-primary">{saving ? "Saving…" : "Save service record"}</button></footer>
            </form>
          </section>
        </div>
      )}

      {mileageOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMileageOpen(false)}>
          <section className="modal modal-small" role="dialog" aria-modal="true" aria-labelledby="mileage-title">
            <header><div><p className="eyebrow">Odometer</p><h2 id="mileage-title">Update current mileage</h2></div><button onClick={() => setMileageOpen(false)} aria-label="Close">×</button></header>
            <form onSubmit={submitMileage}>
              <label className="wide">Current mileage<input name="currentMileage" type="number" min="0" defaultValue={vehicle.currentMileage} required autoFocus /></label>
              <p className="modal-hint">The full maintenance schedule will be recalculated immediately.</p>
              <footer><button type="button" className="button button-quiet" onClick={() => setMileageOpen(false)}>Cancel</button><button disabled={saving} className="button button-primary">Update mileage</button></footer>
            </form>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
