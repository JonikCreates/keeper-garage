import { useMemo, useState } from "react";
import type { MaintenanceRecordRow } from "./supabase";
import type { MaintenanceRecordInput } from "./useMaintenanceRecords";
import { pageHref } from "./routing";

type MaintenanceRecordPanelProps = {
  item: { slug: string; name: string };
  records: MaintenanceRecordRow[];
  tracksFluid: boolean;
  signedIn: boolean;
  isGuest: boolean;
  hasSavedVehicle: boolean;
  defaultMileage: string;
  saving: boolean;
  onOpenAuth: () => void;
  onAdd: (input: MaintenanceRecordInput) => Promise<boolean>;
};

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
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
export function MaintenanceRecordPanel({ item, records, tracksFluid, signedIn, isGuest, hasSavedVehicle, defaultMileage, saving, onOpenAuth, onAdd }: MaintenanceRecordPanelProps) {
  const [workPerformed, setWorkPerformed] = useState("");
  const [mileage, setMileage] = useState(defaultMileage);
  const [completedAt, setCompletedAt] = useState(localDateValue);
  const [notes, setNotes] = useState("");
  const [fluidBrand, setFluidBrand] = useState("");
  const [fluidProduct, setFluidProduct] = useState("");
  const [fluidType, setFluidType] = useState("");
  const [fluidViscosity, setFluidViscosity] = useState("");
  const [fluidSpecification, setFluidSpecification] = useState("");
  const [fluidQuantity, setFluidQuantity] = useState("");
  const [fluidUnit, setFluidUnit] = useState("Quarts");
  const [filterProduct, setFilterProduct] = useState("");
  const [cost, setCost] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const previousFluid = useMemo(() => records.find((record) => fluidLabel(record)), [records]);

  function usePreviousFluid() {
    if (!previousFluid) return;
    setFluidBrand(previousFluid.fluid_brand ?? "");
    setFluidProduct(previousFluid.fluid_product ?? "");
    setFluidType(previousFluid.fluid_type ?? "");
    setFluidViscosity(previousFluid.fluid_viscosity ?? "");
    setFluidSpecification(previousFluid.fluid_specification ?? "");
    setFluidQuantity(previousFluid.fluid_quantity?.toString() ?? "");
    setFluidUnit(previousFluid.fluid_unit ?? "Quarts");
    setFilterProduct(previousFluid.filter_product ?? "");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const parsedMileage = Number(mileage);
    const parsedQuantity = fluidQuantity.trim() ? Number(fluidQuantity) : null;
    const parsedCost = cost.trim() ? Math.round(Number(cost) * 100) : null;
    if (!Number.isInteger(parsedMileage) || parsedMileage < 0 || parsedMileage > 1_000_000) return setNotice("Enter the mileage shown when the work was completed.");
    if (!workPerformed.trim()) return setNotice("Describe what work was completed.");
    if (parsedQuantity !== null && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 10_000)) return setNotice("Enter a valid fluid quantity.");
    if (parsedCost !== null && (!/^\d{1,7}(\.\d{1,2})?$/.test(cost.trim()) || parsedCost < 0 || parsedCost > 100_000_000)) return setNotice("Enter a valid cost up to $1,000,000.00.");
    const saved = await onAdd({
      workPerformed: workPerformed.trim(), mileage: parsedMileage, completedAt, notes: optional(notes),
      fluidBrand: tracksFluid ? optional(fluidBrand) : null, fluidProduct: tracksFluid ? optional(fluidProduct) : null,
      fluidType: tracksFluid ? optional(fluidType) : null, fluidViscosity: tracksFluid ? optional(fluidViscosity) : null,
      fluidSpecification: tracksFluid ? optional(fluidSpecification) : null, fluidQuantity: tracksFluid ? parsedQuantity : null,
      fluidUnit: tracksFluid && parsedQuantity !== null ? optional(fluidUnit) : null, filterProduct: tracksFluid ? optional(filterProduct) : null,
      costCents: parsedCost,
    });
    if (saved) {
      setWorkPerformed(""); setMileage(""); setCost(""); setNotes("");
      setNotice("Maintenance added to this vehicle’s history.");
    }
  }

  return <section className="maintenance-record-panel" aria-label={`${item.name} service history`}>
    <header><div><span>Log maintenance</span><strong>{records.length ? `Last completed ${displayDate(records[0].completed_at)}` : "No completed record yet"}</strong></div><a className="button button-quiet" href="#maintenance-history">View history</a></header>
    {!signedIn && <div className="maintenance-record-gate"><p>A Keeper Profile is required to save completed work, mileage, cost, fluids, and notes.</p><button className="button button-primary" type="button" onClick={onOpenAuth}>Create Account or Log In</button></div>}
    {signedIn && !hasSavedVehicle && <div className="maintenance-record-gate"><p>Save this vehicle in My Garage before recording completed work.</p><a className="button button-primary" href={pageHref("garage")}>Save this vehicle</a></div>}
    {signedIn && hasSavedVehicle && <>
      {isGuest && <p className="maintenance-guest-note">Guest Mode is demo-only. Sign in before recording personal service history.</p>}
      <form className="maintenance-record-form simplified" onSubmit={(event) => void submit(event)}>
        <label>Work completed<input aria-label={`${item.name} completed work`} value={workPerformed} onChange={(event) => setWorkPerformed(event.target.value.slice(0, 240))} maxLength={240} placeholder="What was replaced or serviced?" required /></label>
        <label>Mileage<input aria-label={`${item.name} completed mileage`} value={mileage} onChange={(event) => setMileage(event.target.value.replace(/\D/g, "").slice(0, 7))} inputMode="numeric" placeholder="82,450" required /></label>
        <label>Date<input aria-label={`${item.name} completed date`} type="date" value={completedAt} max={localDateValue()} onChange={(event) => setCompletedAt(event.target.value)} required /></label>
        <label>Cost (USD)<span className="currency-input"><b aria-hidden="true">$</b><input aria-label={`${item.name} completed cost`} value={cost} onChange={(event) => setCost(event.target.value.replace(/[^\d.]/g, "").slice(0, 10))} inputMode="decimal" placeholder="0.00" /></span></label>
        {tracksFluid && <fieldset className="fluid-entry-fields"><legend>Fluid / product used <small>Optional</small></legend>
          {previousFluid && <button className="previous-fluid" type="button" onClick={usePreviousFluid}><span>Previously used</span><strong>{fluidLabel(previousFluid)}</strong></button>}
          <label>Brand<input value={fluidBrand} maxLength={100} onChange={(event) => setFluidBrand(event.target.value)} placeholder="Mobil 1" /></label>
          <label>Product<input value={fluidProduct} maxLength={160} onChange={(event) => setFluidProduct(event.target.value)} placeholder="European Car Formula" /></label>
          <label>Viscosity<input value={fluidViscosity} maxLength={60} onChange={(event) => setFluidViscosity(event.target.value)} placeholder="0W-40" /></label>
          <label>Fluid type / mixture<input value={fluidType} maxLength={100} onChange={(event) => setFluidType(event.target.value)} placeholder="50/50 coolant" /></label>
          <label>OEM specification<input value={fluidSpecification} maxLength={120} onChange={(event) => setFluidSpecification(event.target.value)} placeholder="BMW LL-01" /></label>
          <label>Quantity<input type="number" min="0" max="10000" step="0.01" value={fluidQuantity} onChange={(event) => setFluidQuantity(event.target.value)} placeholder="5.3" /></label>
          <label>Unit<select value={fluidUnit} onChange={(event) => setFluidUnit(event.target.value)}><option>Quarts</option><option>Liters</option><option>Gallons</option><option>Ounces</option><option>Milliliters</option><option>Other</option></select></label>
          <label>Filter / related product<input value={filterProduct} maxLength={120} onChange={(event) => setFilterProduct(event.target.value)} placeholder="MANN HU816x" /></label>
        </fieldset>}
        <label className="maintenance-notes-field">Notes<textarea value={notes} maxLength={1000} rows={3} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes…" /></label>
        <button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : "Save maintenance"}</button>
      </form>
      {notice && <p className="maintenance-record-notice">{notice}</p>}
    </>}
  </section>;
}
