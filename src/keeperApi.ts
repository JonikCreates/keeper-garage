import { supabase, type KeeperExportPayload } from "./supabase";

export async function getKeeperVehicleExport(vehicleId: string): Promise<KeeperExportPayload> {
  if (!supabase) throw new Error("Keeper account services are unavailable.");
  const { data, error } = await supabase.rpc("get_keeper_vehicle_export", { p_vehicle_id: vehicleId });
  if (error || !data) throw new Error("Keeper couldn't authorize this export. Sign in again and confirm the vehicle belongs to your Profile.");
  return data as KeeperExportPayload;
}

export function friendlyGarageError() {
  return "Keeper couldn't save that change. Check your connection and account access, then try again.";
}
