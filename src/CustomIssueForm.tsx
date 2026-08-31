import { useState } from "react";
import type { VehicleMaintenanceItemRow } from "./supabase";
import { useSessionDraft } from "./useSessionDraft";

type IssueStatus = NonNullable<VehicleMaintenanceItemRow["issue_status"]>;

type CustomIssueFormProps = {
  query: string;
  enabled: boolean;
  saving: boolean;
  defaultMileage: string;
  draftScope: string | null;
  onRequireVehicle: () => void;
  onAdd: (name: string, notes: string, dateFound: string, mileageFound: number | null, status: IssueStatus) => Promise<boolean>;
};

type CustomIssueDraft = {
  open: boolean;
  name: string;
  notes: string;
  dateFound: string;
  mileage: string;
  status: IssueStatus;
};

function createCustomIssueDraft(): CustomIssueDraft {
  return {
    open: false,
    name: "",
    notes: "",
    dateFound: new Date().toISOString().slice(0, 10),
    mileage: "",
    status: "watching",
  };
}

function isCustomIssueDraft(value: unknown): value is CustomIssueDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<CustomIssueDraft>;
  return typeof draft.open === "boolean"
    && typeof draft.name === "string"
    && typeof draft.notes === "string"
    && typeof draft.dateFound === "string"
    && typeof draft.mileage === "string"
    && ["watching", "needs_repair", "repaired"].includes(draft.status ?? "");
}

export function CustomIssueForm({ query, enabled, saving, defaultMileage, draftScope, onRequireVehicle, onAdd }: CustomIssueFormProps) {
  const { draft, isDirty, update, reset } = useSessionDraft({
    scope: draftScope,
    formId: "custom-issue",
    createInitial: createCustomIssueDraft,
    isValid: isCustomIssueDraft,
  });
  const [notice, setNotice] = useState<string | null>(null);

  function setField<Field extends keyof CustomIssueDraft>(field: Field, value: CustomIssueDraft[Field]) {
    update((current) => ({ ...current, [field]: value }));
  }

  function startAdding() {
    if (!enabled) {
      onRequireVehicle();
      return;
    }
    setNotice(null);
    update((current) => ({
      ...current,
      open: true,
      name: current.name || query.trim(),
      mileage: current.mileage || defaultMileage,
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedMileage = draft.mileage.trim() ? Number(draft.mileage) : null;
    if (!draft.name.trim() || (parsedMileage !== null && (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000))) return;
    if (await onAdd(draft.name, draft.notes, draft.dateFound, parsedMileage, draft.status)) {
      const savedName = draft.name.trim();
      reset();
      setNotice(`“${savedName}” was added to this vehicle’s maintenance plan.`);
    }
  }

  function discard() {
    reset();
    setNotice(null);
  }

  return <section className="custom-issue-panel" aria-labelledby="custom-issue-title">
    <div><span>Still not seeing it?</span><h3 id="custom-issue-title">Track your own issue.</h3><p>Add an observation such as a roof liner, leather repair, unusual noise, or vehicle-specific fault. It stays separate from completed service history until you record the work.</p></div>
    {!draft.open && <button className="button button-primary" type="button" onClick={startAdding}>+ Add “{query.trim()}” as a custom issue</button>}
    {notice && <p className="custom-issue-notice" role="status">{notice}</p>}
    {draft.open && <form className="custom-issue-form" data-draft-dirty={isDirty} onSubmit={(event) => void submit(event)}>
      <label><span>Issue name</span><input required maxLength={180} value={draft.name} onChange={(event) => setField("name", event.target.value)} /></label>
      <label className="wide"><span>Notes</span><textarea maxLength={500} rows={3} value={draft.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="What did you notice? Where is it located?" /></label>
      <label><span>Date found</span><input required type="date" value={draft.dateFound} onChange={(event) => setField("dateFound", event.target.value)} /></label>
      <label><span>Mileage found</span><input type="number" min="0" max="1000000" step="1" inputMode="numeric" value={draft.mileage} onChange={(event) => setField("mileage", event.target.value)} placeholder="Optional" /></label>
      <label><span>Status</span><select value={draft.status} onChange={(event) => setField("status", event.target.value as IssueStatus)}><option value="watching">Watching</option><option value="needs_repair">Needs Repair</option><option value="repaired">Repaired</option></select></label>
      <div className="custom-issue-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add to maintenance"}</button><button className="button button-quiet" type="button" disabled={saving} onClick={discard}>Cancel and discard</button></div>
    </form>}
  </section>;
}
