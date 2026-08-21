import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { VehicleProfile } from "../lib/catalog";
import { friendlyGarageError } from "./keeperApi";
import { supabase, type VehicleRemovalResult, type VehicleRemovalSummary, type VehicleRow } from "./supabase";
import { vehicleInsertFromProfile, vehicleProfileFromRow } from "./vehiclePersistence";

type GarageState = {
  ownerId: string | null;
  vehicles: VehicleRow[];
  vehicleId: string | null;
  nickname: string;
  mileage: string;
  loading: boolean;
  saving: boolean;
  removing: boolean;
  savedAt: string | null;
  error: string | null;
};

const initialState: GarageState = {
  ownerId: null,
  vehicles: [],
  vehicleId: null,
  nickname: "My vehicle",
  mileage: "",
  loading: false,
  saving: false,
  removing: false,
  savedAt: null,
  error: null,
};

function sortVehicles(vehicles: VehicleRow[]) {
  return [...vehicles].sort((left, right) => Number(right.is_primary) - Number(left.is_primary)
    || Date.parse(right.updated_at) - Date.parse(left.updated_at));
}

export function useGarage(user: User | null, onVehicleLoaded: (profile: VehicleProfile) => void, dataVersion = 0) {
  const [state, setState] = useState<GarageState>(initialState);

  useEffect(() => {
    if (!supabase || !user) {
      queueMicrotask(() => setState(initialState));
      return;
    }

    const client = supabase;
    const currentUser = user;
    let active = true;
    async function loadVehicles() {
      setState({ ...initialState, ownerId: currentUser.id, loading: true });
      const { data, error } = await client
        .from("vehicles")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("is_primary", { ascending: false })
        .order("updated_at", { ascending: false })
        .returns<VehicleRow[]>();
      if (!active) return;
      if (error) {
        setState((current) => ({ ...current, loading: false, error: friendlyGarageError() }));
        return;
      }
      const vehicles = sortVehicles(data ?? []);
      const rememberedVehicleId = localStorage.getItem(`keeper-selected-vehicle:${currentUser.id}`);
      const selected = vehicles.find((vehicle) => vehicle.id === rememberedVehicleId)
        ?? vehicles.find((vehicle) => vehicle.is_primary)
        ?? vehicles[0];
      if (!selected) {
        setState((current) => ({ ...current, vehicles: [], loading: false }));
        return;
      }
      localStorage.setItem(`keeper-selected-vehicle:${currentUser.id}`, selected.id);
      onVehicleLoaded(vehicleProfileFromRow(selected));
      setState({
        ownerId: currentUser.id,
        vehicles,
        vehicleId: selected.id,
        nickname: selected.nickname,
        mileage: selected.mileage === null ? "" : String(selected.mileage),
        loading: false,
        saving: false,
        removing: false,
        savedAt: selected.updated_at,
        error: null,
      });
    }
    void loadVehicles();

    return () => {
      active = false;
    };
  }, [user, onVehicleLoaded, dataVersion]);

  const selectVehicle = useCallback((vehicleId: string) => {
    const selected = state.vehicles.find((vehicle) => vehicle.id === vehicleId);
    if (!selected) return;
    if (user) localStorage.setItem(`keeper-selected-vehicle:${user.id}`, selected.id);
    onVehicleLoaded(vehicleProfileFromRow(selected));
    setState((current) => ({
      ...current,
      vehicleId: selected.id,
      nickname: selected.nickname,
      mileage: selected.mileage === null ? "" : String(selected.mileage),
      savedAt: selected.updated_at,
      error: null,
    }));
  }, [onVehicleLoaded, state.vehicles, user]);

  // REVIEW DECISION: starting a new vehicle keeps the visible configuration as a useful template but clears every saved-car field.
  const startNewVehicle = useCallback(() => {
    setState((current) => ({
      ...current,
      vehicleId: null,
      nickname: "My vehicle",
      mileage: "",
      savedAt: null,
      error: null,
    }));
  }, []);

  const saveVehicle = useCallback(async (profile: VehicleProfile) => {
    if (!supabase || !user || state.ownerId !== user.id) return false;
    setState((current) => ({ ...current, saving: true, error: null }));

    const mileage = state.mileage.trim() ? Number(state.mileage) : null;
    const selectedVehicle = state.vehicles.find((vehicle) => vehicle.id === state.vehicleId);
    const vehicle = vehicleInsertFromProfile(profile, {
      ownerId: user.id,
      nickname: state.nickname,
      mileage,
      isPrimary: selectedVehicle?.is_primary ?? state.vehicles.length === 0,
    });

    const request = state.vehicleId
      ? supabase.from("vehicles").update(vehicle).eq("id", state.vehicleId).select().single<VehicleRow>()
      : supabase.from("vehicles").insert(vehicle).select().single<VehicleRow>();
    const { data, error } = await request;

    if (error) {
      setState((current) => ({ ...current, saving: false, error: friendlyGarageError() }));
      return false;
    }

    localStorage.setItem(`keeper-selected-vehicle:${user.id}`, data.id);
    setState((current) => ({
      ...current,
      vehicles: sortVehicles(current.vehicles.some((vehicle) => vehicle.id === data.id)
        ? current.vehicles.map((vehicle) => vehicle.id === data.id ? data : vehicle)
        : [...current.vehicles, data]),
      vehicleId: data.id,
      nickname: data.nickname,
      mileage: data.mileage === null ? "" : String(data.mileage),
      saving: false,
      savedAt: data.updated_at,
      error: null,
    }));
    return true;
  }, [state.ownerId, state.vehicleId, state.vehicles, state.nickname, state.mileage, user]);

  const getRemovalSummary = useCallback(async (vehicleId: string) => {
    if (!supabase || !user || state.ownerId !== user.id || !state.vehicles.some((vehicle) => vehicle.id === vehicleId)) return null;
    const { data, error } = await supabase.rpc("get_vehicle_removal_summary", { p_vehicle_id: vehicleId });
    if (error || !data) {
      setState((current) => ({ ...current, error: "Keeper couldn't verify this vehicle for removal. Please try again." }));
      return null;
    }
    return data as VehicleRemovalSummary;
  }, [state.ownerId, state.vehicles, user]);

  const removeVehicle = useCallback(async (vehicleId: string) => {
    if (!supabase || !user || state.ownerId !== user.id || !state.vehicles.some((vehicle) => vehicle.id === vehicleId)) return false;
    setState((current) => ({ ...current, removing: true, error: null }));
    const { data, error } = await supabase.rpc("remove_keeper_vehicle", { p_vehicle_id: vehicleId });
    if (error || !data) {
      setState((current) => ({ ...current, removing: false, error: "Keeper couldn't remove this vehicle. No garage records were changed." }));
      return false;
    }

    const result = data as VehicleRemovalResult;
    const remainingVehicles = sortVehicles(state.vehicles
      .filter((vehicle) => vehicle.id !== result.removed_vehicle_id)
      .map((vehicle) => ({ ...vehicle, is_primary: vehicle.id === result.next_vehicle_id })));
    const selected = remainingVehicles.find((vehicle) => vehicle.id === result.next_vehicle_id) ?? remainingVehicles[0] ?? null;
    const selectionKey = `keeper-selected-vehicle:${user.id}`;
    if (selected) localStorage.setItem(selectionKey, selected.id);
    else localStorage.removeItem(selectionKey);
    if (selected) onVehicleLoaded(vehicleProfileFromRow(selected));
    setState((current) => ({
      ...current,
      vehicles: remainingVehicles,
      vehicleId: selected?.id ?? null,
      nickname: selected?.nickname ?? "My vehicle",
      mileage: selected?.mileage === null || selected?.mileage === undefined ? "" : String(selected.mileage),
      removing: false,
      savedAt: selected?.updated_at ?? null,
      error: null,
    }));
    return true;
  }, [onVehicleLoaded, state.ownerId, state.vehicles, user]);

  const visibleState = user && state.ownerId === user.id ? state : initialState;

  return {
    ...visibleState,
    setNickname: (nickname: string) => setState((current) => ({ ...current, nickname })),
    setMileage: (mileage: string) => setState((current) => ({ ...current, mileage })),
    selectVehicle,
    startNewVehicle,
    saveVehicle,
    getRemovalSummary,
    removeVehicle,
  };
}
