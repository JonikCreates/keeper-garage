import { PLATFORM, TRIM_OPTIONS, inferEngine } from "@/lib/catalog";
import { ensureDatabase, getDatabase, getRequestIdentity } from "@/lib/database";

export const dynamic = "force-dynamic";

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function clean(value: unknown, limit: number) {
  return String(value ?? "").trim().slice(0, limit);
}

const engineNames: Record<string, string> = {
  N20: "N20 2.0L turbo I4",
  N26: "N26 2.0L turbo I4 · SULEV",
  N47T: "N47T 2.0L turbo-diesel I4",
  "B48-PHEV": "B48 2.0L turbo I4 · plug-in hybrid",
  B58: "B58 3.0L turbo I6",
};

const emissionsFor = (engine: string) => engine === "N26" ? "SULEV" : engine === "N47T" ? "Diesel SCR" : engine === "B48-PHEV" ? "PHEV" : "Federal / verify label";

export async function POST(request: Request) {
  try {
    await ensureDatabase();
    const identity = getRequestIdentity(request);
    if (!identity.canWrite) return Response.json({ error: "Sign in with ChatGPT to save a vehicle." }, { status: 401 });

    const payload = (await request.json()) as Record<string, unknown>;
    const year = asNumber(payload.year);
    const currentMileage = asNumber(payload.currentMileage);
    const purchaseMileage = asNumber(payload.purchaseMileage);
    const trim = clean(payload.trim, 20);
    const drivetrain = clean(payload.drivetrain, 20);
    const transmission = clean(payload.transmission, 40);
    const trimOption = TRIM_OPTIONS.find((option) => option.value === trim);
    if (!trimOption || year !== 2016 || currentMileage === null || currentMileage < 0) {
      return Response.json({ error: "Choose a supported 2016 F30 configuration and enter valid mileage." }, { status: 400 });
    }
    if (!(trimOption.drivetrains as readonly string[]).includes(drivetrain) ||
        !(trimOption.transmissions as readonly string[]).includes(transmission)) {
      return Response.json({ error: "That drivetrain or transmission was not offered with the selected trim in this library." }, { status: 400 });
    }
    const inferred = inferEngine(trim, transmission);
    const requestedEngine = clean(payload.engineCode, 20);
    const engineCode = (trimOption.engines as readonly string[]).includes(requestedEngine) ? requestedEngine : inferred;
    if (trim === "328i" && ((transmission === "8-speed automatic" && engineCode !== "N26") || (transmission === "6-speed manual" && engineCode !== "N20"))) {
      return Response.json({ error: "For the U.S. 2016 328i library, the automatic maps to N26 SULEV and the manual maps to N20." }, { status: 400 });
    }

    const nickname = clean(payload.nickname, 60);
    const purchaseDate = clean(payload.purchaseDate, 10) || null;
    const productionDate = clean(payload.productionDate, 7) || null;
    const vinLast7 = clean(payload.vinLast7, 7).toUpperCase() || null;
    if (vinLast7 && !/^[A-Z0-9]{7}$/.test(vinLast7)) {
      return Response.json({ error: "Enter the VIN's final 7 letters and numbers, or leave it blank." }, { status: 400 });
    }

    const db = getDatabase();
    const platform = await db.prepare("SELECT id FROM vehicle_platforms WHERE slug = ?")
      .bind(PLATFORM.slug).first<{ id: number }>();
    if (!platform) throw new Error("The F30 platform library is unavailable.");
    const existing = await db.prepare("SELECT id, platform_id AS platformId FROM vehicles WHERE user_id = ? ORDER BY id LIMIT 1")
      .bind(identity.userId).first<{ id: number; platformId: number }>();
    let vehicleId: number;
    if (existing) {
      if (existing.platformId !== platform.id) {
        await db.prepare("DELETE FROM maintenance_records WHERE vehicle_id = ?").bind(existing.id).run();
      }
      await db.prepare(
        `UPDATE vehicles SET platform_id = ?, year = 2016, make = 'BMW', model = '3 Series (F30)',
         trim = ?, engine = ?, transmission = ?, nickname = ?, current_mileage = ?,
         purchase_mileage = ?, purchase_date = ? WHERE id = ? AND user_id = ?`,
      ).bind(platform.id, trim, engineNames[engineCode], transmission, nickname || null,
        currentMileage, purchaseMileage, purchaseDate, existing.id, identity.userId).run();
      vehicleId = existing.id;
    } else {
      const result = await db.prepare(
        `INSERT INTO vehicles
         (user_id, platform_id, year, make, model, trim, engine, transmission,
          nickname, current_mileage, purchase_mileage, purchase_date)
         VALUES (?, ?, 2016, 'BMW', '3 Series (F30)', ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(identity.userId, platform.id, trim, engineNames[engineCode], transmission,
        nickname || null, currentMileage, purchaseMileage, purchaseDate).run();
      vehicleId = Number(result.meta.last_row_id);
    }
    await db.prepare(
      `INSERT INTO vehicle_profiles
       (vehicle_id, body_code, engine_code, drivetrain, transmission, market,
        emissions, production_date, vin_last7, updated_at)
       VALUES (?, 'F30', ?, ?, ?, 'United States', ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(vehicle_id) DO UPDATE SET body_code = 'F30', engine_code = excluded.engine_code,
        drivetrain = excluded.drivetrain, transmission = excluded.transmission,
        market = excluded.market, emissions = excluded.emissions,
        production_date = excluded.production_date, vin_last7 = excluded.vin_last7,
        updated_at = CURRENT_TIMESTAMP`,
    ).bind(vehicleId, engineCode, drivetrain, transmission, emissionsFor(engineCode), productionDate, vinLast7).run();
    return Response.json({ vehicleId }, { status: existing ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vehicle.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabase();
    const identity = getRequestIdentity(request);
    if (!identity.canWrite) return Response.json({ error: "Sign in with ChatGPT to update mileage." }, { status: 401 });
    const payload = (await request.json()) as { currentMileage?: unknown };
    const currentMileage = asNumber(payload.currentMileage);
    if (currentMileage === null || currentMileage < 0) return Response.json({ error: "Enter a valid mileage." }, { status: 400 });
    const db = getDatabase();
    const result = await db.prepare("UPDATE vehicles SET current_mileage = ? WHERE user_id = ?")
      .bind(currentMileage, identity.userId).run();
    if (!result.meta.changes) return Response.json({ error: "Vehicle not found." }, { status: 404 });
    return Response.json({ currentMileage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update mileage.";
    return Response.json({ error: message }, { status: 500 });
  }
}
