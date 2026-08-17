import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getPlatform, type VehicleProfile } from "../lib/catalog";
import { friendlyGarageError } from "./keeperApi";
import { supabase, type VehicleRow } from "./supabase";

type GarageState = {
  ownerId: string | null;
  vehicles: VehicleRow[];
  vehicleId: string | null;
  nickname: string;
  mileage: string;
  loading: boolean;
  saving: boolean;
  savedAt: string | null;
  error: string | null;
};

const initialState: GarageState = {
  ownerId: null,
  vehicles: [],
  vehicleId: null,
  nickname: "My BMW",
  mileage: "",
  loading: false,
  saving: false,
  savedAt: null,
  error: null,
};

const platformByModel: Record<VehicleRow["model"], VehicleProfile["platform"]> = {
  "3 Series (F30)": "F30",
  "3 Series (E46)": "E46",
  "5 Series (E39)": "E39",
  "3 Series (E36)": "E36",
};

function vehicleProfile(vehicle: VehicleRow): VehicleProfile {
  return {
    platform: platformByModel[vehicle.model],
    year: vehicle.model_year,
    trim: vehicle.trim,
    engineCode: vehicle.engine_code,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
  };
}

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
      const selected = vehicles.find((vehicle) => vehicle.is_primary) ?? vehicles[0];
      if (!selected) {
        setState((current) => ({ ...current, vehicles: [], loading: false }));
        return;
      }
      onVehicleLoaded(vehicleProfile(selected));
      setState({
        ownerId: currentUser.id,
        vehicles,
        vehicleId: selected.id,
        nickname: selected.nickname,
        mileage: selected.mileage === null ? "" : String(selected.mileage),
        loading: false,
        saving: false,
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
    onVehicleLoaded(vehicleProfile(selected));
    setState((current) => ({
      ...current,
      vehicleId: selected.id,
      nickname: selected.nickname,
      mileage: selected.mileage === null ? "" : String(selected.mileage),
      savedAt: selected.updated_at,
      error: null,
    }));
  }, [onVehicleLoaded, state.vehicles]);

  // REVIEW DECISION: starting a new vehicle keeps the visible configuration as a useful template but clears every saved-car field.
  const startNewVehicle = useCallback(() => {
    setState((current) => ({
      ...current,
      vehicleId: null,
      nickname: "My BMW",
      mileage: "",
      savedAt: null,
      error: null,
    }));
  }, []);

  const saveVehicle = useCallback(async (profile: VehicleProfile) => {
    if (!supabase || !user || state.ownerId !== user.id) return false;
    setState((current) => ({ ...current, saving: true, error: null }));

    const mileage = state.mileage.trim() ? Number(state.mileage) : null;
    const platform = getPlatform(profile.platform);
    const selectedVehicle = state.vehicles.find((vehicle) => vehicle.id === state.vehicleId);
    const vehicle = {
      owner_id: user.id,
      nickname: state.nickname.trim() || "My BMW",
      brand: "BMW" as const,
      model: platform.label,
      model_year: profile.year,
      trim: profile.trim,
      engine_code: profile.engineCode,
      drivetrain: profile.drivetrain,
      transmission: profile.transmission,
      mileage,
      is_primary: selectedVehicle?.is_primary ?? state.vehicles.length === 0,
    };

    const request = state.vehicleId
      ? supabase.from("vehicles").update(vehicle).eq("id", state.vehicleId).select().single<VehicleRow>()
      : supabase.from("vehicles").insert(vehicle).select().single<VehicleRow>();
    const { data, error } = await request;

    if (error) {
      setState((current) => ({ ...current, saving: false, error: friendlyGarageError() }));
      return false;
    }

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

  const visibleState = user && state.ownerId === user.id ? state : initialState;

  return {
    ...visibleState,
    setNickname: (nickname: string) => setState((current) => ({ ...current, nickname })),
    setMileage: (mileage: string) => setState((current) => ({ ...current, mileage })),
    selectVehicle,
    startNewVehicle,
    saveVehicle,
  };
}
