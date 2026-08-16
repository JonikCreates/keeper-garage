import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { KnownIssue } from "../lib/catalog";
import { supabase, type VehicleMaintenanceItemRow } from "./supabase";

type TrackedState = {
  items: VehicleMaintenanceItemRow[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: TrackedState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

export function useTrackedMaintenance(user: User | null, vehicleId: string | null) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!supabase || !user || !vehicleId) {
      queueMicrotask(() => setState(initialState));
      return;
    }

    const client = supabase;
    const ownerId = user.id;
    const selectedVehicleId = vehicleId;
    let active = true;
    async function loadItems() {
      setState({ ...initialState, loading: true });
      const { data, error } = await client
        .from("vehicle_maintenance_items")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("vehicle_id", selectedVehicleId)
        .order("created_at", { ascending: false })
        .returns<VehicleMaintenanceItemRow[]>();
      if (!active) return;
      setState({ items: data ?? [], loading: false, saving: false, error: error?.message ?? null });
    }
    void loadItems();
    return () => {
      active = false;
    };
  }, [user, vehicleId]);

  const itemSlugs = useMemo(() => new Set(state.items.map((item) => item.item_slug)), [state.items]);

  const insertItem = useCallback(async (item: Omit<VehicleMaintenanceItemRow, "id" | "owner_id" | "vehicle_id" | "created_at">) => {
    if (!supabase || !user || !vehicleId) return false;
    setState((current) => ({ ...current, saving: true, error: null }));
    const { data, error } = await supabase
      .from("vehicle_maintenance_items")
      .insert({ ...item, owner_id: user.id, vehicle_id: vehicleId })
      .select()
      .single<VehicleMaintenanceItemRow>();
    if (error) {
      if (error.code === "23505") {
        setState((current) => ({ ...current, saving: false, error: null }));
        return true;
      }
      setState((current) => ({ ...current, saving: false, error: error.message }));
      return false;
    }
    setState((current) => ({ ...current, items: [data, ...current.items], saving: false, error: null }));
    return true;
  }, [user, vehicleId]);

  const addKnownIssue = useCallback((issue: KnownIssue) => insertItem({
    item_slug: `issue-${issue.slug}`,
    item_name: issue.issue,
    item_type: "known_issue",
    category: issue.system,
    severity: issue.severity,
    notes: issue.preventativeAction,
  }), [insertItem]);

  const addCustomItem = useCallback((name: string, category: string, severity: VehicleMaintenanceItemRow["severity"]) => insertItem({
    item_slug: `custom-${crypto.randomUUID()}`,
    item_name: name.trim(),
    item_type: "custom",
    category: category.trim() || "Other",
    severity,
    notes: null,
  }), [insertItem]);

  return {
    ...state,
    itemSlugs,
    addKnownIssue,
    addCustomItem,
    clearError: () => setState((current) => ({ ...current, error: null })),
  };
}
