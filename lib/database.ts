import { env } from "cloudflare:workers";
import { KNOWN_ISSUES, MAINTENANCE_CATALOG, PLATFORM } from "./catalog";

let initialization: Promise<void> | null = null;

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error("The maintenance database is unavailable.");
  return env.DB;
}

const packed = (values?: string[]) => values?.join("|") ?? null;

export async function ensureDatabase() {
  initialization ??= initializeDatabase().catch((error) => {
    initialization = null;
    throw error;
  });
  await initialization;
}

async function initializeDatabase() {
  const db = getDatabase();
  const schema = [
    `CREATE TABLE IF NOT EXISTS vehicle_platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
      year_start INTEGER NOT NULL, year_end INTEGER NOT NULL, make TEXT NOT NULL,
      model TEXT NOT NULL, trim TEXT NOT NULL, engine TEXT NOT NULL, transmission TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id),
      slug TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
      oem_mileage_interval INTEGER, oem_time_months INTEGER,
      community_mileage_interval INTEGER, community_time_months INTEGER,
      oem_summary TEXT NOT NULL, community_summary TEXT NOT NULL,
      description TEXT NOT NULL, severity TEXT NOT NULL, UNIQUE(platform_id, slug)
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
      platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id), year INTEGER NOT NULL,
      make TEXT NOT NULL, model TEXT NOT NULL, trim TEXT NOT NULL, engine TEXT NOT NULL,
      transmission TEXT NOT NULL, nickname TEXT, current_mileage INTEGER NOT NULL,
      purchase_mileage INTEGER, purchase_date TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vehicle_profiles (
      vehicle_id INTEGER PRIMARY KEY REFERENCES vehicles(id), body_code TEXT NOT NULL,
      engine_code TEXT NOT NULL, drivetrain TEXT NOT NULL, transmission TEXT NOT NULL,
      market TEXT NOT NULL, emissions TEXT NOT NULL, production_date TEXT, vin_last7 TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      maintenance_item_id INTEGER NOT NULL REFERENCES maintenance_items(id), service_date TEXT NOT NULL,
      mileage INTEGER NOT NULL, cost REAL, shop TEXT, notes TEXT, fluid TEXT,
      fluid_quantity TEXT, parts_used TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_rules (
      maintenance_item_id INTEGER PRIMARY KEY REFERENCES maintenance_items(id),
      trims TEXT, engines TEXT, drivetrains TEXT, transmissions TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, maintenance_item_id INTEGER NOT NULL REFERENCES maintenance_items(id),
      part_name TEXT NOT NULL, oem_part_number TEXT, notes TEXT, purchase_url TEXT,
      UNIQUE(maintenance_item_id, part_name)
    )`,
    `CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT, maintenance_item_id INTEGER REFERENCES maintenance_items(id),
      known_issue_id INTEGER, source_type TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL,
      publisher TEXT NOT NULL, notes TEXT, UNIQUE(maintenance_item_id, url)
    )`,
    `CREATE TABLE IF NOT EXISTS issue_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT, platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id),
      slug TEXT NOT NULL, system TEXT NOT NULL, issue TEXT NOT NULL, description TEXT NOT NULL,
      symptoms TEXT NOT NULL, typical_mileage TEXT NOT NULL, severity TEXT NOT NULL,
      urgency TEXT NOT NULL, evidence TEXT NOT NULL, preventative_action TEXT NOT NULL,
      trims TEXT, engines TEXT, drivetrains TEXT, transmissions TEXT, UNIQUE(platform_id, slug)
    )`,
    `CREATE TABLE IF NOT EXISTS issue_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT, issue_id INTEGER NOT NULL REFERENCES issue_library(id),
      source_type TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL,
      publisher TEXT NOT NULL, notes TEXT, UNIQUE(issue_id, url)
    )`,
    "CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_vehicle_profiles_engine ON vehicle_profiles(engine_code)",
    "CREATE INDEX IF NOT EXISTS idx_records_vehicle_date ON maintenance_records(vehicle_id, service_date)",
    "CREATE INDEX IF NOT EXISTS idx_records_vehicle_item ON maintenance_records(vehicle_id, maintenance_item_id)",
    "CREATE INDEX IF NOT EXISTS idx_issue_library_engine ON issue_library(engines)",
    "CREATE INDEX IF NOT EXISTS idx_issue_library_urgency ON issue_library(urgency)",
    "CREATE INDEX IF NOT EXISTS idx_issue_sources_issue ON issue_sources(issue_id)",
  ];
  await db.batch(schema.map((statement) => db.prepare(statement)));

  await db.prepare(
    `INSERT INTO vehicle_platforms
     (slug, year_start, year_end, make, model, trim, engine, transmission)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET year_start = excluded.year_start,
       year_end = excluded.year_end, make = excluded.make, model = excluded.model,
       trim = excluded.trim, engine = excluded.engine, transmission = excluded.transmission`,
  ).bind(
    PLATFORM.slug, PLATFORM.yearStart, PLATFORM.yearEnd, PLATFORM.make,
    PLATFORM.model, PLATFORM.trim, PLATFORM.engine, PLATFORM.transmission,
  ).run();

  const platform = await db.prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
    .bind(PLATFORM.slug).first<{ id: number }>();
  if (!platform) throw new Error("Unable to initialize the F30 platform library.");

  await db.batch(MAINTENANCE_CATALOG.map((item) => db.prepare(
    `INSERT INTO maintenance_items
     (platform_id, slug, name, category, oem_mileage_interval, oem_time_months,
      community_mileage_interval, community_time_months, oem_summary,
      community_summary, description, severity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(platform_id, slug) DO UPDATE SET name = excluded.name,
       category = excluded.category, oem_mileage_interval = excluded.oem_mileage_interval,
       oem_time_months = excluded.oem_time_months,
       community_mileage_interval = excluded.community_mileage_interval,
       community_time_months = excluded.community_time_months,
       oem_summary = excluded.oem_summary, community_summary = excluded.community_summary,
       description = excluded.description, severity = excluded.severity`,
  ).bind(
    platform.id, item.slug, item.name, item.category, item.oem.mileage, item.oem.months,
    item.community.mileage, item.community.months, item.oem.summary,
    item.community.summary, item.description, item.severity,
  )));

  const itemRows = await db.prepare("SELECT id, slug FROM maintenance_items WHERE platform_id = ?")
    .bind(platform.id).all<{ id: number; slug: string }>();
  const itemIds = new Map(itemRows.results.map((row) => [row.slug, row.id]));
  const details: D1PreparedStatement[] = [];
  for (const item of MAINTENANCE_CATALOG) {
    const itemId = itemIds.get(item.slug);
    if (!itemId) continue;
    details.push(db.prepare(
      `INSERT INTO maintenance_rules (maintenance_item_id, trims, engines, drivetrains, transmissions)
       VALUES (?, ?, ?, ?, ?) ON CONFLICT(maintenance_item_id) DO UPDATE SET
       trims = excluded.trims, engines = excluded.engines,
       drivetrains = excluded.drivetrains, transmissions = excluded.transmissions`,
    ).bind(itemId, packed(item.appliesTo.trims), packed(item.appliesTo.engines),
      packed(item.appliesTo.drivetrains), packed(item.appliesTo.transmissions)));
    for (const part of item.parts) {
      details.push(db.prepare(
        `INSERT INTO parts (maintenance_item_id, part_name, oem_part_number, notes, purchase_url)
         VALUES (?, ?, ?, ?, ?) ON CONFLICT(maintenance_item_id, part_name) DO UPDATE SET
         oem_part_number = excluded.oem_part_number, notes = excluded.notes,
         purchase_url = excluded.purchase_url`,
      ).bind(itemId, part.name, part.partNumber, part.note, part.purchaseUrl ?? null));
    }
    for (const source of item.sources) {
      details.push(db.prepare(
        `INSERT INTO sources
         (maintenance_item_id, known_issue_id, source_type, title, url, publisher, notes)
         VALUES (?, NULL, ?, ?, ?, ?, ?) ON CONFLICT(maintenance_item_id, url) DO UPDATE SET
         source_type = excluded.source_type, title = excluded.title,
         publisher = excluded.publisher, notes = excluded.notes`,
      ).bind(itemId, source.type, source.title, source.url, source.publisher, source.note));
    }
  }
  if (details.length) await db.batch(details);

  await db.batch(KNOWN_ISSUES.map((issue) => db.prepare(
    `INSERT INTO issue_library
     (platform_id, slug, system, issue, description, symptoms, typical_mileage,
      severity, urgency, evidence, preventative_action, trims, engines, drivetrains, transmissions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(platform_id, slug) DO UPDATE SET system = excluded.system,
       issue = excluded.issue, description = excluded.description, symptoms = excluded.symptoms,
       typical_mileage = excluded.typical_mileage, severity = excluded.severity,
       urgency = excluded.urgency, evidence = excluded.evidence,
       preventative_action = excluded.preventative_action, trims = excluded.trims,
       engines = excluded.engines, drivetrains = excluded.drivetrains,
       transmissions = excluded.transmissions`,
  ).bind(
    platform.id, issue.slug, issue.system, issue.issue, issue.description, issue.symptoms,
    issue.typicalMileage, issue.severity, issue.urgency, issue.evidence,
    issue.preventativeAction, packed(issue.appliesTo.trims), packed(issue.appliesTo.engines),
    packed(issue.appliesTo.drivetrains), packed(issue.appliesTo.transmissions),
  )));

  const issueRows = await db.prepare("SELECT id, slug FROM issue_library WHERE platform_id = ?")
    .bind(platform.id).all<{ id: number; slug: string }>();
  const issueIds = new Map(issueRows.results.map((row) => [row.slug, row.id]));
  const sourceStatements: D1PreparedStatement[] = [];
  for (const issue of KNOWN_ISSUES) {
    const issueId = issueIds.get(issue.slug);
    if (!issueId) continue;
    for (const source of issue.sources) {
      sourceStatements.push(db.prepare(
        `INSERT INTO issue_sources (issue_id, source_type, title, url, publisher, notes)
         VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(issue_id, url) DO UPDATE SET
         source_type = excluded.source_type, title = excluded.title,
         publisher = excluded.publisher, notes = excluded.notes`,
      ).bind(issueId, source.type, source.title, source.url, source.publisher, source.note));
    }
  }
  if (sourceStatements.length) await db.batch(sourceStatements);
  await db.prepare("PRAGMA optimize").run();
}

