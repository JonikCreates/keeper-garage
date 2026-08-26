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

export function vehicleInsertFromProfile(profile: VehicleProfile, options: VehicleInsertOptions): VehicleInsert {
  const platform = getPlatform(profile.platform);
  return {
    owner_id: options.ownerId,
    nickname: options.nickname.trim() || `My ${profile.brand}`,
    brand: profile.brand,
    model: platform.label,
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
  const migratedModel = vehicle.model === "86 (first generation)"
    ? "86"
    : vehicle.model === "FR-S (first generation)"
      ? "FR-S"
      : vehicle.model;
  const platform = PLATFORM_OPTIONS.find((option) => option.label === migratedModel && option.brand === vehicle.brand);
  if (!platform) {
    throw new Error(`Saved vehicle does not map to a Keeper platform: ${vehicle.brand} / ${vehicle.model}`);
  }
  // Earlier Nissan imports exposed NISMO schedules under the generic Z trim.
  // Their manual transmission label is unambiguous, so restore the richer trim
  // without rewriting the saved row or guessing at ambiguous automatic cars.
  const legacyNismoManual = ["Z33", "Z34"].includes(platform.value)
    && ["350Z", "370Z"].includes(vehicle.trim)
    && vehicle.transmission === "6-speed manual";
  const migratedTrim = platform.value === "ZN6_TOYOTA" && vehicle.trim === "86" ? "GT86" : vehicle.trim;
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
