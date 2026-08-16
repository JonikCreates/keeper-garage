import { useState } from "react";
import type { MaintenanceCatalogItem } from "../lib/catalog";
import type { MaintenanceRecordRow } from "./supabase";

type MaintenanceRecordPanelProps = {
  item: MaintenanceCatalogItem;
  records: MaintenanceRecordRow[];
  signedIn: boolean;
  isGuest: boolean;
  hasSavedVehicle: boolean;
  defaultMileage: string;
  saving: boolean;
  onOpenAuth: () => void;
  onAdd: (workPerformed: string, mileage: number, completedAt: string) => Promise<boolean>;
  onDelete: (recordId: string) => Promise<boolean>;
};

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function MaintenanceRecordPanel({ item, records, signedIn, isGuest, hasSavedVehicle, defaultMileage, saving, onOpenAuth, onAdd, onDelete }: MaintenanceRecordPanelProps) {
  const [workPerformed, setWorkPerformed] = useState("");
  const [mileage, setMileage] = useState(defaultMileage);
  const [completedAt, setCompletedAt] = useState(localDateValue);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const parsedMileage = Number(mileage);
    if (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000) {
      setNotice("Enter the mileage shown when the work was completed.");
      return;
    }
    if (!workPerformed.trim()) {
      setNotice("Describe what work was completed.");
      return;
    }
    const saved = await onAdd(workPerformed.trim(), parsedMileage, completedAt);
    if (saved) {
      setWorkPerformed("");
      setMileage("");
      setNotice("Completion added to this vehicle’s service history.");
    }
  }

  return <section className="maintenance-record-panel" aria-label={`${item.name} service history`}>
    <header>
      <div><span>My Garage record</span><strong>{records.length ? "Completed" : "Not recorded yet"}</strong></div>
      {records[0] && <b>{records[0].mileage.toLocaleString()} mi · {displayDate(records[0].completed_at)}</b>}
    </header>

    {!signedIn && <div className="maintenance-record-gate"><p>Sign in with Google to attach completed work to your garage.</p><button className="button button-primary" type="button" onClick={onOpenAuth}>Sign in to record service</button></div>}
    {signedIn && !hasSavedVehicle && <div className="maintenance-record-gate"><p>Save this vehicle in My Garage before recording completed work.</p><a className="button button-primary" href="#garage">Save this vehicle</a></div>}
    {signedIn && hasSavedVehicle && <>
      {isGuest && <p className="maintenance-guest-note">This is a temporary guest record. Connect Google before signing out to make the garage recoverable.</p>}
      <form className="maintenance-record-form" onSubmit={(event) => void submit(event)}>
        <label>Completed work<input aria-label={`${item.name} completed work`} value={workPerformed} onChange={(event) => setWorkPerformed(event.target.value.slice(0, 240))} maxLength={240} placeholder="What was replaced or repaired?" required /></label>
        <label>Mileage completed<input aria-label={`${item.name} completed mileage`} value={mileage} onChange={(event) => setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="e.g. 82,500" required /></label>
        <label>Date completed<input aria-label={`${item.name} completed date`} type="date" value={completedAt} max={localDateValue()} onChange={(event) => setCompletedAt(event.target.value)} required /></label>
        <button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : "Mark completed"}</button>
      </form>
      {notice && <p className="maintenance-record-notice">{notice}</p>}
      {records.length > 0 && <div className="maintenance-history">
        <span>Completion history</span>
        <ol>{records.map((record) => <li key={record.id}><div><strong>{record.work_performed}</strong><small>{displayDate(record.completed_at)} · {record.mileage.toLocaleString()} miles</small></div><button type="button" onClick={() => void onDelete(record.id)} aria-label={`Remove ${item.name} record from ${displayDate(record.completed_at)}`}>Remove</button></li>)}</ol>
      </div>}
    </>}
  </section>;
}
