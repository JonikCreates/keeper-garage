import { PROJECT_IDEAS, PLATFORM, matchesApplicability, type VehicleProfile } from "@/lib/catalog";
import { ensureDatabase, ensureDemoVehicle, getDatabase, getRequestIdentity } from "@/lib/database";
import { buildSchedule, type MaintenanceRow, type ServiceRecord } from "@/lib/schedule";

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
  bodyCode: string | null;
  engineCode: string | null;
  drivetrain: string | null;
  market: string | null;
  emissions: string | null;
  productionDate: string | null;
  vinLast7: string | null;
};

type ApplicableMaintenanceRow = MaintenanceRow & {
  trims: string | null;
  engines: string | null;
  drivetrains: string | null;
  transmissions: string | null;
};

type IssueRow = {
  id: number;
  slug: string;
  system: string;
  issue: string;
  description: string;
  symptoms: string;
  typicalMileage: string;
  severity: "critical" | "important" | "routine";
  urgency: "urgent" | "watch";
  evidence: string;
  preventativeAction: string;
  trims: string | null;
  engines: string | null;
  drivetrains: string | null;
  transmissions: string | null;
};

type IssueSourceRow = {
  issueId: number;
  type: string;
  title: string;
  url: string;
  publisher: string;
  note: string | null;
};

const unpack = (value: string | null) => value?.split("|").filter(Boolean);

function applies(profile: VehicleProfile, row: { trims: string | null; engines: string | null; drivetrains: string | null; transmissions: string | null }) {
  return matchesApplicability(profile, {
    trims: unpack(row.trims),
    engines: unpack(row.engines),
    drivetrains: unpack(row.drivetrains),
    transmissions: unpack(row.transmissions),
  });
}

export async function GET(request: Request) {
  try {
    await ensureDatabase();
    const db = getDatabase();
    const identity = getRequestIdentity(request);
    if (identity.isDemo) await ensureDemoVehicle();

    const vehicle = await db.prepare(
      `SELECT v.id, v.year, v.make, v.model, v.trim, v.engine, v.transmission,
              v.nickname, v.current_mileage AS currentMileage,
              v.purchase_mileage AS purchaseMileage, v.purchase_date AS purchaseDate,
              v.platform_id AS platformId, p.body_code AS bodyCode,
              p.engine_code AS engineCode, p.drivetrain, p.market, p.emissions,
              p.production_date AS productionDate, p.vin_last7 AS vinLast7
       FROM vehicles v LEFT JOIN vehicle_profiles p ON p.vehicle_id = v.id
       WHERE v.user_id = ? ORDER BY v.id LIMIT 1`,
    ).bind(identity.userId).first<VehicleRow>();

    if (!vehicle) {
      return Response.json({
        identity, vehicle: null, platform: PLATFORM, schedule: [], records: [],
        applicableIssues: [], allIssues: [], projects: [], healthScore: 0,
        counts: { overdue: 0, dueSoon: 0, onTrack: 0, untracked: 0 },
      });
    }

    const profile: VehicleProfile = {
      trim: vehicle.trim,
      engineCode: vehicle.engineCode ?? vehicle.engine.split(" ")[0],
      drivetrain: vehicle.drivetrain ?? "RWD",
      transmission: vehicle.transmission,
    };

    const itemRows = await db.prepare(
      `SELECT i.id, i.slug, i.name, i.category, i.description, i.severity,
              i.oem_mileage_interval AS oemMileageInterval,
              i.oem_time_months AS oemTimeMonths,
              i.community_mileage_interval AS communityMileageInterval,
              i.community_time_months AS communityTimeMonths,
              i.oem_summary AS oemSummary, i.community_summary AS communitySummary,
              r.trims, r.engines, r.drivetrains, r.transmissions
       FROM maintenance_items i
       LEFT JOIN maintenance_rules r ON r.maintenance_item_id = i.id
       WHERE i.platform_id = ?
       ORDER BY CASE i.severity WHEN 'critical' THEN 1 WHEN 'important' THEN 2 ELSE 3 END, i.name`,
    ).bind(vehicle.platformId).all<ApplicableMaintenanceRow>();
    const applicableItems = itemRows.results.filter((row) => applies(profile, row));

    const records = await db.prepare(
      `SELECT r.id, r.maintenance_item_id AS maintenanceItemId,
              i.name AS maintenanceName, i.slug AS maintenanceSlug,
              r.service_date AS serviceDate, r.mileage, r.cost, r.shop, r.notes,
              r.fluid, r.fluid_quantity AS fluidQuantity, r.parts_used AS partsUsed
       FROM maintenance_records r JOIN maintenance_items i ON i.id = r.maintenance_item_id
       WHERE r.vehicle_id = ? ORDER BY r.service_date DESC, r.mileage DESC, r.id DESC`,
    ).bind(vehicle.id).all<ServiceRecord>();

    const issueRows = await db.prepare(
      `SELECT id, slug, system, issue, description, symptoms,
              typical_mileage AS typicalMileage, severity, urgency, evidence,
              preventative_action AS preventativeAction, trims, engines,
              drivetrains, transmissions
       FROM issue_library WHERE platform_id = ?
       ORDER BY CASE urgency WHEN 'urgent' THEN 1 ELSE 2 END,
                CASE severity WHEN 'critical' THEN 1 WHEN 'important' THEN 2 ELSE 3 END,
                system, issue`,
    ).bind(vehicle.platformId).all<IssueRow>();
    const issueSources = await db.prepare(
      `SELECT s.issue_id AS issueId, s.source_type AS type, s.title, s.url,
              s.publisher, s.notes AS note
       FROM issue_sources s JOIN issue_library i ON i.id = s.issue_id
       WHERE i.platform_id = ? ORDER BY s.id`,
    ).bind(vehicle.platformId).all<IssueSourceRow>();

    const allIssues = issueRows.results.map((issue) => ({
      ...issue,
      isApplicable: applies(profile, issue),
      applicability: {
        trims: unpack(issue.trims) ?? [], engines: unpack(issue.engines) ?? [],
        drivetrains: unpack(issue.drivetrains) ?? [], transmissions: unpack(issue.transmissions) ?? [],
      },
      sources: issueSources.results.filter((source) => source.issueId === issue.id),
    }));
    const { schedule, healthScore, counts } = buildSchedule(
      applicableItems, records.results, vehicle.currentMileage,
    );
    const projects = PROJECT_IDEAS.filter((project) => matchesApplicability(profile, project.appliesTo));

    return Response.json({
      identity, vehicle: { ...vehicle, ...profile }, platform: PLATFORM,
      schedule, records: records.results, applicableIssues: allIssues.filter((issue) => issue.isApplicable),
      allIssues, projects, healthScore, counts, generatedAt: new Date().toISOString(),
      scheduleBasis: "community",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load garage.";
    return Response.json({ error: message }, { status: 500 });
  }
}
