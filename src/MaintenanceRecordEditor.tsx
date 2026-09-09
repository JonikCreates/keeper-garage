import { useState } from "react";
import { MaintenanceRecordPanel } from "./MaintenanceRecordPanel";
import type { MaintenanceRecordRow } from "./supabase";
import type { MaintenanceRecordInput } from "./useMaintenanceRecords";

export function MaintenanceRecordEditor({ record, draftScope, saving, onSave }: {
  record: MaintenanceRecordRow;
  draftScope: string | null;
  saving: boolean;
  onSave: (input: MaintenanceRecordInput) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  if (!editing) return <button type="button" onClick={() => setEditing(true)}>Edit record</button>;
  return <MaintenanceRecordPanel key={`${draftScope}:${record.id}`} editingRecord={record}
    item={{ slug: record.maintenance_slug, name: record.maintenance_name }} records={[record]}
    tracksFluid signedIn isGuest={false} hasSavedVehicle defaultMileage={String(record.mileage)}
    draftScope={draftScope} saving={saving} onOpenAuth={() => {}} onAdd={onSave} onCancel={() => setEditing(false)} />;
}
