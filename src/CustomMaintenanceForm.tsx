import { useState } from "react";
import type { VehicleMaintenanceItemRow } from "./supabase";

type CustomMaintenanceFormProps = {
  enabled: boolean;
  saving: boolean;
  onRequireVehicle: () => void;
  onAdd: (name: string, category: string, severity: VehicleMaintenanceItemRow["severity"]) => Promise<boolean>;
};

export function CustomMaintenanceForm({ enabled, saving, onRequireVehicle, onAdd }: CustomMaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Interior & cosmetic");
  const [severity, setSeverity] = useState<VehicleMaintenanceItemRow["severity"]>("routine");
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!enabled) {
      onRequireVehicle();
      return;
    }
    if (!name.trim()) {
      setNotice("Name the maintenance or repair item.");
      return;
    }
    const added = await onAdd(name, category, severity);
    if (added) {
      setName("");
      setCategory("Interior & cosmetic");
      setSeverity("routine");
      setNotice("Custom item added to this vehicle’s maintenance plan.");
    }
  }

  return <section className="custom-maintenance">
    <div><span>Something not in the catalog?</span><strong>Add custom maintenance</strong><p>Track repairs, restoration, or cosmetic work such as a headliner or leather repair.</p></div>
    <button className="button button-quiet" type="button" aria-expanded={open} onClick={() => enabled ? setOpen((value) => !value) : onRequireVehicle()}>{open ? "Close" : "Add custom item"}</button>
    {open && <form onSubmit={(event) => void submit(event)}>
      <label>Item name<input value={name} onChange={(event) => setName(event.target.value.slice(0, 180))} maxLength={180} placeholder="e.g. Roof liner replacement" required /></label>
      <label>Category<input value={category} onChange={(event) => setCategory(event.target.value.slice(0, 80))} maxLength={80} placeholder="Interior & cosmetic" required /></label>
      <label>Importance<select value={severity} onChange={(event) => setSeverity(event.target.value as VehicleMaintenanceItemRow["severity"])}><option value="critical">Safety critical</option><option value="important">Important</option><option value="routine">Routine / cosmetic</option></select></label>
      <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add to maintenance"}</button>
      {notice && <p>{notice}</p>}
    </form>}
  </section>;
}
