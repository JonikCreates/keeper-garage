import { useMemo, useState } from "react";
import type { MaintenanceRecordRow } from "./supabase";
import type { MaintenanceRecordInput } from "./useMaintenanceRecords";
import { pageHref } from "./routing";
import { useSessionDraft } from "./useSessionDraft";

type MaintenanceRecordPanelProps = {
  item: { slug: string; name: string };
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
};

const maintenanceDraftFields: Array<keyof MaintenanceRecordDraft> = [
  "workPerformed", "mileage", "completedAt", "notes", "fluidBrand", "fluidProduct", "fluidType",
  "fluidViscosity", "fluidSpecification", "fluidQuantity", "fluidUnit", "filterProduct", "cost",
];

function isMaintenanceRecordDraft(value: unknown): value is MaintenanceRecordDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return maintenanceDraftFields.every((field) => typeof candidate[field] === "string");
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

export function MaintenanceRecordPanel({ item, records, tracksFluid, signedIn, isGuest, hasSavedVehicle, defaultMileage, draftScope, saving, onOpenAuth, onAdd }: MaintenanceRecordPanelProps) {
  const { draft, isDirty, update, reset } = useSessionDraft({
    scope: draftScope,
    formId: `maintenance-record:${item.slug}`,
    createInitial: () => createMaintenanceDraft(defaultMileage),
    isValid: isMaintenanceRecordDraft,
  });
  const [notice, setNotice] = useState<string | null>(null);
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
    const parsedCost = draft.cost.trim() ? Math.round(Number(draft.cost) * 100) : null;
    if (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000) return setNotice("Enter the mileage shown when the work was completed.");
    if (!draft.workPerformed.trim()) return setNotice("Describe what work was completed.");
    if (parsedQuantity !== null && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 10_000)) return setNotice("Enter a valid fluid quantity.");
    if (parsedCost !== null && (!/^\d{1,7}(\.\d{1,2})?$/.test(draft.cost.trim()) || parsedCost < 0 || parsedCost > 100_000_000)) return setNotice("Enter a valid cost up to $1,000,000.00.");
    const saved = await onAdd({
      workPerformed: draft.workPerformed.trim(), mileage: parsedMileage, completedAt: draft.completedAt, notes: optional(draft.notes),
      fluidBrand: tracksFluid ? optional(draft.fluidBrand) : null, fluidProduct: tracksFluid ? optional(draft.fluidProduct) : null,
      fluidType: tracksFluid ? optional(draft.fluidType) : null, fluidViscosity: tracksFluid ? optional(draft.fluidViscosity) : null,
      fluidSpecification: tracksFluid ? optional(draft.fluidSpecification) : null, fluidQuantity: tracksFluid ? parsedQuantity : null,
      fluidUnit: tracksFluid && parsedQuantity !== null ? optional(draft.fluidUnit) : null, filterProduct: tracksFluid ? optional(draft.filterProduct) : null,
      costCents: parsedCost,
    });
    if (saved) {
      reset(createMaintenanceDraft(""));
      setNotice("Maintenance added to this vehicle’s history.");
    }
  }

  function clearDraft() {
    reset(createMaintenanceDraft(defaultMileage));
    setNotice(null);
  }

  return <section className="maintenance-record-panel" aria-label={`${item.name} service history`}>
    <header><div><span>Log maintenance</span><strong>{records.length ? `Last completed ${displayDate(records[0].completed_at)}` : "No completed record yet"}</strong></div><a className="button button-quiet" href="#maintenance-history">View history</a></header>
    {!signedIn && <div className="maintenance-record-gate"><p>A Keeper Profile is required to save completed work, mileage, cost, fluids, and notes.</p><button className="button button-primary" type="button" onClick={onOpenAuth}>Create Account or Log In</button></div>}
    {signedIn && !hasSavedVehicle && <div className="maintenance-record-gate"><p>Save this vehicle in My Garage before recording completed work.</p><a className="button button-primary" href={pageHref("garage")}>Save this vehicle</a></div>}
    {signedIn && hasSavedVehicle && <>
      {isGuest && <p className="maintenance-guest-note">Guest Mode is demo-only. Sign in before recording personal service history.</p>}
      <form className="maintenance-record-form simplified" data-draft-dirty={isDirty} onSubmit={(event) => void submit(event)}>
        <label>Work completed<input aria-label={`${item.name} completed work`} value={draft.workPerformed} onChange={(event) => setField("workPerformed", event.target.value.slice(0, 240))} maxLength={240} placeholder="What was replaced or serviced?" required /></label>
        <label>Mileage<input aria-label={`${item.name} completed mileage`} value={draft.mileage} onChange={(event) => setField("mileage", event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="82,450" required /></label>
        <label>Date<input aria-label={`${item.name} completed date`} type="date" value={draft.completedAt} max={localDateValue()} onChange={(event) => setField("completedAt", event.target.value)} required /></label>
        <label>Cost (USD)<span className="currency-input"><b aria-hidden="true">$</b><input aria-label={`${item.name} completed cost`} value={draft.cost} onChange={(event) => setField("cost", event.target.value.replace(/[^\d.]/g, "").slice(0, 10))} inputMode="decimal" placeholder="0.00" /></span></label>
        {tracksFluid && <fieldset className="fluid-entry-fields"><legend>Fluid / product used <small>Optional</small></legend>
          {previousFluid && <button className="previous-fluid" type="button" onClick={usePreviousFluid}><span>Previously used</span><strong>{fluidLabel(previousFluid)}</strong></button>}
          <label>Brand<input value={draft.fluidBrand} maxLength={100} onChange={(event) => setField("fluidBrand", event.target.value)} placeholder="Mobil 1" /></label>
          <label>Product<input value={draft.fluidProduct} maxLength={160} onChange={(event) => setField("fluidProduct", event.target.value)} placeholder="European Car Formula" /></label>
          <label>Viscosity<input value={draft.fluidViscosity} maxLength={60} onChange={(event) => setField("fluidViscosity", event.target.value)} placeholder="0W-40" /></label>
          <label>Fluid type / mixture<input value={draft.fluidType} maxLength={100} onChange={(event) => setField("fluidType", event.target.value)} placeholder="50/50 coolant" /></label>
          <label>OEM specification<input value={draft.fluidSpecification} maxLength={120} onChange={(event) => setField("fluidSpecification", event.target.value)} placeholder="BMW LL-01" /></label>
          <label>Quantity<input type="number" min="0" max="10000" step="0.01" value={draft.fluidQuantity} onChange={(event) => setField("fluidQuantity", event.target.value)} placeholder="5.3" /></label>
          <label>Unit<select value={draft.fluidUnit} onChange={(event) => setField("fluidUnit", event.target.value)}><option>Quarts</option><option>Liters</option><option>Gallons</option><option>Ounces</option><option>Milliliters</option><option>Other</option></select></label>
          <label>Filter / related product<input value={draft.filterProduct} maxLength={120} onChange={(event) => setField("filterProduct", event.target.value)} placeholder="MANN HU816x" /></label>
        </fieldset>}
        <label className="maintenance-notes-field">Notes<textarea value={draft.notes} maxLength={1000} rows={3} onChange={(event) => setField("notes", event.target.value)} placeholder="Optional notes…" /></label>
        <div className="maintenance-record-actions"><button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : "Save maintenance"}</button>{isDirty && <button className="button button-quiet" disabled={saving} type="button" onClick={clearDraft}>Clear draft</button>}</div>
      </form>
      {notice && <p className="maintenance-record-notice">{notice}</p>}
    </>}
  </section>;
}
