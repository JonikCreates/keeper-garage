import { useEffect, useRef, useState } from "react";
import type { VehicleRemovalSummary, VehicleRow } from "./supabase";

type VehicleRemovalDialogProps = {
  vehicle: VehicleRow;
  summary: VehicleRemovalSummary | null;
  loading: boolean;
  removing: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function VehicleRemovalDialog({ vehicle, summary, loading, removing, onCancel, onConfirm }: VehicleRemovalDialogProps) {
  const [understood, setUnderstood] = useState(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const title = `${vehicle.model_year} ${vehicle.brand} ${vehicle.trim}`;
  const hasRecords = Boolean(summary?.total_record_count);

  useEffect(() => {
    cancelButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !removing) onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel, removing]);

  return <div className="vehicle-removal-backdrop">
    <section className="vehicle-removal-dialog" role="dialog" aria-modal="true" aria-labelledby="vehicle-removal-title" aria-describedby="vehicle-removal-warning">
      <header><span>Destructive garage action</span><h2 id="vehicle-removal-title">Remove {title}?</h2><p>{vehicle.nickname}</p></header>
      <div id="vehicle-removal-warning" className="vehicle-removal-warning">
        {loading && <p>Checking this vehicle&apos;s saved records…</p>}
        {!loading && !summary && <p>Keeper could not verify the records attached to this vehicle. Close this window and try again.</p>}
        {summary && <>
          {hasRecords && <div className="vehicle-record-counts"><strong>This vehicle currently contains:</strong><span>{summary.maintenance_record_count} maintenance record{summary.maintenance_record_count === 1 ? "" : "s"}</span><span>{summary.maintenance_item_count} custom or tracked item{summary.maintenance_item_count === 1 ? "" : "s"}</span></div>}
          <p>Removing this vehicle will permanently delete it from your Keeper Garage along with its vehicle-specific records.</p>
          <ul><li>Maintenance and mileage history</li><li>Fluid records and repair notes</li><li>Custom maintenance and tracked known issues</li></ul>
          <p>Shared maintenance schedules and Keeper&apos;s global Known Issues research will not be changed.</p>
          {hasRecords && <label className="vehicle-removal-acknowledgment"><input type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} /><span>I understand this vehicle and its records will be removed.</span></label>}
        </>}
      </div>
      <footer><button ref={cancelButton} className="button button-quiet" type="button" disabled={removing} onClick={onCancel}>Cancel</button><button className="button button-danger" type="button" disabled={loading || !summary || removing || (hasRecords && !understood)} onClick={() => void onConfirm()}>{removing ? "Removing…" : "Remove Vehicle"}</button></footer>
    </section>
  </div>;
}
