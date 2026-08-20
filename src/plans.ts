export type KeeperPlanId =
  | "keeper_1"
  | "keeper_1_export"
  | "keeper_3"
  | "keeper_3_export";

export type KeeperPlan = {
  id: KeeperPlanId;
  name: string;
  monthlyPrice: number;
  vehicleSlots: number;
  canExport: boolean;
  description: string;
};

export const KEEPER_PLANS: Record<KeeperPlanId, KeeperPlan> = {
  keeper_1: {
    id: "keeper_1",
    name: "Keeper 1",
    monthlyPrice: 2.99,
    vehicleSlots: 1,
    canExport: false,
    description: "One vehicle slot with Keeper's core garage and maintenance features.",
  },

  keeper_1_export: {
    id: "keeper_1_export",
    name: "Keeper 1 + Export",
    monthlyPrice: 3.99,
    vehicleSlots: 1,
    canExport: true,
    description: "One vehicle slot with maintenance and ownership exports.",
  },

  keeper_3: {
    id: "keeper_3",
    name: "Keeper 3",
    monthlyPrice: 5.99,
    vehicleSlots: 3,
    canExport: false,
    description: "Up to three vehicle slots with Keeper's core garage and maintenance features.",
  },

  keeper_3_export: {
    id: "keeper_3_export",
    name: "Keeper 3 + Export",
    monthlyPrice: 7.99,
    vehicleSlots: 3,
    canExport: true,
    description: "Up to three vehicle slots with exports enabled for every vehicle.",
  },
};

export function getKeeperPlan(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId];
}

export function canPlanAddVehicle(planId: KeeperPlanId, currentVehicleCount: number) {
  return currentVehicleCount < KEEPER_PLANS[planId].vehicleSlots;
}

export function canPlanExport(planId: KeeperPlanId) {
  return KEEPER_PLANS[planId].canExport;
}