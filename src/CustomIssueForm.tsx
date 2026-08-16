import { useState } from "react";
import type { VehicleMaintenanceItemRow } from "./supabase";

type IssueStatus = NonNullable<VehicleMaintenanceItemRow["issue_status"]>;

type CustomIssueFormProps = {
  query: string;
  enabled: boolean;
  saving: boolean;
  defaultMileage: string;
  onRequireVehicle: () => void;
  onAdd: (name: string, notes: string, dateFound: string, mileageFound: number | null, status: IssueStatus) => Promise<boolean>;
};

export function CustomIssueForm({ query, enabled, saving, defaultMileage, onRequireVehicle, onAdd }: CustomIssueFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [dateFound, setDateFound] = useState(() => new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState(defaultMileage);
  const [status, setStatus] = useState<IssueStatus>("watching");
  const [notice, setNotice] = useState<string | null>(null);

  function startAdding() {
    if (!enabled) {
      onRequireVehicle();
      return;
    }
    setName(query.trim());
    setMileage(defaultMileage);
    setNotice(null);
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedMileage = mileage.trim() ? Number(mileage) : null;
    if (!name.trim() || (parsedMileage !== null && (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000))) return;
    if (await onAdd(name, notes, dateFound, parsedMileage, status)) {
      setOpen(false);
      setNotice(`“${name.trim()}” was added to this vehicle’s maintenance plan.`);
      setNotes("");
    }
  }

  return <section className="custom-issue-panel" aria-labelledby="custom-issue-title">
    <div><span>Still not seeing it?</span><h3 id="custom-issue-title">Track your own issue.</h3><p>Add an observation such as a roof liner, leather repair, unusual noise, or vehicle-specific fault. It stays separate from completed service history until you record the work.</p></div>
    {!open && <button className="button button-primary" type="button" onClick={startAdding}>+ Add “{query.trim()}” as a custom issue</button>}
    {notice && <p className="custom-issue-notice" role="status">{notice}</p>}
    {open && <form className="custom-issue-form" onSubmit={(event) => void submit(event)}>
      <label><span>Issue name</span><input required maxLength={180} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="wide"><span>Notes</span><textarea maxLength={500} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What did you notice? Where is it located?" /></label>
      <label><span>Date found</span><input required type="date" value={dateFound} onChange={(event) => setDateFound(event.target.value)} /></label>
      <label><span>Mileage found</span><input type="number" min="0" max="1000000" step="1" inputMode="numeric" value={mileage} onChange={(event) => setMileage(event.target.value)} placeholder="Optional" /></label>
      <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as IssueStatus)}><option value="watching">Watching</option><option value="needs_repair">Needs Repair</option><option value="repaired">Repaired</option></select></label>
      <div className="custom-issue-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add to maintenance"}</button><button className="button button-quiet" type="button" disabled={saving} onClick={() => setOpen(false)}>Cancel</button></div>
    </form>}
  </section>;
}
