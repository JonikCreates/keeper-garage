import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getPlatform, type VehicleProfile } from "../lib/catalog";
import { supabase, type VehicleRow } from "./supabase";

type GarageState = {
  vehicleId: string | null;
  nickname: string;
  mileage: string;
  loading: boolean;
  saving: boolean;
  savedAt: string | null;
  error: string | null;
};

const initialState: GarageState = {
  vehicleId: null,
  nickname: "My BMW",
  mileage: "",
  loading: false,
  saving: false,
  savedAt: null,
  error: null,
};

export function useGarage(user: User | null, onVehicleLoaded: (profile: VehicleProfile) => void) {
  const [state, setState] = useState<GarageState>(initialState);

  useEffect(() => {
    if (!supabase || !user) {
      queueMicrotask(() => setState(initialState));
      return;
    }

    const client = supabase;
    const currentUser = user;
    let active = true;
    async function loadVehicle() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await client
        .from("vehicles")
        .select("*")
        .eq("owner_id", currentUser.id)
        .eq("is_primary", true)
        .maybeSingle<VehicleRow>();
        if (!active) return;
        if (error) {
          setState((current) => ({ ...current, loading: false, error: error.message }));
          return;
        }
        if (!data) {
          setState((current) => ({ ...current, loading: false }));
          return;
        }
        onVehicleLoaded({
          platform: data.model === "3 Series (E36)" ? "E36" : "F30",
          year: data.model_year,
          trim: data.trim,
          engineCode: data.engine_code,
          drivetrain: data.drivetrain,
          transmission: data.transmission,
        });
        setState({
          vehicleId: data.id,
          nickname: data.nickname,
          mileage: data.mileage === null ? "" : String(data.mileage),
          loading: false,
          saving: false,
          savedAt: data.updated_at,
          error: null,
        });
    }
    void loadVehicle();

    return () => {
      active = false;
    };
  }, [user, onVehicleLoaded]);

  const saveVehicle = useCallback(async (profile: VehicleProfile) => {
    if (!supabase || !user) return false;
    setState((current) => ({ ...current, saving: true, error: null }));

    const mileage = state.mileage.trim() ? Number(state.mileage) : null;
    const platform = getPlatform(profile.platform);
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
      is_primary: true,
    };

    const request = state.vehicleId
      ? supabase.from("vehicles").update(vehicle).eq("id", state.vehicleId).select().single<VehicleRow>()
      : supabase.from("vehicles").insert(vehicle).select().single<VehicleRow>();
    const { data, error } = await request;

    if (error) {
      setState((current) => ({ ...current, saving: false, error: error.message }));
      return false;
    }

    setState((current) => ({
      ...current,
      vehicleId: data.id,
      nickname: data.nickname,
      mileage: data.mileage === null ? "" : String(data.mileage),
      saving: false,
      savedAt: data.updated_at,
      error: null,
    }));
    return true;
  }, [state.vehicleId, state.nickname, state.mileage, user]);

  return {
    ...state,
    setNickname: (nickname: string) => setState((current) => ({ ...current, nickname })),
    setMileage: (mileage: string) => setState((current) => ({ ...current, mileage })),
    saveVehicle,
  };
}
