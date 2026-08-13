import { PLATFORM } from "@/lib/catalog";
import {
  ensureDatabase,
  getDatabase,
  getRequestIdentity,
} from "@/lib/database";

export const dynamic = "force-dynamic";

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const identity = getRequestIdentity(request);
    if (!identity.canWrite) {
      return Response.json(
        { error: "Sign in with ChatGPT to save a vehicle." },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const year = asNumber(payload.year);
    const currentMileage = asNumber(payload.currentMileage);
    const purchaseMileage = asNumber(payload.purchaseMileage);
    const nickname = String(payload.nickname ?? "").trim().slice(0, 60);
    const transmission = String(payload.transmission ?? "6-speed automatic");
    const purchaseDate = String(payload.purchaseDate ?? "").trim() || null;
    if (
      year === null ||
      year < PLATFORM.yearStart ||
      year > PLATFORM.yearEnd ||
      currentMileage === null ||
      currentMileage < 0
    ) {
      return Response.json(
        { error: "Enter a supported model year and valid current mileage." },
        { status: 400 },
      );
    }

    const db = getDatabase();
    const platform = await db
      .prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
      .bind(PLATFORM.slug)
      .first<{ id: number }>();
    if (!platform) throw new Error("The supported vehicle is unavailable.");

    const existing = await db
      .prepare("SELECT id FROM vehicles WHERE user_id = ? ORDER BY id LIMIT 1")
      .bind(identity.userId)
      .first<{ id: number }>();
    if (existing) {
      await db
        .prepare(
          `UPDATE vehicles SET year = ?, transmission = ?, nickname = ?,
           current_mileage = ?, purchase_mileage = ?, purchase_date = ?
           WHERE id = ? AND user_id = ?`,
        )
        .bind(
          year,
          transmission,
          nickname || null,
          currentMileage,
          purchaseMileage,
          purchaseDate,
          existing.id,
          identity.userId,
        )
        .run();
      return Response.json({ vehicleId: existing.id });
    }

    const result = await db
      .prepare(
        `INSERT INTO vehicles
         (user_id, platform_id, year, make, model, trim, engine, transmission,
          nickname, current_mileage, purchase_mileage, purchase_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        identity.userId,
        platform.id,
        year,
        PLATFORM.make,
        PLATFORM.model,
        PLATFORM.trim,
        PLATFORM.engine,
        transmission,
        nickname || null,
        currentMileage,
        purchaseMileage,
        purchaseDate,
      )
      .run();
    return Response.json(
      { vehicleId: Number(result.meta.last_row_id) },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vehicle.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabase();
    const identity = getRequestIdentity(request);
    if (!identity.canWrite) {
      return Response.json(
        { error: "Sign in with ChatGPT to update mileage." },
        { status: 401 },
      );
    }
    const payload = (await request.json()) as { currentMileage?: unknown };
    const currentMileage = asNumber(payload.currentMileage);
    if (currentMileage === null || currentMileage < 0) {
      return Response.json({ error: "Enter a valid mileage." }, { status: 400 });
    }

    const db = getDatabase();
    const result = await db
      .prepare("UPDATE vehicles SET current_mileage = ? WHERE user_id = ?")
      .bind(currentMileage, identity.userId)
      .run();
    if (!result.meta.changes) {
      return Response.json({ error: "Vehicle not found." }, { status: 404 });
    }
    return Response.json({ currentMileage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update mileage.";
    return Response.json({ error: message }, { status: 500 });
  }
}
