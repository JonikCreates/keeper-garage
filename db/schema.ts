import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const vehiclePlatforms = sqliteTable(
  "vehicle_platforms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    yearStart: integer("year_start").notNull(),
    yearEnd: integer("year_end").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    trim: text("trim").notNull(),
    engine: text("engine").notNull(),
    transmission: text("transmission").notNull(),
  },
  (table) => [uniqueIndex("idx_vehicle_platforms_slug").on(table.slug)],
);

export const maintenanceItems = sqliteTable(
  "maintenance_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platformId: integer("platform_id")
      .notNull()
      .references(() => vehiclePlatforms.id),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    oemMileageInterval: integer("oem_mileage_interval"),
    oemTimeMonths: integer("oem_time_months"),
    communityMileageInterval: integer("community_mileage_interval"),
    communityTimeMonths: integer("community_time_months"),
    oemSummary: text("oem_summary").notNull(),
    communitySummary: text("community_summary").notNull(),
    description: text("description").notNull(),
    severity: text("severity").notNull(),
  },
  (table) => [
    uniqueIndex("idx_maintenance_items_platform_slug").on(
      table.platformId,
      table.slug,
    ),
    index("idx_maintenance_items_platform_category").on(
      table.platformId,
      table.category,
    ),
  ],
);

export const vehicles = sqliteTable(
  "vehicles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    platformId: integer("platform_id")
      .notNull()
      .references(() => vehiclePlatforms.id),
    year: integer("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    trim: text("trim").notNull(),
    engine: text("engine").notNull(),
    transmission: text("transmission").notNull(),
    nickname: text("nickname"),
    currentMileage: integer("current_mileage").notNull(),
    purchaseMileage: integer("purchase_mileage"),
    purchaseDate: text("purchase_date"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_vehicles_user_id").on(table.userId)],
);

export const maintenanceRecords = sqliteTable(
  "maintenance_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    maintenanceItemId: integer("maintenance_item_id")
      .notNull()
      .references(() => maintenanceItems.id),
    serviceDate: text("service_date").notNull(),
    mileage: integer("mileage").notNull(),
    cost: real("cost"),
    shop: text("shop"),
    notes: text("notes"),
    fluid: text("fluid"),
    fluidQuantity: text("fluid_quantity"),
    partsUsed: text("parts_used"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_records_vehicle_date").on(table.vehicleId, table.serviceDate),
    index("idx_records_vehicle_item").on(
      table.vehicleId,
      table.maintenanceItemId,
    ),
  ],
);

export const parts = sqliteTable(
  "parts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    maintenanceItemId: integer("maintenance_item_id")
      .notNull()
      .references(() => maintenanceItems.id),
    partName: text("part_name").notNull(),
    oemPartNumber: text("oem_part_number"),
    notes: text("notes"),
    purchaseUrl: text("purchase_url"),
  },
  (table) => [
    uniqueIndex("idx_parts_item_name").on(
      table.maintenanceItemId,
      table.partName,
    ),
  ],
);

export const knownIssues = sqliteTable(
  "known_issues",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platformId: integer("platform_id")
      .notNull()
      .references(() => vehiclePlatforms.id),
    slug: text("slug").notNull(),
    issue: text("issue").notNull(),
    description: text("description").notNull(),
    symptoms: text("symptoms").notNull(),
    typicalMileage: text("typical_mileage"),
    severity: text("severity").notNull(),
    preventativeAction: text("preventative_action").notNull(),
  },
  (table) => [
    uniqueIndex("idx_known_issues_platform_slug").on(
      table.platformId,
      table.slug,
    ),
  ],
);

export const sources = sqliteTable(
  "sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    maintenanceItemId: integer("maintenance_item_id").references(
      () => maintenanceItems.id,
    ),
    knownIssueId: integer("known_issue_id").references(() => knownIssues.id),
    sourceType: text("source_type").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    publisher: text("publisher").notNull(),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("idx_sources_item_url").on(table.maintenanceItemId, table.url),
    index("idx_sources_known_issue").on(table.knownIssueId),
  ],
);

export const vehicleProfiles = sqliteTable(
  "vehicle_profiles",
  {
    vehicleId: integer("vehicle_id")
      .primaryKey()
      .references(() => vehicles.id),
    bodyCode: text("body_code").notNull(),
    engineCode: text("engine_code").notNull(),
    drivetrain: text("drivetrain").notNull(),
    transmission: text("transmission").notNull(),
    market: text("market").notNull(),
    emissions: text("emissions").notNull(),
    productionDate: text("production_date"),
    vinLast7: text("vin_last7"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_vehicle_profiles_engine").on(table.engineCode)],
);

export const maintenanceRules = sqliteTable(
  "maintenance_rules",
  {
    maintenanceItemId: integer("maintenance_item_id")
      .primaryKey()
      .references(() => maintenanceItems.id),
    trims: text("trims"),
    engines: text("engines"),
    drivetrains: text("drivetrains"),
    transmissions: text("transmissions"),
  },
);

export const issueLibrary = sqliteTable(
  "issue_library",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    platformId: integer("platform_id")
      .notNull()
      .references(() => vehiclePlatforms.id),
    slug: text("slug").notNull(),
    system: text("system").notNull(),
    issue: text("issue").notNull(),
    description: text("description").notNull(),
    symptoms: text("symptoms").notNull(),
    typicalMileage: text("typical_mileage").notNull(),
    severity: text("severity").notNull(),
    urgency: text("urgency").notNull(),
    evidence: text("evidence").notNull(),
    preventativeAction: text("preventative_action").notNull(),
    trims: text("trims"),
    engines: text("engines"),
    drivetrains: text("drivetrains"),
    transmissions: text("transmissions"),
  },
  (table) => [
    uniqueIndex("idx_issue_library_platform_slug").on(table.platformId, table.slug),
    index("idx_issue_library_engine").on(table.engines),
    index("idx_issue_library_urgency").on(table.urgency),
  ],
);

export const issueSources = sqliteTable(
  "issue_sources",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issueLibrary.id),
    sourceType: text("source_type").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    publisher: text("publisher").notNull(),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("idx_issue_sources_issue_url").on(table.issueId, table.url),
    index("idx_issue_sources_issue").on(table.issueId),
  ],
);
