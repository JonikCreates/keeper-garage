import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { friendlyGarageError } from "./keeperApi";
import { supabase, type MaintenanceRecordRow } from "./supabase";

type MaintenanceRecordState = {
  scope: string | null;
  records: MaintenanceRecordRow[];
  loading: boolean;
  savingSlug: string | null;
  error: string | null;
};

const initialState: MaintenanceRecordState = {
  scope: null,
  records: [],
  loading: false,
  savingSlug: null,
  error: null,
};

export type MaintenanceRecordInput = {
  workPerformed: string;
  mileage: number;
  completedAt: string;
  notes: string | null;
  fluidBrand: string | null;
  fluidProduct: string | null;
  fluidType: string | null;
  fluidViscosity: string | null;
  fluidSpecification: string | null;
  fluidQuantity: number | null;
  fluidUnit: string | null;
  filterProduct: string | null;
  costCents: number | null;
};

function compareMaintenanceRecordsNewestFirst(left: MaintenanceRecordRow, right: MaintenanceRecordRow) {
  const completedAtOrder = right.completed_at.localeCompare(left.completed_at);
  if (completedAtOrder !== 0) return completedAtOrder;
  return right.created_at.localeCompare(left.created_at);
}

export function useMaintenanceRecords(user: User | null, vehicleId: string | null) {
  const [state, setState] = useState(initialState);
  const scope = user && vehicleId ? `${user.id}:${vehicleId}` : null;

  useEffect(() => {
    if (!supabase || !user || !vehicleId) {
      queueMicrotask(() => setState(initialState));
      return;
    }

    const client = supabase;
    const ownerId = user.id;
    const selectedVehicleId = vehicleId;
    let active = true;
    async function loadRecords() {
      setState({ ...initialState, scope: `${ownerId}:${selectedVehicleId}`, loading: true });
      const { data, error } = await client
        .from("maintenance_records")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("vehicle_id", selectedVehicleId)
        .order("completed_at", { ascending: false })
        .order("created_at", { ascending: false })
        .returns<MaintenanceRecordRow[]>();
      if (!active) return;
      setState({
        scope: `${ownerId}:${selectedVehicleId}`,
        records: data ?? [],
        loading: false,
        savingSlug: null,
        error: error ? friendlyGarageError() : null,
      });
    }
    void loadRecords();
    return () => {
      active = false;
    };
  }, [user, vehicleId]);

  const recordsBySlug = useMemo(() => {
    const grouped = new Map<string, MaintenanceRecordRow[]>();
    const records = state.scope === scope ? state.records : [];
    for (const record of records) {
      const existing = grouped.get(record.maintenance_slug) ?? [];
      existing.push(record);
      grouped.set(record.maintenance_slug, existing);
    }
    for (const history of grouped.values()) history.sort(compareMaintenanceRecordsNewestFirst);
    return grouped;
  }, [scope, state.records, state.scope]);

  const addRecord = useCallback(async (maintenanceSlug: string, maintenanceName: string, input: MaintenanceRecordInput) => {
    if (!supabase || !user || !vehicleId) return false;
    setState((current) => ({ ...current, savingSlug: maintenanceSlug, error: null }));
    const { data, error } = await supabase
      .from("maintenance_records")
      .insert({
        owner_id: user.id,
        vehicle_id: vehicleId,
        maintenance_slug: maintenanceSlug,
        maintenance_name: maintenanceName,
        work_performed: input.workPerformed.trim(),
        mileage: input.mileage,
        completed_at: input.completedAt,
        notes: input.notes,
        fluid_brand: input.fluidBrand,
        fluid_product: input.fluidProduct,
        fluid_type: input.fluidType,
        fluid_viscosity: input.fluidViscosity,
        fluid_specification: input.fluidSpecification,
        fluid_quantity: input.fluidQuantity,
        fluid_unit: input.fluidUnit,
        filter_product: input.filterProduct,
        cost_cents: input.costCents,
      })
      .select()
      .single<MaintenanceRecordRow>();
    if (error) {
      setState((current) => ({ ...current, savingSlug: null, error: friendlyGarageError() }));
      return false;
    }
    setState((current) => ({
      ...current,
      records: [...current.records, data].sort(compareMaintenanceRecordsNewestFirst),
      savingSlug: null,
      error: null,
    }));
    return true;
  }, [user, vehicleId]);

  const deleteRecord = useCallback(async (recordId: string) => {
    if (!supabase || !user || !vehicleId) return false;
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", recordId)
      .eq("owner_id", user.id)
      .eq("vehicle_id", vehicleId);
    if (error) {
      setState((current) => ({ ...current, error: friendlyGarageError() }));
      return false;
    }
    setState((current) => ({ ...current, records: current.records.filter((record) => record.id !== recordId), error: null }));
    return true;
  }, [user, vehicleId]);

  return {
    ...(state.scope === scope ? state : initialState),
    recordsBySlug,
    addRecord,
    deleteRecord,
    clearError: () => setState((current) => ({ ...current, error: null })),
  };
}
