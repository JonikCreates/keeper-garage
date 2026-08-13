import {
  ensureDatabase,
  getDatabase,
  getRequestIdentity,
} from "@/lib/database";

export const dynamic = "force-dynamic";

function numberOrNull(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function textOrNull(value: unknown, limit = 500) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, limit) : null;
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const identity = getRequestIdentity(request);
    if (!identity.canWrite) {
      return Response.json(
        { error: "Sign in with ChatGPT to record maintenance." },
        { status: 401 },
      );
    }
    const payload = (await request.json()) as Record<string, unknown>;
    const maintenanceItemId = numberOrNull(payload.maintenanceItemId);
    const mileage = numberOrNull(payload.mileage);
    const serviceDate = textOrNull(payload.serviceDate, 10);
    const cost = numberOrNull(payload.cost);
    if (
      !maintenanceItemId ||
      mileage === null ||
      mileage < 0 ||
      !serviceDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)
    ) {
      return Response.json(
        { error: "Service item, date, and mileage are required." },
        { status: 400 },
      );
    }

    const db = getDatabase();
    const vehicle = await db
      .prepare("SELECT id, current_mileage AS currentMileage FROM vehicles WHERE user_id = ? ORDER BY id LIMIT 1")
      .bind(identity.userId)
      .first<{ id: number; currentMileage: number }>();
    if (!vehicle) {
      return Response.json({ error: "Add a vehicle first." }, { status: 404 });
    }
    const item = await db
      .prepare(
        `SELECT i.id FROM maintenance_items i
         JOIN vehicles v ON v.platform_id = i.platform_id
         WHERE i.id = ? AND v.id = ?`,
      )
      .bind(maintenanceItemId, vehicle.id)
      .first<{ id: number }>();
    if (!item) {
      return Response.json({ error: "Maintenance item not found." }, { status: 404 });
    }

    const result = await db
      .prepare(
        `INSERT INTO maintenance_records
         (vehicle_id, maintenance_item_id, service_date, mileage, cost, shop,
          notes, fluid, fluid_quantity, parts_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        vehicle.id,
        item.id,
        serviceDate,
        Math.round(mileage),
        cost,
        textOrNull(payload.shop, 120),
        textOrNull(payload.notes, 1500),
        textOrNull(payload.fluid, 160),
        textOrNull(payload.fluidQuantity, 80),
        textOrNull(payload.partsUsed, 500),
      )
      .run();

    if (mileage > vehicle.currentMileage) {
      await db
        .prepare("UPDATE vehicles SET current_mileage = ? WHERE id = ?")
        .bind(Math.round(mileage), vehicle.id)
        .run();
    }
    return Response.json(
      { recordId: Number(result.meta.last_row_id) },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record service.";
    return Response.json({ error: message }, { status: 500 });
  }
}
