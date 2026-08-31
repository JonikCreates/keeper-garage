import { useState } from "react";
import type { VehicleMaintenanceItemRow } from "./supabase";
import type { CustomTrackedItemInput } from "./useTrackedMaintenance";
import { useSessionDraft } from "./useSessionDraft";

export const MAINTENANCE_CATEGORIES = [
  "Engine", "Engine Oil / Lubrication", "Cooling System", "Fuel System", "Ignition", "Intake / Air", "Exhaust / Emissions",
  "Manual Transmission", "Automatic Transmission", "Clutch", "Differential", "Transfer Case / AWD", "Drivetrain", "Brakes",
  "Suspension", "Steering", "Wheels / Tires", "Electrical", "Battery / Charging", "HVAC / A/C", "Belts / Pulleys",
  "Timing System", "Gaskets / Seals", "Fluids", "Filters", "Body / Exterior", "Interior", "Convertible / Sunroof", "Chassis",
  "Safety Systems", "Preventative Maintenance", "Inspection", "Other / Custom Category",
] as const;

const fluidCategories = new Set(["Engine Oil / Lubrication", "Cooling System", "Manual Transmission", "Automatic Transmission", "Clutch", "Differential", "Transfer Case / AWD", "Brakes", "Steering", "Fluids"]);

type CustomMaintenanceFormProps = {
  enabled: boolean;
  saving: boolean;
  draftScope: string | null;
  onRequireVehicle: () => void;
  onAdd: (input: CustomTrackedItemInput) => Promise<boolean>;
};

type CustomMaintenanceDraft = {
  open: boolean;
  name: string;
  category: string;
  customCategory: string;
  severity: VehicleMaintenanceItemRow["severity"];
  planType: VehicleMaintenanceItemRow["plan_type"];
  mileageInterval: string;
  timeInterval: string;
  timeUnit: "months" | "years";
  tracksFluid: boolean;
};

function createCustomMaintenanceDraft(): CustomMaintenanceDraft {
  return {
    open: false,
    name: "",
    category: "Preventative Maintenance",
    customCategory: "",
    severity: "routine",
    planType: "none",
    mileageInterval: "",
    timeInterval: "",
    timeUnit: "years",
    tracksFluid: false,
  };
}

function isCustomMaintenanceDraft(value: unknown): value is CustomMaintenanceDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<CustomMaintenanceDraft>;
  return typeof draft.open === "boolean"
    && typeof draft.name === "string"
    && typeof draft.category === "string"
    && typeof draft.customCategory === "string"
    && ["critical", "important", "routine"].includes(draft.severity ?? "")
    && ["mileage", "time", "both", "none"].includes(draft.planType ?? "")
    && typeof draft.mileageInterval === "string"
    && typeof draft.timeInterval === "string"
    && ["months", "years"].includes(draft.timeUnit ?? "")
    && typeof draft.tracksFluid === "boolean";
}

