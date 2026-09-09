export type MaintenanceCosts = {
  cost_cents?: number | null;
  parts_cost_cents?: number | null;
  labor_cost_cents?: number | null;
};

export const MAX_MAINTENANCE_COST_CENTS = 100_000_000;

export function hasSplitCosts(record: MaintenanceCosts) {
  return record.parts_cost_cents != null || record.labor_cost_cents != null;
}

export function recordTotalCents(record: MaintenanceCosts): number | null {
  return hasSplitCosts(record)
    ? (record.parts_cost_cents ?? 0) + (record.labor_cost_cents ?? 0)
    : record.cost_cents ?? null;
}

export function maintenanceTotalCents(records: MaintenanceCosts[]) {
  return records.reduce((total, record) => total + (recordTotalCents(record) ?? 0), 0);
}

export function formatUsdCents(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
}

// Parse decimal digits directly: no floating point multiplication or rounding.
export function parseCostCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(trimmed)) throw new Error("Enter a valid cost with up to two decimal places.");
  const [dollars, cents = ""] = trimmed.split(".");
  const total = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  if (total > MAX_MAINTENANCE_COST_CENTS) throw new Error("Total cost must be at most $1,000,000.00.");
  return total;
}

export function serializeMaintenanceCosts(input: { partsCostCents: number | null; laborCostCents: number | null; costCents?: number | null }) {
  const parts = input.partsCostCents;
  const labor = input.laborCostCents;
  const legacy = input.costCents ?? null;
  for (const value of [parts, labor, legacy]) {
    if (value !== null && (!Number.isSafeInteger(value) || value < 0 || value > MAX_MAINTENANCE_COST_CENTS)) throw new Error("Invalid maintenance cost.");
  }
  const total = recordTotalCents({ parts_cost_cents: parts, labor_cost_cents: labor, cost_cents: legacy });
  if (total !== null && total > MAX_MAINTENANCE_COST_CENTS) throw new Error("Total cost must be at most $1,000,000.00.");
  // A cached total keeps older clients accurate. Readers choose the breakdown
  // OR this historical total; they never add both.
  return { parts_cost_cents: parts, labor_cost_cents: labor, cost_cents: total };
}

export function maintenanceCostDetails(record: MaintenanceCosts) {
  const total = recordTotalCents(record);
  if (total === null) return "Cost not entered";
  return hasSplitCosts(record)
    ? `Parts: ${formatUsdCents(record.parts_cost_cents ?? 0)} | Labor: ${formatUsdCents(record.labor_cost_cents ?? 0)} | Total: ${formatUsdCents(total)}`
    : `Legacy total: ${formatUsdCents(total)}`;
}
