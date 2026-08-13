import { env } from "cloudflare:workers";
import { KNOWN_ISSUES, MAINTENANCE_CATALOG, PLATFORM } from "./catalog";

type D1 = D1Database;

let initialization: Promise<void> | null = null;

export function getDatabase(): D1 {
  if (!env.DB) {
    throw new Error("The maintenance database is unavailable.");
  }
  return env.DB;
}

export async function ensureDatabase() {
  initialization ??= initializeDatabase().catch((error) => {
    initialization = null;
    throw error;
  });
  await initialization;
}

async function initializeDatabase() {
  const db = getDatabase();
  const statements = [
    `CREATE TABLE IF NOT EXISTS vehicle_platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      year_start INTEGER NOT NULL,
      year_end INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      trim TEXT NOT NULL,
      engine TEXT NOT NULL,
      transmission TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id),
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      oem_mileage_interval INTEGER,
      oem_time_months INTEGER,
      community_mileage_interval INTEGER,
      community_time_months INTEGER,
      oem_summary TEXT NOT NULL,
      community_summary TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      UNIQUE(platform_id, slug)
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id),
      year INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      trim TEXT NOT NULL,
      engine TEXT NOT NULL,
      transmission TEXT NOT NULL,
      nickname TEXT,
      current_mileage INTEGER NOT NULL,
      purchase_mileage INTEGER,
      purchase_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS maintenance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      maintenance_item_id INTEGER NOT NULL REFERENCES maintenance_items(id),
      service_date TEXT NOT NULL,
      mileage INTEGER NOT NULL,
      cost REAL,
      shop TEXT,
      notes TEXT,
      fluid TEXT,
      fluid_quantity TEXT,
      parts_used TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maintenance_item_id INTEGER NOT NULL REFERENCES maintenance_items(id),
      part_name TEXT NOT NULL,
      oem_part_number TEXT,
      notes TEXT,
      purchase_url TEXT,
      UNIQUE(maintenance_item_id, part_name)
    )`,
    `CREATE TABLE IF NOT EXISTS known_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL REFERENCES vehicle_platforms(id),
      slug TEXT NOT NULL,
      issue TEXT NOT NULL,
      description TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      typical_mileage TEXT,
      severity TEXT NOT NULL,
      preventative_action TEXT NOT NULL,
      UNIQUE(platform_id, slug)
    )`,
    `CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maintenance_item_id INTEGER REFERENCES maintenance_items(id),
      known_issue_id INTEGER REFERENCES known_issues(id),
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      publisher TEXT NOT NULL,
      notes TEXT,
      UNIQUE(maintenance_item_id, url)
    )`,
    "CREATE INDEX IF NOT EXISTS idx_maintenance_items_platform_category ON maintenance_items(platform_id, category)",
    "CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_records_vehicle_date ON maintenance_records(vehicle_id, service_date)",
    "CREATE INDEX IF NOT EXISTS idx_records_vehicle_item ON maintenance_records(vehicle_id, maintenance_item_id)",
    "CREATE INDEX IF NOT EXISTS idx_sources_known_issue ON sources(known_issue_id)",
  ];

  await db.batch(statements.map((statement) => db.prepare(statement)));
  await db
    .prepare(
      `INSERT OR IGNORE INTO vehicle_platforms
       (slug, year_start, year_end, make, model, trim, engine, transmission)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      PLATFORM.slug,
      PLATFORM.yearStart,
      PLATFORM.yearEnd,
      PLATFORM.make,
      PLATFORM.model,
      PLATFORM.trim,
      PLATFORM.engine,
      PLATFORM.transmission,
    )
    .run();

  const platform = await db
    .prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
    .bind(PLATFORM.slug)
    .first<{ id: number }>();
  if (!platform) throw new Error("Unable to initialize the vehicle platform.");

  await db.batch(
    MAINTENANCE_CATALOG.map((item) =>
      db
        .prepare(
          `INSERT INTO maintenance_items
           (platform_id, slug, name, category, oem_mileage_interval, oem_time_months,
            community_mileage_interval, community_time_months, oem_summary,
            community_summary, description, severity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(platform_id, slug) DO UPDATE SET
             name = excluded.name,
             category = excluded.category,
             oem_mileage_interval = excluded.oem_mileage_interval,
             oem_time_months = excluded.oem_time_months,
             community_mileage_interval = excluded.community_mileage_interval,
             community_time_months = excluded.community_time_months,
             oem_summary = excluded.oem_summary,
             community_summary = excluded.community_summary,
             description = excluded.description,
             severity = excluded.severity`,
        )
        .bind(
          platform.id,
          item.slug,
          item.name,
          item.category,
          item.oem.mileage,
          item.oem.months,
          item.community.mileage,
          item.community.months,
          item.oem.summary,
          item.community.summary,
          item.description,
          item.severity,
        ),
    ),
  );

  const itemRows = await db
    .prepare("SELECT id, slug FROM maintenance_items WHERE platform_id = ?")
    .bind(platform.id)
    .all<{ id: number; slug: string }>();
  const itemIds = new Map(itemRows.results.map((row) => [row.slug, row.id]));

  const detailStatements: D1PreparedStatement[] = [];
  for (const item of MAINTENANCE_CATALOG) {
    const itemId = itemIds.get(item.slug);
    if (!itemId) continue;
    for (const part of item.parts) {
      detailStatements.push(
        db
          .prepare(
            `INSERT INTO parts
             (maintenance_item_id, part_name, oem_part_number, notes, purchase_url)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(maintenance_item_id, part_name) DO UPDATE SET
               oem_part_number = excluded.oem_part_number,
               notes = excluded.notes,
               purchase_url = excluded.purchase_url`,
          )
          .bind(
            itemId,
            part.name,
            part.partNumber,
            part.note,
            part.purchaseUrl ?? null,
          ),
      );
    }
    for (const source of item.sources) {
      detailStatements.push(
        db
          .prepare(
            `INSERT INTO sources
             (maintenance_item_id, known_issue_id, source_type, title, url, publisher, notes)
             VALUES (?, NULL, ?, ?, ?, ?, ?)
             ON CONFLICT(maintenance_item_id, url) DO UPDATE SET
               source_type = excluded.source_type,
               title = excluded.title,
               publisher = excluded.publisher,
               notes = excluded.notes`,
          )
          .bind(
            itemId,
            source.type,
            source.title,
            source.url,
            source.publisher,
            source.note,
          ),
      );
    }
  }

  for (const issue of KNOWN_ISSUES) {
    detailStatements.push(
      db
        .prepare(
          `INSERT INTO known_issues
           (platform_id, slug, issue, description, symptoms, typical_mileage, severity, preventative_action)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(platform_id, slug) DO UPDATE SET
             issue = excluded.issue,
             description = excluded.description,
             symptoms = excluded.symptoms,
             typical_mileage = excluded.typical_mileage,
             severity = excluded.severity,
             preventative_action = excluded.preventative_action`,
        )
        .bind(
          platform.id,
          issue.slug,
          issue.issue,
          issue.description,
          issue.symptoms,
          issue.typicalMileage,
          issue.severity,
          issue.preventativeAction,
        ),
    );
  }
  if (detailStatements.length) await db.batch(detailStatements);
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
  return {
    userId: "__demo__",
    email: null,
    isDemo: true,
    canWrite: isLocal,
  };
}

function monthsAgo(months: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

export async function ensureDemoVehicle() {
  const db = getDatabase();
  const existing = await db
    .prepare("SELECT id FROM vehicles WHERE user_id = '__demo__' LIMIT 1")
    .first<{ id: number }>();
  if (existing) return existing.id;

  const platform = await db
    .prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
    .bind(PLATFORM.slug)
    .first<{ id: number }>();
  if (!platform) throw new Error("Demo platform is unavailable.");

  const result = await db
    .prepare(
      `INSERT INTO vehicles
       (user_id, platform_id, year, make, model, trim, engine, transmission,
        nickname, current_mileage, purchase_mileage, purchase_date)
       VALUES ('__demo__', ?, 2008, 'BMW', '3 Series', '335i',
        'N54 3.0L twin-turbo I6', '6-speed automatic', 'The E90', 91240, 48200, ?)`,
    )
    .bind(platform.id, monthsAgo(62))
    .run();
  const vehicleId = Number(result.meta.last_row_id);

  const seedRecords = [
    ["engine-oil-filter", monthsAgo(8), 84500, 132.45, "Northline Motorworks", "BMW LL-01 full synthetic", "6.9 qt", "Oil filter kit; sealing ring", "No leaks noted. Electronic level checked after warm-up."],
    ["spark-plugs", monthsAgo(31), 63800, 288, "DIY", null, null, "6 × Bosch plugs", "Stock calibration at time of service."],
    ["brake-fluid", monthsAgo(22), 78100, 164.2, "Northline Motorworks", "DOT 4 LV", "1 L", null, "Pressure bled; pedal firm."],
    ["engine-air-filter", monthsAgo(10), 80500, 42.8, "DIY", null, null, "Mann filter element", "Airbox vacuumed."],
    ["automatic-transmission-fluid", monthsAgo(64), 48200, 612.5, "Eurotech", "ZF Lifeguard 6", "7 L service fill", "ZF pan/filter; seals", "Pan and sleeve replaced at purchase baseline."],
    ["coolant", monthsAgo(42), 65200, 188, "Eurotech", "BMW coolant", "50/50 mix", "Expansion tank cap", "System bled with electric procedure."],
    ["intake-valve-cleaning", monthsAgo(24), 60200, 560, "Eurotech", null, null, "Intake manifold gaskets", "Walnut blast completed; cold idle improved."],
    ["cabin-microfilter", monthsAgo(14), 82400, 38.5, "DIY", null, null, "Activated-carbon microfilter", "Cowl drains cleared."],
  ] as const;

  const prepared: D1PreparedStatement[] = [];
  for (const record of seedRecords) {
    const item = await db
      .prepare("SELECT id FROM maintenance_items WHERE platform_id = ? AND slug = ?")
      .bind(platform.id, record[0])
      .first<{ id: number }>();
    if (!item) continue;
    prepared.push(
      db
        .prepare(
          `INSERT INTO maintenance_records
           (vehicle_id, maintenance_item_id, service_date, mileage, cost, shop,
            fluid, fluid_quantity, parts_used, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          vehicleId,
          item.id,
          record[1],
          record[2],
          record[3],
          record[4],
          record[5],
          record[6],
          record[7],
          record[8],
        ),
    );
  }
  if (prepared.length) await db.batch(prepared);
  return vehicleId;
}