export function CustomMaintenanceForm({ enabled, saving, draftScope, onRequireVehicle, onAdd }: CustomMaintenanceFormProps) {
  const { draft, isDirty, update, reset } = useSessionDraft({
    scope: draftScope,
    formId: "custom-maintenance",
    createInitial: createCustomMaintenanceDraft,
    isValid: isCustomMaintenanceDraft,
  });
  const [notice, setNotice] = useState<string | null>(null);

  function setField<Field extends keyof CustomMaintenanceDraft>(field: Field, value: CustomMaintenanceDraft[Field]) {
    update((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!enabled) return onRequireVehicle();
    const finalCategory = draft.category === "Other / Custom Category" ? draft.customCategory.trim() : draft.category;
    const miles = draft.planType === "mileage" || draft.planType === "both" ? Number(draft.mileageInterval) : null;
    const rawTime = draft.planType === "time" || draft.planType === "both" ? Number(draft.timeInterval) : null;
    const months = rawTime === null ? null : draft.timeUnit === "years" ? rawTime * 12 : rawTime;
    if (!draft.name.trim() || !finalCategory) return setNotice("Name the item and choose a category.");
    if (miles !== null && (!Number.isInteger(miles) || miles < 1 || miles > 500_000)) return setNotice("Enter a mileage interval between 1 and 500,000 miles.");
    if (months !== null && (!Number.isInteger(months) || months < 1 || months > 600)) return setNotice("Enter a time interval between 1 and 600 months.");
    const added = await onAdd({ name: draft.name, category: finalCategory, severity: draft.severity, planType: draft.planType, mileageInterval: miles, timeIntervalMonths: months, tracksFluid: draft.tracksFluid });
    if (added) {
      reset();
      setNotice("Custom maintenance item added to this vehicle.");
    }
  }

  function discard() {
    reset();
    setNotice(null);
  }

  return <section className="custom-maintenance">
    <div><span>Owner-defined work</span><strong>Add custom work</strong><p>Track maintenance, repairs, upgrades, and modifications. Use a recurring interval for scheduled work, or No Scheduled Interval for one-time items.</p></div>
    <button className="button button-quiet" type="button" aria-expanded={draft.open} onClick={() => enabled ? setField("open", !draft.open) : onRequireVehicle()}>{draft.open ? "Close" : "+ Add custom work"}</button>
    {draft.open && <form data-draft-dirty={isDirty} onSubmit={(event) => void submit(event)}>
      <label>Maintenance item<input value={draft.name} onChange={(event) => setField("name", event.target.value.slice(0, 180))} maxLength={180} placeholder="e.g. Rear subframe bushings" required /></label>
      <label>Category<select value={draft.category} onChange={(event) => { const value = event.target.value; update((current) => ({ ...current, category: value, tracksFluid: fluidCategories.has(value) })); }}>{MAINTENANCE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      {draft.category === "Other / Custom Category" && <label>Custom category<input value={draft.customCategory} onChange={(event) => setField("customCategory", event.target.value.slice(0, 80))} maxLength={80} required /></label>}
      <label>Importance<select value={draft.severity} onChange={(event) => setField("severity", event.target.value as VehicleMaintenanceItemRow["severity"])}><option value="critical">Safety critical</option><option value="important">Important</option><option value="routine">Routine / cosmetic</option></select></label>
      <fieldset className="custom-plan-options"><legend>Maintenance plan</legend>{([['mileage', 'Mileage'], ['time', 'Time'], ['both', 'Mileage + Time'], ['none', 'No Scheduled Interval']] as const).map(([value, label]) => <label key={value}><input type="radio" name="plan-type" value={value} checked={draft.planType === value} onChange={() => setField("planType", value)} />{label}</label>)}</fieldset>
      {(draft.planType === "mileage" || draft.planType === "both") && <label>Mileage interval<input type="number" min="1" max="500000" step="1" value={draft.mileageInterval} onChange={(event) => setField("mileageInterval", event.target.value)} placeholder="e.g. 40,000" required /></label>}
      {(draft.planType === "time" || draft.planType === "both") && <div className="custom-time-field"><label>Time interval<input type="number" min="1" max="600" step="1" value={draft.timeInterval} onChange={(event) => setField("timeInterval", event.target.value)} required /></label><label>Unit<select value={draft.timeUnit} onChange={(event) => setField("timeUnit", event.target.value as "months" | "years")}><option value="months">Months</option><option value="years">Years</option></select></label></div>}
      <label className="custom-fluid-toggle"><input type="checkbox" checked={draft.tracksFluid} onChange={(event) => setField("tracksFluid", event.target.checked)} />Track fluid or product used</label>
      <div className="custom-maintenance-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add to maintenance"}</button><button className="button button-quiet" type="button" disabled={saving} onClick={discard}>Cancel and discard</button></div>
      {notice && <p>{notice}</p>}
    </form>}
    {!draft.open && notice && <p>{notice}</p>}
  </section>;
}
