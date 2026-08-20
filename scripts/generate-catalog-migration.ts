import { access, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import {
  enumerateCatalogConfigurations,
  fitmentManifestSha256,
  persistencePayload,
} from "./catalog-validation";

const requestedPath = process.argv[2];
if (!requestedPath) {
  throw new Error("Provide a new migration path, for example: supabase/migrations/20260820220000_validate_catalog_fitments.sql");
}
const target = resolve(requestedPath);
try {
  await access(target, constants.F_OK);
  throw new Error(`Refusing to overwrite an existing migration: ${target}`);
} catch (error) {
  if (error instanceof Error && error.message.startsWith("Refusing")) throw error;
}

const enumeration = enumerateCatalogConfigurations();
if (enumeration.failures.length) throw new Error(`Cannot generate a database catalog from ${enumeration.failures.length} invalid selector branches.`);

const fitments = enumeration.configurations.map((configuration) => {
  const payload = persistencePayload(configuration);
  return {
    brand: payload.brand,
    model: payload.model,
    model_year: payload.model_year,
    trim: payload.trim,
    engine_code: payload.engine_code,
    drivetrain: payload.drivetrain,
    transmission: payload.transmission,
  };
}).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
const sha256 = fitmentManifestSha256(fitments);
const json = JSON.stringify(fitments, null, 2);

const sql = `-- keeper-catalog-manifest
-- Generated from the exact vehicle configurations reachable through Keeper's UI.
-- keeper-catalog-count: ${fitments.length}
-- keeper-catalog-sha256: ${sha256}
-- Do not hand-edit the embedded manifest. Generate a new timestamped migration with:
-- pnpm run generate:catalog-migration -- supabase/migrations/<timestamp>_validate_catalog_fitments.sql

alter table public.vehicles
  drop constraint if exists vehicles_supported_fitment,
  drop constraint if exists vehicles_supported_bmw_fitment,
  drop constraint if exists vehicles_brand_check;

create table if not exists public.vehicle_catalog_fitments (
  brand text not null,
  model text not null,
  model_year integer not null,
  trim text not null,
  engine_code text not null,
  drivetrain text not null,
  transmission text not null,
  primary key (brand, model, model_year, trim, engine_code, drivetrain, transmission)
);

alter table public.vehicle_catalog_fitments enable row level security;
revoke all on public.vehicle_catalog_fitments from public, anon, authenticated;

truncate table public.vehicle_catalog_fitments;

insert into public.vehicle_catalog_fitments (
  brand, model, model_year, trim, engine_code, drivetrain, transmission
)
select
  fitment.brand,
  fitment.model,
  fitment.model_year,
  fitment.trim,
  fitment.engine_code,
  fitment.drivetrain,
  fitment.transmission
from jsonb_to_recordset($keeper_catalog$
${json}
$keeper_catalog$::jsonb) as fitment(
  brand text,
  model text,
  model_year integer,
  trim text,
  engine_code text,
  drivetrain text,
  transmission text
);

create or replace function public.validate_keeper_vehicle_fitment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.vehicle_catalog_fitments fitment
    where fitment.brand = new.brand
      and fitment.model = new.model
      and fitment.model_year = new.model_year
      and fitment.trim = new.trim
      and fitment.engine_code = new.engine_code
      and fitment.drivetrain = new.drivetrain
      and fitment.transmission = new.transmission
  ) then
    raise exception using
      errcode = '23514',
      message = 'Vehicle configuration is not in the Keeper catalog.',
      detail = format(
        '%s / %s / %s / %s / %s / %s / %s',
        new.brand,
        new.model,
        new.model_year,
        new.trim,
        new.engine_code,
        new.drivetrain,
        new.transmission
      );
  end if;
  return new;
end;
$$;

revoke all on function public.validate_keeper_vehicle_fitment() from public, anon, authenticated;

drop trigger if exists vehicles_validate_catalog_fitment on public.vehicles;
create trigger vehicles_validate_catalog_fitment
  before insert or update of brand, model, model_year, trim, engine_code, drivetrain, transmission
  on public.vehicles
  for each row execute function public.validate_keeper_vehicle_fitment();

comment on table public.vehicle_catalog_fitments is
  'Generated allow-list for every exact Keeper UI vehicle configuration. Owner data remains protected by vehicles RLS.';
`;

await writeFile(target, sql, "utf8");
console.log(`Generated ${target}`);
console.log(`Configurations: ${fitments.length}`);
console.log(`SHA-256: ${sha256}`);
