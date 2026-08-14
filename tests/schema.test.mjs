import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260813220000_create_keeper_garage.sql",
  import.meta.url,
);

const profileMigrationUrl = new URL(
  "../supabase/migrations/20260814014500_harden_profiles.sql",
  import.meta.url,
);

const generationMigrationUrl = new URL(
  "../supabase/migrations/20260814153000_expand_bmw_generations.sql",
  import.meta.url,
);

test("garage migration enforces owner-only access", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /alter table public\.vehicles enable row level security/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /auth\.uid\(\)\) = owner_id/i);
  assert.match(sql, /auth\.uid\(\)\) = user_id/i);
  assert.match(sql, /with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.doesNotMatch(sql, /grant .* to anon/i);
});

test("profile names are bounded at the database layer", async () => {
  const sql = await readFile(profileMigrationUrl, "utf8");
  assert.match(sql, /profiles_display_name_length/i);
  assert.match(sql, /char_length\(btrim\(display_name\)\) between 1 and 60/i);
});

test("garage fitment supports researched E36 and F30 variants", async () => {
  const sql = await readFile(generationMigrationUrl, "utf8");
  assert.match(sql, /vehicles_supported_bmw_fitment/i);
  assert.match(sql, /3 Series \(E36\)/);
  assert.match(sql, /3 Series \(F30\)/);
  assert.match(sql, /trim = '330i' and engine_code = 'B46'/i);
  assert.match(sql, /trim = '335i' and engine_code = 'N55'/i);
  assert.match(sql, /engine_code in \('S50US', 'S52US'\)/i);
});
