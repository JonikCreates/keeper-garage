import { KNOWN_ISSUES, PLATFORM } from "@/lib/catalog";
import {
  ensureDatabase,
  ensureDemoVehicle,
  getDatabase,
  getRequestIdentity,
} from "@/lib/database";
import {
  buildSchedule,
  type MaintenanceRow,
  type ServiceRecord,
} from "@/lib/schedule";

export const dynamic = "force-dynamic";

type VehicleRow = {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  nickname: string | null;
  currentMileage: number;
  purchaseMileage: number | null;
  purchaseDate: string | null;
  platformId: number;
};

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const db = getDatabase();
    const identity = getRequestIdentity(request);
    if (identity.isDemo) await ensureDemoVehicle();

    const vehicle = await db
      .prepare(
        `SELECT id, year, make, model, trim, engine, transmission, nickname,
                current_mileage AS currentMileage,
                purchase_mileage AS purchaseMileage,
                purchase_date AS purchaseDate,
                platform_id AS platformId
         FROM vehicles WHERE user_id = ? ORDER BY id LIMIT 1`,
      )
      .bind(identity.userId)
      .first<VehicleRow>();

    if (!vehicle) {
      return Response.json({
        identity,
        vehicle: null,
        platform: PLATFORM,
        schedule: [],
        records: [],
        knownIssues: KNOWN_ISSUES,
        healthScore: 0,
        counts: { overdue: 0, dueSoon: 0, onTrack: 0, untracked: 0 },
      });
    }

    const items = await db
      .prepare(
        `SELECT id, slug, name, category, description, severity,
                oem_mileage_interval AS oemMileageInterval,
                oem_time_months AS oemTimeMonths,
                community_mileage_interval AS communityMileageInterval,
                community_time_months AS communityTimeMonths,
                oem_summary AS oemSummary,
                community_summary AS communitySummary
         FROM maintenance_items
         WHERE platform_id = ?
         ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'important' THEN 2 ELSE 3 END,
                  name`,
      )
      .bind(vehicle.platformId)
      .all<MaintenanceRow>();

    const records = await db
      .prepare(
        `SELECT r.id,
                r.maintenance_item_id AS maintenanceItemId,
                i.name AS maintenanceName,
                i.slug AS maintenanceSlug,
                r.service_date AS serviceDate,
                r.mileage,
                r.cost,
                r.shop,
                r.notes,
                r.fluid,
                r.fluid_quantity AS fluidQuantity,
                r.parts_used AS partsUsed
         FROM maintenance_records r
         JOIN maintenance_items i ON i.id = r.maintenance_item_id
         WHERE r.vehicle_id = ?
         ORDER BY r.service_date DESC, r.mileage DESC, r.id DESC`,
      )
      .bind(vehicle.id)
      .all<ServiceRecord>();

    const { schedule, healthScore, counts } = buildSchedule(
      items.results,
      records.results,
      vehicle.currentMileage,
    );

    return Response.json(
      {
        identity,
        vehicle,
        platform: PLATFORM,
        schedule,
        records: records.results,
        knownIssues: KNOWN_ISSUES,
        healthScore,
        counts,
        generatedAt: new Date().toISOString(),
        scheduleBasis: "community",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load garage.";
    return Response.json({ error: message }, { status: 500 });
  }
}
