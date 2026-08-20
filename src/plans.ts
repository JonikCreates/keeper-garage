export type KeeperPlanId =
  | "basic_traffic"
  | "project_car"
  | "collector";

export type KeeperPlan = {
  id: KeeperPlanId;
  name: string;
  monthlyPrice: number;
  vehicleSlots: number;
  canTrackMaintenance: boolean;
  canModifyVehicle: boolean;
  canExport: boolean;
  description: string;
};

export const KEEPER_PLANS: Record<KeeperPlanId, KeeperPlan> = {
  basic_traffic: {
    id: "basic_traffic",
    name: "Basic Traffic",
    monthlyPrice: 0,
    vehicleSlots: 1,
    canTrackMaintenance: false,
    canModifyVehicle: false,
    canExport: false,
    description:
      "Save one vehicle and access Keeper's researched facts, known issues, and ownership intelligence.",
  },

  project_car: {
    id: "project_car",
    name: "Project Car",
    monthlyPrice: 1.99,
    vehicleSlots: 1,
    canTrackMaintenance: true,
    canModifyVehicle: true,
    canExport: true,
    description:
      "Full Keeper access for one enthusiast vehicle, including maintenance, repairs, modifications, mileage, history, and exports.",
  },

  collector: {
    id: "collector",
    name: "Collector",
    monthlyPrice: 2.99,
    vehicleSlots: 3,
    canTrackMaintenance: true,
    canModifyVehicle: true,
    canExport: true,
    description:
      "Full Keeper access for up to three enthusiast vehicles.",
  },
};

export function getKeeperPlan(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId];
}

export function canPlanAddVehicle(
  planId: KeeperPlanId,
  currentVehicleCount: number,
) {
  return currentVehicleCount < KEEPER_PLANS[planId].vehicleSlots;
}

export function canPlanTrackMaintenance(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId].canTrackMaintenance;
}

export function canPlanModifyVehicle(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId].canModifyVehicle;
}

export function canPlanExport(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId].canExport;
}