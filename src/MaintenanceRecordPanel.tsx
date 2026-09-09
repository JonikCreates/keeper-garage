import { formatUsdCents, hasSplitCosts, parseCostCents, serializeMaintenanceCosts } from "./maintenanceCosts";
import { useMemo, useState } from "react";
import type { MaintenanceRecordRow } from "./supabase";
import type { MaintenanceRecordInput } from "./useMaintenanceRecords";
import { pageHref } from "./routing";
import { useSessionDraft } from "./useSessionDraft";

type MaintenanceRecordPanelProps = {
  item: { slug: string; name: string };
  editingRecord?: MaintenanceRecordRow;
  onCancel?: () => void;
  records: MaintenanceRecordRow[];
  tracksFluid: boolean;
  signedIn: boolean;
  isGuest: boolean;
  hasSavedVehicle: boolean;
  defaultMileage: string;
  draftScope: string | null;
  saving: boolean;
  onOpenAuth: () => void;
  onAdd: (input: MaintenanceRecordInput) => Promise<boolean>;
};

type MaintenanceRecordDraft = {
  workPerformed: string;
  mileage: string;
  completedAt: string;
  notes: string;
  fluidBrand: string;
  fluidProduct: string;
  fluidType: string;
  fluidViscosity: string;
  fluidSpecification: string;
  fluidQuantity: string;
  fluidUnit: string;
  filterProduct: string;
  cost: string;
  partsCost?: string;
  laborCost?: string;
};

const maintenanceDraftFields: Array<keyof MaintenanceRecordDraft> = [
  "workPerformed", "mileage", "completedAt", "notes", "fluidBrand", "fluidProduct", "fluidType",
  "fluidViscosity", "fluidSpecification", "fluidQuantity", "fluidUnit", "filterProduct", "cost",
];

