import {
  PLATFORM_OPTIONS,
  getPlatform,
  type VehicleProfile,
} from "../lib/catalog";
import type { VehicleRow } from "./supabase";

export type VehicleInsert = Pick<
  VehicleRow,
  | "owner_id"
  | "nickname"
  | "brand"
  | "model"
  | "model_year"
  | "trim"
  | "engine_code"
  | "drivetrain"
  | "transmission"
  | "mileage"
  | "is_primary"
>;

export type VehicleInsertOptions = {
  ownerId: string;
  nickname: string;
  mileage: number | null;
  isPrimary: boolean;
};

// Keep the already-deployed database keys stable while the selector presents
// cleaner model/generation labels. Garage rows and dependent records keep IDs.
const PERSISTED_MODEL_LABELS: Partial<Record<string, string>> = {
  E82: "1 Series (E82 and E88)",
  ZC6: "BRZ",
  ZD8: "BRZ",
};

export function vehicleInsertFromProfile(profile: VehicleProfile, options: VehicleInsertOptions): VehicleInsert {
  const platform = getPlatform(profile.platform);
  return {
    owner_id: options.ownerId,
    nickname: options.nickname.trim() || `My ${profile.brand}`,
    brand: profile.brand,
    model: PERSISTED_MODEL_LABELS[platform.value] ?? platform.label,
    model_year: profile.year,
    trim: profile.trim,
    engine_code: profile.engineCode,
    drivetrain: profile.drivetrain,
    transmission: profile.transmission,
    mileage: options.mileage,
    is_primary: options.isPrimary,
  };
}

export function vehicleProfileFromRow(vehicle: VehicleRow): VehicleProfile {
  const migratedModel = ["86", "86 (first generation)"].includes(vehicle.model)
    ? "GT86 (First gen ZN6)"
    : vehicle.model === "FR-S (first generation)"
      ? "FR-S"
      : ["BRZ", "BRZ (first generation)"].includes(vehicle.model)
        ? vehicle.model_year <= 2020
          ? "BRZ (first generation ZC6)"
          : "BRZ (second generation ZD8)"
        : ["1 Series Coupe / Convertible (E82/E88)", "1 Series (E82 and E88)"].includes(vehicle.model)
          ? "1 Series (E82/E88)"
          : vehicle.model;
  const platform = PLATFORM_OPTIONS.find((option) => option.label === migratedModel
    && option.brand === vehicle.brand
    && vehicle.model_year >= option.yearStart
    && vehicle.model_year <= option.yearEnd);
  if (!platform) {
    throw new Error(`Saved vehicle does not map to a Keeper platform: ${vehicle.brand} / ${vehicle.model}`);
  }
  // Earlier Nissan imports exposed NISMO schedules under the generic Z trim.
  // Their manual transmission label is unambiguous, so restore the richer trim
  // without rewriting the saved row or guessing at ambiguous automatic cars.
  const legacyNismoManual = ["Z33", "Z34"].includes(platform.value)
    && ["350Z", "370Z"].includes(vehicle.trim)
    && vehicle.transmission === "6-speed manual";
  const migratedTrim = platform.value === "ZN6_TOYOTA" && vehicle.trim === "86"
    ? "GT86"
    : platform.value === "ZC6" && vehicle.trim === "First gen"
      ? "BRZ"
      : platform.value === "ZD8" && vehicle.trim === "Second gen"
        ? "Standard"
        : platform.value === "ZD8" && vehicle.trim === "tS / Series.Yellow"
          ? "tS"
        : vehicle.trim;
  return {
    brand: vehicle.brand,
    platform: platform.value,
    year: vehicle.model_year,
    trim: legacyNismoManual ? "NISMO" : migratedTrim,
    engineCode: vehicle.engine_code,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
  };
}
