import { useEffect, useRef, useState } from "react";
import type { MaintenanceRecordRow, VehicleRow } from "./supabase";
import { completedExportRecords, downloadMaintenanceHistory } from "./maintenanceExport";
import { getKeeperVehicleExport, getKeeperVehiclePdfExport } from "./keeperApi";

type MaintenanceExportMenuProps = {
  vehicle: VehicleRow | null;
  records: MaintenanceRecordRow[];
  canExport: boolean;
  canExportPdf: boolean;
  onRequireAccount: () => void;
  onRequireUpgrade: () => void;
};

export function MaintenanceExportMenu({ vehicle, records, canExport, canExportPdf, onRequireAccount, onRequireUpgrade }: MaintenanceExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const exportableCount = completedExportRecords(records).length;

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function exportHistory(format: "pdf" | "png") {
    if (!canExport) {
      onRequireAccount();
      return;
    }
    if (format === "pdf" && !canExportPdf) {
      setOpen(false);
      onRequireUpgrade();
      return;
    }
    if (!vehicle || exportableCount === 0) return;
    setOpen(false);
    setError(null);
    setExporting(format);
    try {
      // REVIEW DECISION: export data is fetched again through an owner-checking RPC so a forged vehicle ID or modified React state cannot authorize a report.
      const payload = format === "pdf"
        ? await getKeeperVehiclePdfExport(vehicle.id)
        : await getKeeperVehicleExport(vehicle.id);
      await downloadMaintenanceHistory(format, payload.vehicle, payload.records);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The service history could not be exported.");
    } finally {
      setExporting(null);
    }
  }

  const unavailable = !vehicle || exportableCount === 0;
  return <div className="maintenance-export" ref={container}>
    <button className="button button-quiet" type="button" aria-haspopup="menu" aria-expanded={open} disabled={Boolean(exporting) || unavailable} onClick={() => canExport ? setOpen((value) => !value) : onRequireAccount()}>
      {exporting ? `Creating ${exporting.toUpperCase()}…` : "Export ▾"}
    </button>
    {open && <div className="maintenance-export-menu" role="menu">
      <button type="button" role="menuitem" onClick={() => void exportHistory("pdf")}><strong>Export as PDF{canExportPdf ? "" : " · Upgrade"}</strong><span>{canExportPdf ? "Print-ready service record" : "From $1.99 one-time · no subscription"}</span></button>
      <button type="button" role="menuitem" onClick={() => void exportHistory("png")}><strong>Export as image</strong><span>High-resolution PNG</span></button>
    </div>}
    {!canExport && vehicle && <small>A Keeper Profile is required to export</small>}
    {canExport && !canExportPdf && vehicle && <small>PDF export is included with Keeper Upgrade or Infinite</small>}
    {vehicle && exportableCount === 0 && <small>Log completed work to export</small>}
    {error && <small className="maintenance-export-error">{error}</small>}
  </div>;
}
