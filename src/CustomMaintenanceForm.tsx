import { useState } from "react";
import type { VehicleMaintenanceItemRow } from "./supabase";
import type { CustomTrackedItemInput } from "./useTrackedMaintenance";

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
  onRequireVehicle: () => void;
  onAdd: (input: CustomTrackedItemInput) => Promise<boolean>;
};

export function CustomMaintenanceForm({ enabled, saving, onRequireVehicle, onAdd }: CustomMaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Preventative Maintenance");
  const [customCategory, setCustomCategory] = useState("");
  const [severity, setSeverity] = useState<VehicleMaintenanceItemRow["severity"]>("routine");
  const [planType, setPlanType] = useState<VehicleMaintenanceItemRow["plan_type"]>("none");
  const [mileageInterval, setMileageInterval] = useState("");
  const [timeInterval, setTimeInterval] = useState("");
  const [timeUnit, setTimeUnit] = useState<"months" | "years">("years");
  const [tracksFluid, setTracksFluid] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [workType, setWorkType] = useState<"maintenance" | "repair" | "modification" | "upgrade">("maintenance");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!enabled) return onRequireVehicle();
    const finalCategory = category === "Other / Custom Category" ? customCategory.trim() : category;
    const miles = planType === "mileage" || planType === "both" ? Number(mileageInterval) : null;
    const rawTime = planType === "time" || planType === "both" ? Number(timeInterval) : null;
    const months = rawTime === null ? null : timeUnit === "years" ? rawTime * 12 : rawTime;
    if (!name.trim() || !finalCategory) return setNotice("Name the item and choose a category.");
    if (miles !== null && (!Number.isInteger(miles) || miles < 1 || miles > 500_000)) return setNotice("Enter a mileage interval between 1 and 500,000 miles.");
    if (months !== null && (!Number.isInteger(months) || months < 1 || months > 600)) return setNotice("Enter a time interval between 1 and 600 months.");
    const added = await onAdd({ name, category: finalCategory, severity, planType, mileageInterval: miles, timeIntervalMonths: months, tracksFluid });
    if (added) {
      setName("");
      setPlanType("none");
      setMileageInterval("");
      setTimeInterval("");
      setNotice("Custom maintenance item added to this vehicle.");
      setOpen(false);
    }
  }

  return <section className="custom-maintenance">
	<div><span>Owner-defined work</span><strong>Add custom work</strong><p>Track maintenance, repairs, upgrades, and modifications. Use a recurring interval for scheduled work, or No Scheduled Interval for one-time items.</p></div>
	<button className="button button-quiet" type="button" aria-expanded={open} onClick={() => enabled ? setOpen((value) => !value) : onRequireVehicle()}>{open ? "Close" : "+ Add custom work"}</button>
    {open && <form onSubmit={(event) => void submit(event)}>
      <label>Maintenance item<input value={name} onChange={(event) => setName(event.target.value.slice(0, 180))} maxLength={180} placeholder="e.g. Rear subframe bushings" required /></label>
      <label>Category<select value={category} onChange={(event) => { const value = event.target.value; setCategory(value); setTracksFluid(fluidCategories.has(value)); }}>{MAINTENANCE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      {category === "Other / Custom Category" && <label>Custom category<input value={customCategory} onChange={(event) => setCustomCategory(event.target.value.slice(0, 80))} maxLength={80} required /></label>}
      <label>Importance<select value={severity} onChange={(event) => setSeverity(event.target.value as VehicleMaintenanceItemRow["severity"])}><option value="critical">Safety critical</option><option value="important">Important</option><option value="routine">Routine / cosmetic</option></select></label>
      <fieldset className="custom-plan-options"><legend>Maintenance plan</legend>{([['mileage', 'Mileage'], ['time', 'Time'], ['both', 'Mileage + Time'], ['none', 'No Scheduled Interval']] as const).map(([value, label]) => <label key={value}><input type="radio" name="plan-type" value={value} checked={planType === value} onChange={() => setPlanType(value)} />{label}</label>)}</fieldset>
      {(planType === "mileage" || planType === "both") && <label>Mileage interval<input type="number" min="1" max="500000" step="1" value={mileageInterval} onChange={(event) => setMileageInterval(event.target.value)} placeholder="e.g. 40,000" required /></label>}
      {(planType === "time" || planType === "both") && <div className="custom-time-field"><label>Time interval<input type="number" min="1" max="600" step="1" value={timeInterval} onChange={(event) => setTimeInterval(event.target.value)} required /></label><label>Unit<select value={timeUnit} onChange={(event) => setTimeUnit(event.target.value as "months" | "years")}><option value="months">Months</option><option value="years">Years</option></select></label></div>}
      <label className="custom-fluid-toggle"><input type="checkbox" checked={tracksFluid} onChange={(event) => setTracksFluid(event.target.checked)} />Track fluid or product used</label>
      <div className="custom-maintenance-actions"><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add to maintenance"}</button><button className="button button-quiet" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
      {notice && <p>{notice}</p>}
    </form>}
    {!open && notice && <p>{notice}</p>}
  </section>;
}
