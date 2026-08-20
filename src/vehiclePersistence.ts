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
  const platform = PLATFORM_OPTIONS.find((option) => option.label === vehicle.model && option.brand === vehicle.brand);
  if (!platform) {
    throw new Error(`Saved vehicle does not map to a Keeper platform: ${vehicle.brand} / ${vehicle.model}`);
  }
  return {
    brand: vehicle.brand,
    platform: platform.value,
    year: vehicle.model_year,
    trim: vehicle.trim,
    engineCode: vehicle.engine_code,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
  };
}