export type RequestIdentity = {
  userId: string;
  email: string | null;
  isDemo: boolean;
  canWrite: boolean;
};

export function getRequestIdentity(request: Request): RequestIdentity {
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  const hostname = new URL(request.url).hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (userId) return { userId, email, isDemo: false, canWrite: true };
  return { userId: "__demo__", email: null, isDemo: true, canWrite: isLocal };
}

function monthsAgo(months: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

export async function ensureDemoVehicle() {
  const db = getDatabase();
  const platform = await db.prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
    .bind(PLATFORM.slug).first<{ id: number }>();
  if (!platform) throw new Error("The F30 demo platform is unavailable.");

  const existing = await db.prepare(
    `SELECT id, platform_id AS platformId FROM vehicles
     WHERE user_id = '__demo__' ORDER BY id LIMIT 1`,
  ).first<{ id: number; platformId: number }>();
  let vehicleId: number;
  let needsRecords = false;
  if (existing) {
    vehicleId = existing.id;
    needsRecords = existing.platformId !== platform.id;
    await db.prepare(
      `UPDATE vehicles SET platform_id = ?, year = 2016, make = 'BMW', model = '3 Series (F30)',
       trim = '328i', engine = 'N26 2.0L turbo I4 · SULEV', transmission = '8-speed automatic',
       nickname = 'My F30', current_mileage = 89640 WHERE id = ?`,
    ).bind(platform.id, vehicleId).run();
    if (needsRecords) await db.prepare("DELETE FROM maintenance_records WHERE vehicle_id = ?").bind(vehicleId).run();
  } else {
    const result = await db.prepare(
      `INSERT INTO vehicles
       (user_id, platform_id, year, make, model, trim, engine, transmission,
        nickname, current_mileage, purchase_mileage, purchase_date)
       VALUES ('__demo__', ?, 2016, 'BMW', '3 Series (F30)', '328i',
        'N26 2.0L turbo I4 · SULEV', '8-speed automatic', 'My F30', 89640, 61200, ?)`,
    ).bind(platform.id, monthsAgo(38)).run();
    vehicleId = Number(result.meta.last_row_id);
    needsRecords = true;
  }

  await db.prepare(
    `INSERT INTO vehicle_profiles
     (vehicle_id, body_code, engine_code, drivetrain, transmission, market, emissions)
     VALUES (?, 'F30', 'N26', 'RWD', '8-speed automatic', 'United States', 'SULEV')
     ON CONFLICT(vehicle_id) DO UPDATE SET body_code = 'F30', engine_code = 'N26',
       drivetrain = 'RWD', transmission = '8-speed automatic', market = 'United States',
       emissions = 'SULEV', updated_at = CURRENT_TIMESTAMP`,
  ).bind(vehicleId).run();

  if (!needsRecords) {
    const count = await db.prepare("SELECT COUNT(*) AS count FROM maintenance_records WHERE vehicle_id = ?")
      .bind(vehicleId).first<{ count: number }>();
    needsRecords = !count?.count;
  }
  if (!needsRecords) return vehicleId;

  const seedRecords = [
    ["engine-oil-filter", monthsAgo(7), 85320, 124.8, "Independent BMW specialist", "BMW-approved full synthetic", "5 L", "Oil filter service kit", "No active leak noted."],
    ["brake-fluid", monthsAgo(31), 72110, 149, "Independent BMW specialist", "DOT 4 LV", "1 L", null, "Baseline is now past the two-year interval."],
    ["engine-air-filter", monthsAgo(22), 74400, 48, "DIY", null, null, "Mann filter", "Airbox cleaned."],
    ["cabin-filter", monthsAgo(15), 79880, 42, "DIY", null, null, "Activated-carbon filter", "No water staining found."],
    ["spark-plugs-n20", monthsAgo(39), 62250, 238, "Independent BMW specialist", null, null, "Four OE plugs", "Coils tested; no stored misfires."],
    ["automatic-transmission-fluid", monthsAgo(37), 61200, 685, "Independent BMW specialist", "ZF LifeguardFluid 8", "Service fill", "ZF pan/filter", "Drain-and-fill at purchase baseline."],
    ["rear-differential-fluid", monthsAgo(37), 61200, 168, "Independent BMW specialist", "VIN-matched gear oil", null, "Seals", "Dry at service."],
    ["engine-coolant", monthsAgo(50), 55700, 210, "Independent BMW specialist", "BMW coolant", "50/50", null, "Cooling system pressure-tested."],
  ] as const;
  const prepared: D1PreparedStatement[] = [];
  for (const record of seedRecords) {
    const itemId = itemIdsFromCatalog(record[0], await db.prepare(
      "SELECT id, slug FROM maintenance_items WHERE platform_id = ?",
    ).bind(platform.id).all<{ id: number; slug: string }>());
    if (!itemId) continue;
    prepared.push(db.prepare(
      `INSERT INTO maintenance_records
       (vehicle_id, maintenance_item_id, service_date, mileage, cost, shop,
        fluid, fluid_quantity, parts_used, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(vehicleId, itemId, record[1], record[2], record[3], record[4],
      record[5], record[6], record[7], record[8]));
  }
  if (prepared.length) await db.batch(prepared);
  return vehicleId;
}

function itemIdsFromCatalog(slug: string, rows: D1Result<{ id: number; slug: string }>) {
  return rows.results.find((row) => row.slug === slug)?.id;
}
