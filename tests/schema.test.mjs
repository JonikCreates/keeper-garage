import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/20260813220000_create_keeper_garage.sql",
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