function isMaintenanceRecordDraft(value: unknown): value is MaintenanceRecordDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return maintenanceDraftFields.every((field) => typeof candidate[field] === "string")
    && ["partsCost", "laborCost"].every((field) => candidate[field] === undefined || typeof candidate[field] === "string");
}

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function createMaintenanceDraft(defaultMileage: string): MaintenanceRecordDraft {
  return {
    workPerformed: "",
    mileage: defaultMileage,
    completedAt: localDateValue(),
    notes: "",
    fluidBrand: "",
    fluidProduct: "",
    fluidType: "",
    fluidViscosity: "",
    fluidSpecification: "",
    fluidQuantity: "",
    fluidUnit: "Quarts",
    filterProduct: "",
    cost: "",
    partsCost: "",
    laborCost: "",
  };
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function optional(value: string) {
  return value.trim() || null;
}

function fluidLabel(record: MaintenanceRecordRow) {
  return [record.fluid_brand, record.fluid_product, record.fluid_viscosity ?? record.fluid_type].filter(Boolean).join(" · ");
}

export function MaintenanceRecordPanel({ editingRecord, onCancel, item, records, tracksFluid, signedIn, isGuest, hasSavedVehicle, defaultMileage, draftScope, saving, onOpenAuth, onAdd }: MaintenanceRecordPanelProps) {
  const { draft, isDirty, update, reset } = useSessionDraft({
    scope: draftScope,
    formId: editingRecord ? `maintenance-edit:${editingRecord.id}` : `maintenance-record:${item.slug}`,
    createInitial: () => editingRecord ? {
      workPerformed: editingRecord.work_performed, mileage: String(editingRecord.mileage), completedAt: editingRecord.completed_at,
      notes: editingRecord.notes ?? "", fluidBrand: editingRecord.fluid_brand ?? "", fluidProduct: editingRecord.fluid_product ?? "",
      fluidType: editingRecord.fluid_type ?? "", fluidViscosity: editingRecord.fluid_viscosity ?? "", fluidSpecification: editingRecord.fluid_specification ?? "",
      fluidQuantity: editingRecord.fluid_quantity?.toString() ?? "", fluidUnit: editingRecord.fluid_unit ?? "Quarts", filterProduct: editingRecord.filter_product ?? "",
      cost: hasSplitCosts(editingRecord) || editingRecord.cost_cents === null ? "" : (editingRecord.cost_cents / 100).toFixed(2),
      partsCost: editingRecord.parts_cost_cents == null ? "" : (editingRecord.parts_cost_cents / 100).toFixed(2),
      laborCost: editingRecord.labor_cost_cents == null ? "" : (editingRecord.labor_cost_cents / 100).toFixed(2),
    } : createMaintenanceDraft(defaultMileage),
    isValid: isMaintenanceRecordDraft,
  });
  const [notice, setNotice] = useState<string | null>(null);
  const legacyCost = Boolean(editingRecord && !hasSplitCosts(editingRecord)) || (!editingRecord && Boolean(draft.cost));
  let previewTotal: number | null = null;
  try { previewTotal = legacyCost ? parseCostCents(draft.cost) : (parseCostCents(draft.partsCost ?? "") ?? 0) + (parseCostCents(draft.laborCost ?? "") ?? 0); } catch { /* Validation appears on submit. */ }
  const previousFluid = useMemo(() => records.find((record) => fluidLabel(record)), [records]);

  function setField<Field extends keyof MaintenanceRecordDraft>(field: Field, value: MaintenanceRecordDraft[Field]) {
    update((current) => ({ ...current, [field]: value }));
  }

  function usePreviousFluid() {
    if (!previousFluid) return;
    update((current) => ({
      ...current,
      fluidBrand: previousFluid.fluid_brand ?? "",
      fluidProduct: previousFluid.fluid_product ?? "",
      fluidType: previousFluid.fluid_type ?? "",
      fluidViscosity: previousFluid.fluid_viscosity ?? "",
      fluidSpecification: previousFluid.fluid_specification ?? "",
      fluidQuantity: previousFluid.fluid_quantity?.toString() ?? "",
      fluidUnit: previousFluid.fluid_unit ?? "Quarts",
      filterProduct: previousFluid.filter_product ?? "",
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const parsedMileage = Number(draft.mileage);
    const parsedQuantity = draft.fluidQuantity.trim() ? Number(draft.fluidQuantity) : null;
    let costs: ReturnType<typeof serializeMaintenanceCosts>;
    try {
      costs = serializeMaintenanceCosts({
        costCents: legacyCost ? parseCostCents(draft.cost) : null,
        partsCostCents: legacyCost ? null : parseCostCents(draft.partsCost ?? "") ?? 0,
        laborCostCents: legacyCost ? null : parseCostCents(draft.laborCost ?? "") ?? 0,
      });
    } catch (error) { return setNotice(error instanceof Error ? error.message : "Enter valid maintenance costs."); }
    if (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000) return setNotice("Enter the mileage shown when the work was completed.");
    if (!draft.workPerformed.trim()) return setNotice("Describe what work was completed.");
    if (parsedQuantity !== null && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 10_000)) return setNotice("Enter a valid fluid quantity.");
    const saved = await onAdd({
      workPerformed: draft.workPerformed.trim(), mileage: parsedMileage, completedAt: draft.completedAt, notes: optional(draft.notes),
      fluidBrand: tracksFluid ? optional(draft.fluidBrand) : null, fluidProduct: tracksFluid ? optional(draft.fluidProduct) : null,
      fluidType: tracksFluid ? optional(draft.fluidType) : null, fluidViscosity: tracksFluid ? optional(draft.fluidViscosity) : null,
      fluidSpecification: tracksFluid ? optional(draft.fluidSpecification) : null, fluidQuantity: tracksFluid ? parsedQuantity : null,
      fluidUnit: tracksFluid && parsedQuantity !== null ? optional(draft.fluidUnit) : null, filterProduct: tracksFluid ? optional(draft.filterProduct) : null,
      costCents: costs.cost_cents, partsCostCents: costs.parts_cost_cents, laborCostCents: costs.labor_cost_cents,
    });
    if (saved) {
      reset(createMaintenanceDraft(""));
      setNotice(editingRecord ? "Maintenance updated." : "Maintenance added to this vehicle’s history.");
      if (editingRecord) onCancel?.();
    }
  }

  function clearDraft() {
    reset(createMaintenanceDraft(defaultMileage));
    setNotice(null);
  }

  return <section className="maintenance-record-panel" aria-label={`${item.name} service history`}>
    <header><div><span>{editingRecord ? "Edit maintenance" : "Log maintenance"}</span><strong>{records.length ? `Last completed ${displayDate(records[0].completed_at)}` : "No completed record yet"}</strong></div><a className="button button-quiet" href="#maintenance-history">View history</a></header>
    {!signedIn && <div className="maintenance-record-gate"><p>A Keeper Profile is required to save completed work, mileage, cost, fluids, and notes.</p><button className="button button-primary" type="button" onClick={onOpenAuth}>Create Account or Log In</button></div>}
    {signedIn && !hasSavedVehicle && <div className="maintenance-record-gate"><p>Save this vehicle in My Garage before recording completed work.</p><a className="button button-primary" href={pageHref("garage")}>Save this vehicle</a></div>}
    {signedIn && hasSavedVehicle && <>
      {isGuest && <p className="maintenance-guest-note">Guest Mode is demo-only. Sign in before recording personal service history.</p>}
      <form className="maintenance-record-form simplified" data-draft-dirty={isDirty} onSubmit={(event) => void submit(event)}>
        <label>Work completed<input aria-label={`${item.name} completed work`} value={draft.workPerformed} onChange={(event) => setField("workPerformed", event.target.value.slice(0, 240))} maxLength={240} placeholder="What was replaced or serviced?" required /></label>
        <label>Mileage<input aria-label={`${item.name} completed mileage`} value={draft.mileage} onChange={(event) => setField("mileage", event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="82,450" required /></label>
        <label>Date<input aria-label={`${item.name} completed date`} type="date" value={draft.completedAt} max={localDateValue()} onChange={(event) => setField("completedAt", event.target.value)} required /></label>
        <fieldset className="maintenance-cost-fields"><legend>Service cost</legend>
        {legacyCost ? <label>Legacy total (USD)<span className="currency-input"><b aria-hidden="true">$</b><input aria-label="Legacy total cost" value={draft.cost} onChange={(event) => setField("cost", event.target.value)} inputMode="decimal" /></span><small>Historical total; parts and labor were not recorded.</small></label> : <>
          <label>Parts Cost (USD)<span className="currency-input"><b aria-hidden="true">$</b><input aria-label="Parts Cost" value={draft.partsCost ?? ""} onChange={(event) => setField("partsCost", event.target.value)} inputMode="decimal" placeholder="0.00" /></span></label>
          <label>Labor Cost (USD)<span className="currency-input"><b aria-hidden="true">$</b><input aria-label="Labor Cost" value={draft.laborCost ?? ""} onChange={(event) => setField("laborCost", event.target.value)} inputMode="decimal" placeholder="0.00" /></span></label>
        </>}
        <p className="maintenance-cost-total" aria-live="polite">Total Cost: <strong>{previewTotal === null ? "—" : formatUsdCents(previewTotal)}</strong></p>
        </fieldset>
        {tracksFluid && <fieldset className="fluid-entry-fields"><legend>Fluid / product used <small>Optional</small></legend>
          {previousFluid && <button className="previous-fluid" type="button" onClick={usePreviousFluid}><span>Previously used</span><strong>{fluidLabel(previousFluid)}</strong></button>}
          <label>Brand<input value={draft.fluidBrand} maxLength={100} onChange={(event) => setField("fluidBrand", event.target.value)} placeholder="Mobil 1" /></label>
          <label>Product<input value={draft.fluidProduct} maxLength={160} onChange={(event) => setField("fluidProduct", event.target.value)} placeholder="European Car Formula" /></label>
          <label>Viscosity<input value={draft.fluidViscosity} maxLength={60} onChange={(event) => setField("fluidViscosity", event.target.value)} placeholder="0W-40" /></label>
          <label>Fluid type / mixture<input value={draft.fluidType} maxLength={100} onChange={(event) => setField("fluidType", event.target.value)} placeholder="50/50 coolant" /></label>
          <label>OEM specification<input value={draft.fluidSpecification} maxLength={120} onChange={(event) => setField("fluidSpecification", event.target.value)} placeholder="BMW LL-01" /></label>
          <label>Quantity<input type="number" min="0" max="10000" step="0.01" value={draft.fluidQuantity} onChange={(event) => setField("fluidQuantity", event.target.value)} placeholder="5.3" /></label>
          <label>Unit<select value={draft.fluidUnit} onChange={(event) => setField("fluidUnit", event.target.value)}>{!["Quarts", "Liters", "Gallons", "Ounces", "Milliliters", "Other"].includes(draft.fluidUnit) && <option>{draft.fluidUnit}</option>}<option>Quarts</option><option>Liters</option><option>Gallons</option><option>Ounces</option><option>Milliliters</option><option>Other</option></select></label>
          <label>Filter / related product<input value={draft.filterProduct} maxLength={120} onChange={(event) => setField("filterProduct", event.target.value)} placeholder="MANN HU816x" /></label>
        </fieldset>}
        <label className="maintenance-notes-field">Notes<textarea value={draft.notes} maxLength={1000} rows={3} onChange={(event) => setField("notes", event.target.value)} placeholder="Optional notes…" /></label>
        <div className="maintenance-record-actions"><button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : "Save maintenance"}</button>{editingRecord && <button className="button button-quiet" disabled={saving} type="button" onClick={onCancel}>Cancel editing</button>}{isDirty && !editingRecord && <button className="button button-quiet" disabled={saving} type="button" onClick={clearDraft}>Clear draft</button>}</div>
      </form>
      {notice && <p className="maintenance-record-notice">{notice}</p>}
    </>}
  </section>;
}
