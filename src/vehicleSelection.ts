import {
  getVehicleFamilyForPlatform,
  vehicleVariantKey,
  type VehicleBrand,
  type VehicleProfile,
} from "../lib/catalog";

export type VehicleSelectionDraft = {
  brand: VehicleBrand | null;
  family: string | null;
  variant: string | null;
  year: number | null;
};

export const EMPTY_VEHICLE_SELECTION: VehicleSelectionDraft = {
  brand: null,
  family: null,
  variant: null,
  year: null,
};

export function selectionFromProfile(profile: VehicleProfile): VehicleSelectionDraft {
  return {
    brand: profile.brand,
    family: getVehicleFamilyForPlatform(profile.platform).value,
    variant: vehicleVariantKey(profile.platform, profile.trim),
    year: profile.year,
  };
}

export function selectVehicleBrand(brand: VehicleBrand): VehicleSelectionDraft {
  return { brand, family: null, variant: null, year: null };
}

export function selectVehicleFamily(current: VehicleSelectionDraft, family: string): VehicleSelectionDraft {
  return { ...current, family, variant: null, year: null };
}

export function selectVehicleVariant(current: VehicleSelectionDraft, variant: string): VehicleSelectionDraft {
  return { ...current, variant, year: null };
}

export function selectVehicleYear(current: VehicleSelectionDraft, year: number): VehicleSelectionDraft {
  return { ...current, year };
}

export function vehicleSelectionIsComplete(selection: VehicleSelectionDraft) {
  return selection.brand !== null
    && selection.family !== null
    && selection.variant !== null
    && selection.year !== null;
}
