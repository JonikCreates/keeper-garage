-- keeper-catalog-manifest
-- Generated from the exact vehicle configurations reachable through Keeper's UI.
-- keeper-catalog-count: 2329
-- keeper-catalog-sha256: fe216c8cd094dd62dc89729ff9be1f81e7f6c17577a30dd9602310153e695d96
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
[
  {
    "brand": "Acura",
    "model": "Integra Type S (DE5)",
    "model_year": 2024,
    "trim": "Integra Type S",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Acura",
    "model": "Integra Type S (DE5)",
    "model_year": 2025,
    "trim": "Integra Type S",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Acura",
    "model": "Integra Type S (DE5)",
    "model_year": 2026,
    "trim": "Integra Type S",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2009,
    "trim": "A4 Avant",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2009,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2009,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2009,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "A4 Avant",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2010,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2011,
    "trim": "A4 Avant",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2011,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2011,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2011,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2011,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2012,
    "trim": "A4 Avant",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2012,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2012,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2012,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2012,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CCBA-CGWC family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2013,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2013,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2013,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2013,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2013,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2014,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2014,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2014,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2014,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2014,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2015,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2015,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2015,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2015,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2015,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2016,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2016,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2016,
    "trim": "A4",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2016,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Audi",
    "model": "A4 / S4 (B8/B8.5)",
    "model_year": 2016,
    "trim": "S4",
    "engine_code": "3.0 TFSI supercharged V6 / CGXC-CTUB family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2012,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CTUA-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2012,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2012,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2013,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CTUA-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2013,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2013,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2013,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / CEUC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2014,
    "trim": "A6 TDI",
    "engine_code": "3.0 TDI Gen2 / CPNB-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2014,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CTUA-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2014,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2014,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2014,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / CEUC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2015,
    "trim": "A6 TDI",
    "engine_code": "3.0 TDI Gen2 / CPNB-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2015,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CTUA-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2015,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2015,
    "trim": "A6",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "Multitronic CVT"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2015,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / CEUC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2016,
    "trim": "A6 TDI",
    "engine_code": "3.0 TDI Gen2 / CPNB-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2016,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CREC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2016,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2016,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed S tronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2016,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / CTGE-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2017,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CREC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2017,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2017,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed S tronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2017,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / CTGE-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2018,
    "trim": "A6",
    "engine_code": "3.0 TFSI supercharged V6 / CREC-family",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2018,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD (quattro)",
    "transmission": "8-speed Tiptronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2018,
    "trim": "A6",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed S tronic"
  },
  {
    "brand": "Audi",
    "model": "A6 / S6 (C7/C7.5)",
    "model_year": 2018,
    "trim": "S6",
    "engine_code": "4.0 TFSI twin-turbo V8 / late C7.5 family",
    "drivetrain": "AWD (quattro)",
    "transmission": "7-speed S tronic / DL501"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2008,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2008,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2008,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2008,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2009,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2009,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2009,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2009,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2010,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2010,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2010,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2010,
    "trim": "135i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2011,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2011,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2011,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2011,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2012,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2012,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2012,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2012,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "128i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "135i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "135is Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Convertible (E88)",
    "model_year": 2013,
    "trim": "135is Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2008,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2008,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2008,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2008,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2009,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2009,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2009,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2009,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2010,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2010,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2010,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2010,
    "trim": "135i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2011,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2011,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2011,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2011,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2012,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2012,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2012,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2012,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "128i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "135i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "135is Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "1 Series Coupe (E82)",
    "model_year": 2013,
    "trim": "135is Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed dual-clutch"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2014,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2015,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "228i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2016,
    "trim": "M235i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2017,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2018,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2019,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2020,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "230i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series (F22)",
    "model_year": 2021,
    "trim": "M240i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2022,
    "trim": "230i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2022,
    "trim": "230i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2022,
    "trim": "M240i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "230i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "230i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "230i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "230i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "M240i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2023,
    "trim": "M240i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "230i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "230i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "230i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "230i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "M240i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2024,
    "trim": "M240i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "230i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "230i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "230i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "230i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "M240i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2025,
    "trim": "M240i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "230i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "230i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "230i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "230i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "M240i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "2 Series Coupe (G42)",
    "model_year": 2026,
    "trim": "M240i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "325i",
    "engine_code": "M50-NV",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "325i",
    "engine_code": "M50-NV",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "325is",
    "engine_code": "M50-NV",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1992,
    "trim": "325is",
    "engine_code": "M50-NV",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1993,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318ic",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318ic",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325ic",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325ic",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1994,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318i",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318ic",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318ic",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318is",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318ti",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "318ti",
    "engine_code": "M42",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325i",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325ic",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325ic",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "325is",
    "engine_code": "M50TU",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "M3",
    "engine_code": "S50US",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1995,
    "trim": "M3",
    "engine_code": "S50US",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1996,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1997,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318i",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318ic",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318is",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323i",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323i",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323ic",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323ic",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323is",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "323is",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1998,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "318ti",
    "engine_code": "M44",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323i",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323i",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323ic",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323ic",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323is",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "323is",
    "engine_code": "M52B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328ic",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "328is",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E36)",
    "model_year": 1999,
    "trim": "M3",
    "engine_code": "S52US",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 1999,
    "trim": "323i",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 1999,
    "trim": "323i",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 1999,
    "trim": "328i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 1999,
    "trim": "328i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323Ci",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323Ci",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323Cic",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323i",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323i",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323iT",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "323iT",
    "engine_code": "M52TUB25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "328Ci",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "328Ci",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "328i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2000,
    "trim": "328i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2001,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2002,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Ci",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325Cic",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325i",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325iT",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2003,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Ci",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325Cic",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325i",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325iT",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2004,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Ci",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325Cic",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325i",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325iT",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325xi",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "325xiT",
    "engine_code": "M54B25",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "330xi",
    "engine_code": "M54B30",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2005,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Ci",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Ci",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Cic",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "325Cic",
    "engine_code": "M56B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "330Ci",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "330Cic",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "M3",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (E46)",
    "model_year": 2006,
    "trim": "M3Cic",
    "engine_code": "S54B32",
    "drivetrain": "RWD",
    "transmission": "6-speed SMG II"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2012,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2013,
    "trim": "ActiveHybrid 3",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "Hybrid 8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2014,
    "trim": "ActiveHybrid 3",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "Hybrid 8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "335i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2015,
    "trim": "ActiveHybrid 3",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "Hybrid 8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "328i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "330e",
    "engine_code": "B48-PHEV",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2016,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "330e",
    "engine_code": "B48-PHEV",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2017,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "320i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "328d",
    "engine_code": "N47T",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "330e",
    "engine_code": "B48-PHEV",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series (F30)",
    "model_year": 2018,
    "trim": "340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2019,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2019,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2019,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2019,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2020,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2021,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2022,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330e",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2023,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2024,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2025,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "330i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "330i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series (G20)",
    "model_year": 2026,
    "trim": "M340i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2007,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2008,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2009,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "335i Convertible",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2010,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2011,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2012,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "328i Convertible",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "328i Convertible",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "335i Convertible",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "335is Convertible",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Convertible / M3 Convertible (E93)",
    "model_year": 2013,
    "trim": "M3 Convertible",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2007,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2008,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2009,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "335i Coupe",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2010,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2011,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2012,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328i Coupe",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328i Coupe",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "328xi / 328i xDrive Coupe",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335i Coupe",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335is Coupe",
    "engine_code": "N54T",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "335xi / 335i xDrive Coupe",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Coupe / M3 Coupe (E92)",
    "model_year": 2013,
    "trim": "M3 Coupe",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "325i Sedan",
    "engine_code": "N52",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "325i Sedan",
    "engine_code": "N52",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "325xi Sedan",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "325xi Sedan",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "330i Sedan",
    "engine_code": "N52",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "330i Sedan",
    "engine_code": "N52",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "330xi Sedan",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2006,
    "trim": "330xi Sedan",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2007,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2008,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "335d Sedan",
    "engine_code": "M57Y",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2009,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "335d Sedan",
    "engine_code": "M57Y",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "335i Sedan",
    "engine_code": "N54",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N54",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2010,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328i Sedan",
    "engine_code": "N51",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328i Sedan",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N51",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sedan",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "335d Sedan",
    "engine_code": "M57Y",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "335i Sedan",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "335i Sedan",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "335xi / 335i xDrive Sedan",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sedan / M3 Sedan (E90)",
    "model_year": 2011,
    "trim": "M3 Sedan",
    "engine_code": "S65",
    "drivetrain": "RWD",
    "transmission": "7-speed M DCT"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2006,
    "trim": "325xi Sports Wagon",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2006,
    "trim": "325xi Sports Wagon",
    "engine_code": "N52",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2007,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2007,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2007,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2008,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2008,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2008,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2009,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2009,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2009,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2010,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2010,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2010,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2011,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2011,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2011,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2012,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2012,
    "trim": "328i Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "3 Series Sports Wagon (E91)",
    "model_year": 2012,
    "trim": "328xi / 328i xDrive Sports Wagon",
    "engine_code": "N52K",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Convertible (F33)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2014,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2015,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "428i",
    "engine_code": "N26",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2016,
    "trim": "435i",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2017,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2018,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2019,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "430i",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (F32)",
    "model_year": 2020,
    "trim": "440i",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2021,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2022,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2023,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2024,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2025,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "430i Coupe",
    "engine_code": "B46",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "430i Coupe",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "430i xDrive Coupe",
    "engine_code": "B46",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "430i xDrive Coupe",
    "engine_code": "B48",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "M440i Coupe",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "4 Series Coupe (G22)",
    "model_year": 2026,
    "trim": "M440i xDrive Coupe",
    "engine_code": "B58",
    "drivetrain": "xDrive",
    "transmission": "8-speed Steptronic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1997,
    "trim": "528i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1997,
    "trim": "528i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1997,
    "trim": "540i",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1997,
    "trim": "540i",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1997,
    "trim": "540iT",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1998,
    "trim": "528i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1998,
    "trim": "528i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1998,
    "trim": "540i",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1998,
    "trim": "540i",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1998,
    "trim": "540iT",
    "engine_code": "M62B44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "528i",
    "engine_code": "M52B28",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "528i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "528i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "528iT",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "528iT",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 1999,
    "trim": "540iT",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "528i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "528i",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "528iT",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "528iT",
    "engine_code": "M52TUB28",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "540iT",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2000,
    "trim": "M5",
    "engine_code": "S62B50",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "540iT",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2001,
    "trim": "M5",
    "engine_code": "S62B50",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "540iT",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2002,
    "trim": "M5",
    "engine_code": "S62B50",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "525i",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "525iT",
    "engine_code": "M54B25",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "530i",
    "engine_code": "M54B30",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "540i",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "540iT",
    "engine_code": "M62TUB44",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (E39)",
    "model_year": 2003,
    "trim": "M5",
    "engine_code": "S62B50",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "528i",
    "engine_code": "N52",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "550i xDrive",
    "engine_code": "N63",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2011,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "528i xDrive",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "528i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "550i xDrive",
    "engine_code": "N63",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2012,
    "trim": "ActiveHybrid 5",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed hybrid automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "528i xDrive",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "528i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "550i xDrive",
    "engine_code": "N63",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "550i",
    "engine_code": "N63",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2013,
    "trim": "ActiveHybrid 5",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed hybrid automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "528i xDrive",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "528i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "535d xDrive",
    "engine_code": "N57TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "535d",
    "engine_code": "N57TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "550i xDrive",
    "engine_code": "N63TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "550i",
    "engine_code": "N63TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2014,
    "trim": "ActiveHybrid 5",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed hybrid automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "528i xDrive",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "528i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "535d xDrive",
    "engine_code": "N57TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "535d",
    "engine_code": "N57TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "550i xDrive",
    "engine_code": "N63TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "550i",
    "engine_code": "N63TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2015,
    "trim": "ActiveHybrid 5",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed hybrid automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "528i xDrive",
    "engine_code": "N20",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "528i",
    "engine_code": "N20",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "535d xDrive",
    "engine_code": "N57TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "535d",
    "engine_code": "N57TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "535i xDrive",
    "engine_code": "N55",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "535i",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "550i xDrive",
    "engine_code": "N63TU",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "550i",
    "engine_code": "N63TU",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "5 Series (F10)",
    "model_year": 2016,
    "trim": "ActiveHybrid 5",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "8-speed hybrid automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2016,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2016,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2017,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2017,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2018,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2018,
    "trim": "M2",
    "engine_code": "N55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2019,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2019,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2020,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2020,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2021,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (F87)",
    "model_year": 2021,
    "trim": "M2 Competition",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2023,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2023,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2024,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2024,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2025,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2025,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2026,
    "trim": "M2 CS",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2026,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2026,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M2 (G87)",
    "model_year": 2026,
    "trim": "M2",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2015,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2015,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2016,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2016,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2017,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2017,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2018,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (F80)",
    "model_year": 2018,
    "trim": "M3",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2021,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2021,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2022,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2022,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2022,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2023,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2023,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2023,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2024,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2024,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2024,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2025,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2025,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2026,
    "trim": "M3 Competition",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M3 (G80)",
    "model_year": 2026,
    "trim": "M3",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2021,
    "trim": "M4 Competition Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2021,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2022,
    "trim": "M4 Competition Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2022,
    "trim": "M4 Competition xDrive Coupe",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2022,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2023,
    "trim": "M4 Competition Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2023,
    "trim": "M4 Competition xDrive Coupe",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2023,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2024,
    "trim": "M4 Competition Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2024,
    "trim": "M4 Competition xDrive Coupe",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2024,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2025,
    "trim": "M4 Competition xDrive Coupe",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2025,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2026,
    "trim": "M4 Competition xDrive Coupe",
    "engine_code": "S58",
    "drivetrain": "xDrive",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "M4 (G82)",
    "model_year": 2026,
    "trim": "M4 Coupe",
    "engine_code": "S58",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2015,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2015,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2016,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2016,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2017,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2017,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2018,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2018,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2019,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2019,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2020,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Convertible (F83)",
    "model_year": 2020,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2015,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2015,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2016,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2016,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2017,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2017,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2018,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2018,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2019,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2019,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2020,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "BMW",
    "model": "M4 Coupe (F82)",
    "model_year": 2020,
    "trim": "M4",
    "engine_code": "S55",
    "drivetrain": "RWD",
    "transmission": "7-speed DCT"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2013,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "6-speed manual GS6-53BZ"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2013,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "7-speed M-DCT"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2014,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "6-speed manual GS6-53BZ"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2014,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "7-speed M-DCT"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2015,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "6-speed manual GS6-53BZ"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2015,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "7-speed M-DCT"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2016,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "6-speed manual GS6-53BZ"
  },
  {
    "brand": "BMW",
    "model": "M5 (F10)",
    "model_year": 2016,
    "trim": "M5",
    "engine_code": "S63TU",
    "drivetrain": "RWD",
    "transmission": "7-speed M-DCT"
  },
  {
    "brand": "BMW",
    "model": "X5 xDrive35d (E70)",
    "model_year": 2009,
    "trim": "xDrive35d",
    "engine_code": "M57Y",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "X5 xDrive35d (E70)",
    "model_year": 2010,
    "trim": "xDrive35d",
    "engine_code": "M57Y",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "X5 xDrive35d (E70)",
    "model_year": 2011,
    "trim": "xDrive35d",
    "engine_code": "M57Y",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "X5 xDrive35d (E70)",
    "model_year": 2012,
    "trim": "xDrive35d",
    "engine_code": "M57Y",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "BMW",
    "model": "X5 xDrive35d (E70)",
    "model_year": 2013,
    "trim": "xDrive35d",
    "engine_code": "M57Y",
    "drivetrain": "xDrive",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2015,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2016,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "6R80 6-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Mustang V6",
    "engine_code": "3.7L Ti-VCT Cyclone V6",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2017,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2018,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2018,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2018,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2018,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2018,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Mustang Bullitt",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2019,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Mustang Bullitt",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Shelby GT350 / GT350R",
    "engine_code": "VOODOO",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2020,
    "trim": "Shelby GT500",
    "engine_code": "PREDATOR",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-9070 7-speed DCT"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2021,
    "trim": "Shelby GT500",
    "engine_code": "PREDATOR",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-9070 7-speed DCT"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2022,
    "trim": "Shelby GT500",
    "engine_code": "PREDATOR",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-9070 7-speed DCT"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang EcoBoost",
    "engine_code": "ECOBOOST",
    "drivetrain": "RWD",
    "transmission": "Getrag MT82 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang GT",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "MT82-D4 6-speed manual"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "10R80 10-speed automatic"
  },
  {
    "brand": "Ford",
    "model": "Mustang (S550)",
    "model_year": 2023,
    "trim": "Mustang Mach 1",
    "engine_code": "COYOTE",
    "drivetrain": "RWD",
    "transmission": "Tremec TR-3160 6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "Civic Type R (FL5)",
    "model_year": 2023,
    "trim": "Civic Type R",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "Civic Type R (FL5)",
    "model_year": 2024,
    "trim": "Civic Type R",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "Civic Type R (FL5)",
    "model_year": 2025,
    "trim": "Civic Type R",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "Civic Type R (FL5)",
    "model_year": 2026,
    "trim": "Civic Type R",
    "engine_code": "K20C1",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP1)",
    "model_year": 2000,
    "trim": "S2000",
    "engine_code": "F20C",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP1)",
    "model_year": 2001,
    "trim": "S2000",
    "engine_code": "F20C",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP1)",
    "model_year": 2002,
    "trim": "S2000",
    "engine_code": "F20C",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP1)",
    "model_year": 2003,
    "trim": "S2000",
    "engine_code": "F20C",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2004,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2005,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2006,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2007,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2008,
    "trim": "S2000 CR",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2008,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2009,
    "trim": "S2000 CR",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Honda",
    "model": "S2000 (AP2)",
    "model_year": 2009,
    "trim": "S2000",
    "engine_code": "F22C1 2.2L DOHC VTEC / DBW",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2001,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2002,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2002,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "W55 5-speed manual"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2002,
    "trim": "Lexus IS300 SportCross / Toyota Altezza Gita AS300 RWD",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2003,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2003,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "W55 5-speed manual"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2003,
    "trim": "Lexus IS300 SportCross / Toyota Altezza Gita AS300 RWD",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2004,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2004,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "W55 5-speed manual"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2004,
    "trim": "Lexus IS300 SportCross / Toyota Altezza Gita AS300 RWD",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2005,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "A650E 5-speed automatic"
  },
  {
    "brand": "Lexus",
    "model": "IS 300 (XE10)",
    "model_year": 2005,
    "trim": "Lexus IS300 sedan",
    "engine_code": "2JZ-GE",
    "drivetrain": "RWD",
    "transmission": "W55 5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1990,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1990,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1991,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1991,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1992,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1992,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1993,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1993,
    "trim": "MX-5 Miata · 1.6L",
    "engine_code": "B6",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1994,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1994,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1995,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1995,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1996,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1996,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1997,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NA)",
    "model_year": 1997,
    "trim": "MX-5 Miata · 1.8L",
    "engine_code": "1.8L BP DOHC",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 1999,
    "trim": "MX-5 Miata · NB1",
    "engine_code": "BP-4W",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 1999,
    "trim": "MX-5 Miata · NB1",
    "engine_code": "BP-4W",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2000,
    "trim": "MX-5 Miata · NB1",
    "engine_code": "BP-4W",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2000,
    "trim": "MX-5 Miata · NB1",
    "engine_code": "BP-4W",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2001,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2001,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2001,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2002,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2002,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2002,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2003,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2003,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2003,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2004,
    "trim": "Mazdaspeed MX-5",
    "engine_code": "BP Turbo",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2004,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2004,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2004,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2005,
    "trim": "Mazdaspeed MX-5",
    "engine_code": "BP Turbo",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2005,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2005,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NB)",
    "model_year": 2005,
    "trim": "MX-5 Miata · NB2",
    "engine_code": "BP-Z3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2006,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2006,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2006,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2007,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2007,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2007,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2008,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2008,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2008,
    "trim": "MX-5 Miata · NC1",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2009,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2009,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2009,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2010,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2010,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2010,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2011,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2011,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2011,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2012,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2012,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2012,
    "trim": "MX-5 Miata · NC2",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2013,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2013,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2013,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2014,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2014,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2014,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2015,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2015,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (NC)",
    "model_year": 2015,
    "trim": "MX-5 Miata · NC3",
    "engine_code": "LF-VE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2016,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2016,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2017,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2017,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2018,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2018,
    "trim": "MX-5 Miata · ND1",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2019,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2019,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2020,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2020,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2021,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2021,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2022,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2022,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2023,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2023,
    "trim": "MX-5 Miata · ND2",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2024,
    "trim": "MX-5 Miata · ND3",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2024,
    "trim": "MX-5 Miata · ND3",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2025,
    "trim": "MX-5 Miata · ND3",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Mazda",
    "model": "MX-5 Miata (ND)",
    "model_year": 2025,
    "trim": "MX-5 Miata · ND3",
    "engine_code": "SKYACTIV-G 2.0L",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2002,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2003,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2003,
    "trim": "G55 AMG",
    "engine_code": "M113 AMG 5.4L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2004,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2004,
    "trim": "G55 AMG",
    "engine_code": "M113 AMG 5.4L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2005,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2005,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2006,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2006,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2007,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2007,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2008,
    "trim": "G500",
    "engine_code": "M113 5.0L naturally aspirated V8",
    "drivetrain": "AWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2008,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2009,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2009,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2010,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2010,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2011,
    "trim": "G55 AMG Kompressor",
    "engine_code": "M113K",
    "drivetrain": "AWD",
    "transmission": "5-speed AMG automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2011,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2012,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2013,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2013,
    "trim": "G63 AMG",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2014,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2014,
    "trim": "G63 AMG",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2015,
    "trim": "G550",
    "engine_code": "M273",
    "drivetrain": "AWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2015,
    "trim": "G63 AMG",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2016,
    "trim": "G550",
    "engine_code": "M176",
    "drivetrain": "AWD",
    "transmission": "7G-TRONIC PLUS"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2016,
    "trim": "Mercedes-AMG G63",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2016,
    "trim": "Mercedes-AMG G65",
    "engine_code": "M279 6.0L biturbo V12",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2017,
    "trim": "G550 4x4²",
    "engine_code": "M176",
    "drivetrain": "AWD",
    "transmission": "7G-TRONIC PLUS"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2017,
    "trim": "G550",
    "engine_code": "M176",
    "drivetrain": "AWD",
    "transmission": "7G-TRONIC PLUS"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2017,
    "trim": "Mercedes-AMG G63",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2017,
    "trim": "Mercedes-AMG G65",
    "engine_code": "M279 6.0L biturbo V12",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2018,
    "trim": "G550 4x4²",
    "engine_code": "M176",
    "drivetrain": "AWD",
    "transmission": "7G-TRONIC PLUS"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2018,
    "trim": "G550",
    "engine_code": "M176",
    "drivetrain": "AWD",
    "transmission": "7G-TRONIC PLUS"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2018,
    "trim": "Mercedes-AMG G63",
    "engine_code": "M157",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "G-Class (W463)",
    "model_year": 2018,
    "trim": "Mercedes-AMG G65",
    "engine_code": "M279 6.0L biturbo V12",
    "drivetrain": "AWD",
    "transmission": "AMG SPEEDSHIFT PLUS 7-speed"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1990,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1990,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1990,
    "trim": "500SL",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1991,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1991,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1991,
    "trim": "500SL",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1992,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1992,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1992,
    "trim": "500SL",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1993,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1993,
    "trim": "300SL",
    "engine_code": "M104.981",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1993,
    "trim": "500SL",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1993,
    "trim": "600SL",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1994,
    "trim": "SL320",
    "engine_code": "M104",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1994,
    "trim": "SL500",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1994,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1995,
    "trim": "SL320",
    "engine_code": "M104",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1995,
    "trim": "SL500",
    "engine_code": "M119",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1995,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1996,
    "trim": "SL320",
    "engine_code": "M104",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1996,
    "trim": "SL500",
    "engine_code": "M119.982",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1996,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1997,
    "trim": "SL320",
    "engine_code": "M104",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1997,
    "trim": "SL500",
    "engine_code": "M119.982",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1997,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1998,
    "trim": "SL500",
    "engine_code": "M119.982",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1998,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1999,
    "trim": "SL500",
    "engine_code": "M113.961",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 1999,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2000,
    "trim": "SL500",
    "engine_code": "M113.961",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2000,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2001,
    "trim": "SL500",
    "engine_code": "M113.961",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2001,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2002,
    "trim": "SL500",
    "engine_code": "M113.961",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Mercedes-Benz",
    "model": "SL-Class (R129)",
    "model_year": 2002,
    "trim": "SL600",
    "engine_code": "M120",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1989,
    "trim": "180SX Type I/II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1989,
    "trim": "180SX Type I/II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1989,
    "trim": "180SX Type II HICAS II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1989,
    "trim": "180SX Type II HICAS II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1990,
    "trim": "180SX Type I/II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1990,
    "trim": "180SX Type I/II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1990,
    "trim": "180SX Type II HICAS II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1990,
    "trim": "180SX Type II HICAS II",
    "engine_code": "CA18DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1991,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1991,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1991,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1991,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1992,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1992,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1992,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1992,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1993,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1993,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1993,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1993,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Super HICAS package",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type I/II",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1994,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1995,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1995,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1995,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1995,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X era",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1996,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1997,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type R/X Super HICAS",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type R/X",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "180SX (S13)",
    "model_year": 1998,
    "trim": "180SX Type S / Type G",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1989,
    "trim": "240SX XE/SE",
    "engine_code": "KA24E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1989,
    "trim": "240SX XE/SE",
    "engine_code": "KA24E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1990,
    "trim": "240SX XE/SE",
    "engine_code": "KA24E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1990,
    "trim": "240SX XE/SE",
    "engine_code": "KA24E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1991,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1991,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1991,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1991,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1992,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1992,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1992,
    "trim": "240SX SE/LE Convertible",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1992,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1992,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1993,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1993,
    "trim": "240SX SE Fastback Sport Package — HICAS",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1993,
    "trim": "240SX SE/LE Convertible",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1993,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1993,
    "trim": "240SX XE/SE/LE",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S13)",
    "model_year": 1994,
    "trim": "240SX SE/LE Convertible",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1995,
    "trim": "240SX Base / SE — Zenki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1995,
    "trim": "240SX Base / SE — Zenki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1996,
    "trim": "240SX Base / SE — Zenki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1996,
    "trim": "240SX Base / SE — Zenki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1997,
    "trim": "240SX Base / SE / LE — Kouki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1997,
    "trim": "240SX Base / SE / LE — Kouki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1998,
    "trim": "240SX Base / SE / LE — Kouki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "240SX (S14)",
    "model_year": 1998,
    "trim": "240SX Base / SE / LE — Kouki",
    "engine_code": "KA24DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2003,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2003,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / early CD-series"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2004,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2004,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / early CD-series"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2005,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2005,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / later CD-series"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2006,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2006,
    "trim": "350Z",
    "engine_code": "VQ35DE",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / later CD-series"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2007,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2007,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / JK-series with internal CSC"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2007,
    "trim": "NISMO",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2008,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2008,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / JK-series with internal CSC"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2008,
    "trim": "NISMO",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2009,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "5-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "350Z (Z33)",
    "model_year": 2009,
    "trim": "350Z",
    "engine_code": "VQ35HR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / JK-series with internal CSC"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2009,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2009,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2009,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2010,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2010,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2010,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2011,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2011,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2011,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2012,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2012,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2012,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2013,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2013,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2013,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2014,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2014,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2014,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2015,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2015,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2015,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2015,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2016,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2016,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2016,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2016,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2017,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2017,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2017,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2017,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2018,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2018,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2018,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2018,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2019,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2019,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2019,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2019,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2020,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual / SynchroRev where equipped"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2020,
    "trim": "370Z",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2020,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "370Z (Z34)",
    "model_year": 2020,
    "trim": "NISMO",
    "engine_code": "VQ37VHR",
    "drivetrain": "RWD",
    "transmission": "7-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2009,
    "trim": "GT-R / GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2010,
    "trim": "GT-R / GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2011,
    "trim": "GT-R / GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2012,
    "trim": "GT-R Premium / Black Edition",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2013,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2014,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2015,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2015,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2016,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2016,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2017,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2017,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2018,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2018,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2019,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2019,
    "trim": "GT-R",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2020,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2020,
    "trim": "GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2021,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2021,
    "trim": "GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2023,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2023,
    "trim": "GT-R Premium",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2024,
    "trim": "GT-R NISMO",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "GT-R (R35)",
    "model_year": 2024,
    "trim": "GT-R Premium / T-spec",
    "engine_code": "VR38DETT",
    "drivetrain": "AWD",
    "transmission": "GR6 6-speed dual-clutch transaxle"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1993,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "NISMO 270R",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1994,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1995,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "J's / Q's — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / K's Type S — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's / Type S HICAS — Zenki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "Q's / Type S HICAS — Zenki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1996,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "Autech Version K's MF-T",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1997,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "Autech Version K's MF-T",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "J's / Q's / Q's Aero — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "K's / K's Aero / SE — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "K's Aero HICAS — Kouki",
    "engine_code": "SR20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Silvia (S14)",
    "model_year": 1998,
    "trim": "Q's Aero HICAS — Kouki",
    "engine_code": "SR20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GT-R — Early (1989–Jul 1991)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1989,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GT-R — Early (1989–Jul 1991)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GT-R NISMO",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1990,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GT-R — Early (1989–Jul 1991)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GT-R — Mid (Aug 1991–Jan 1993)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1991,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GT-R — Mid (Aug 1991–Jan 1993)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1992,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GT-R — Late (Feb 1993–Nov 1994)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GT-R — Mid (Aug 1991–Jan 1993)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTE",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS / Type J",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS Type S",
    "engine_code": "RB20DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS-4",
    "engine_code": "RB20DET",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS-t / Type M",
    "engine_code": "RB20DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GTS25",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1993,
    "trim": "GXi",
    "engine_code": "CA18i",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1994,
    "trim": "GT-R — Late (Feb 1993–Nov 1994)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1994,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1994,
    "trim": "GT-R V-Spec II",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R32)",
    "model_year": 1994,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1993,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1994,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GT-R",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS-4 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS25 — Series 1",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1995,
    "trim": "GTS25t Type M — Series 1",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GT-R LM Limited / V-Spec LM",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GT-R",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1996,
    "trim": "NISMO 400R",
    "engine_code": "RB-X GT2",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GT-R",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1997,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GT-R Autech 40th Anniversary (4-door)",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GT-R N1 / V-Spec N1",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GT-R V-Spec",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GT-R",
    "engine_code": "RB26DETT",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS / Type S / Type X",
    "engine_code": "RB20E",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS-4 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "AWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS25 — Series 2/3",
    "engine_code": "RB25DE",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "4-speed automatic"
  },
  {
    "brand": "Nissan",
    "model": "Skyline (R33)",
    "model_year": 1998,
    "trim": "GTS25t Type M — Series 2/3",
    "engine_code": "RB25DET",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 1999,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 1999,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 1999,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 1999,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2000,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2000,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2000,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2000,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2001,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2001,
    "trim": "C4 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2001,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.1)",
    "model_year": 2001,
    "trim": "Carrera 3.4",
    "engine_code": "M96-3.4",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2001,
    "trim": "GT2",
    "engine_code": "Mezger-GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2001,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2001,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "GT2",
    "engine_code": "Mezger-GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2002,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "GT2",
    "engine_code": "Mezger-GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2003,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Carrera 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "GT2",
    "engine_code": "Mezger-GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "GT3",
    "engine_code": "Mezger-GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Targa 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2004,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "C4-C4S 3.6",
    "engine_code": "M96-3.6",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "GT2",
    "engine_code": "Mezger-GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "GT3",
    "engine_code": "Mezger-GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (996.2)",
    "model_year": 2005,
    "trim": "Turbo-TurboS",
    "engine_code": "Mezger-Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2005,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2005,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2005,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2005,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2006,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "GT3 3.6",
    "engine_code": "Mezger GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "GT3 RS 3.6",
    "engine_code": "Mezger GT3 RS",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Targa 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Targa 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Targa 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Targa 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2007,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Carrera S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "GT2 3.6",
    "engine_code": "Mezger GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "GT3 3.6",
    "engine_code": "Mezger GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "GT3 RS 3.6",
    "engine_code": "Mezger GT3 RS",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Targa 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Targa 4 3.6",
    "engine_code": "M96-M97 Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Targa 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Targa 4S 3.8",
    "engine_code": "M96-M97 Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2008,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2009,
    "trim": "GT2 3.6",
    "engine_code": "Mezger GT2",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2009,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.1)",
    "model_year": 2009,
    "trim": "Turbo 3.6",
    "engine_code": "Mezger Turbo",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2009,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "GT3 3.8",
    "engine_code": "Mezger GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "GT3 RS 3.8",
    "engine_code": "Mezger GT3 RS",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2010,
    "trim": "Turbo S 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "C4 GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "C4 GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GT2 RS 3.6",
    "engine_code": "Mezger GT2 RS",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GT3 3.8",
    "engine_code": "Mezger GT3",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GT3 RS 3.8",
    "engine_code": "Mezger GT3 RS",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GT3 RS 4.0",
    "engine_code": "Mezger GT3 RS 4.0",
    "drivetrain": "RWD",
    "transmission": "6-speed GT manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Speedster 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2011,
    "trim": "Turbo S 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "C4 GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "C4 GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Carrera S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "GTS 3.8",
    "engine_code": "MA1 DFI GTS",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Targa 4 3.6",
    "engine_code": "MA1 DFI Carrera",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Targa 4S 3.8",
    "engine_code": "MA1 DFI Carrera S",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Turbo 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "911 (997.2)",
    "model_year": 2012,
    "trim": "Turbo S 3.8",
    "engine_code": "997.2 Turbo DFI",
    "drivetrain": "AWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2013,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2013,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2013,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2013,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2014,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2015,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Boxster Spyder",
    "engine_code": "MA1-derived",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman Base",
    "engine_code": "MA1.22",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman GT4",
    "engine_code": "MA1-derived",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman GTS",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (981)",
    "model_year": 2016,
    "trim": "Cayman S",
    "engine_code": "MA1.23",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2005,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2005,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2005,
    "trim": "Boxster S — 987.1 3.2L",
    "engine_code": "M96.26",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2005,
    "trim": "Boxster S — 987.1 3.2L",
    "engine_code": "M96.26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Boxster S — 987.1 3.2L",
    "engine_code": "M96.26",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Boxster S — 987.1 3.2L",
    "engine_code": "M96.26",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2006,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Boxster S — 987.1 3.4L",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Boxster S — 987.1 3.4L",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2007,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Boxster Base — 987.1",
    "engine_code": "M96/M97",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Boxster S — 987.1 3.4L",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Boxster S — 987.1 3.4L",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Cayman Base — 987.1",
    "engine_code": "M97.20",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "5-speed Tiptronic S"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2008,
    "trim": "Cayman S — 987.1",
    "engine_code": "M97.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2009,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2010,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman R — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman R — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2011,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Boxster Spyder — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman Base — 987.2",
    "engine_code": "MA1.20",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman R — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman R — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Porsche",
    "model": "Boxster / Cayman (987)",
    "model_year": 2012,
    "trim": "Cayman S — 987.2",
    "engine_code": "MA1.21",
    "drivetrain": "RWD",
    "transmission": "7-speed PDK"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2013,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2013,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2014,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2014,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2015,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2015,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2016,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Scion",
    "model": "FR-S",
    "model_year": 2016,
    "trim": "FR-S",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2013,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2013,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2014,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2014,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2015,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2015,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2016,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2016,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2017,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2017,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2018,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2018,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2019,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2019,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2020,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2020,
    "trim": "BRZ",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2022,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2022,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2023,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2023,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2024,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2024,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2024,
    "trim": "tS",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2025,
    "trim": "Series.Purple",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2025,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2025,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2025,
    "trim": "tS",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2026,
    "trim": "Series.Yellow",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2026,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2026,
    "trim": "Standard",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "BRZ",
    "model_year": 2026,
    "trim": "tS",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2015,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2015,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2015,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2016,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2016,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2016,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2017,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2017,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2017,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2018,
    "trim": "WRX STI Type RA",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2018,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2018,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2018,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2019,
    "trim": "STI S209",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2019,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2019,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2019,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2020,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2020,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2020,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2021,
    "trim": "WRX STI",
    "engine_code": "EJ257",
    "drivetrain": "AWD",
    "transmission": "STI 6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2021,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Subaru",
    "model": "WRX / WRX STI (VA)",
    "model_year": 2021,
    "trim": "WRX",
    "engine_code": "FA20DIT",
    "drivetrain": "AWD",
    "transmission": "Sport Lineartronic High-Torque CVT"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2020,
    "trim": "3.0 / 3.0 Premium / Launch Edition",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2021,
    "trim": "2.0",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2021,
    "trim": "3.0 / 3.0 Premium / A91 / A91-CF",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2022,
    "trim": "2.0",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2022,
    "trim": "3.0 / 3.0 Premium / A91 / A91-CF",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2023,
    "trim": "2.0",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2023,
    "trim": "3.0 / 3.0 Premium / 45th Anniversary",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2023,
    "trim": "3.0 / 3.0 Premium / A91-MT / 45th Anniversary",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed intelligent manual transmission (iMT)"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2024,
    "trim": "2.0",
    "engine_code": "B48",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2024,
    "trim": "3.0 / 3.0 Premium / 45th Anniversary",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2024,
    "trim": "3.0 / 3.0 Premium / A91-MT / 45th Anniversary",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed intelligent manual transmission (iMT)"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2025,
    "trim": "3.0 / 3.0 Premium",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed intelligent manual transmission (iMT)"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2025,
    "trim": "3.0 / 3.0 Premium",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2026,
    "trim": "3.0 / 3.0 Premium",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed intelligent manual transmission (iMT)"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2026,
    "trim": "3.0 / 3.0 Premium",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2026,
    "trim": "MkV Final Edition",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "6-speed intelligent manual transmission (iMT)"
  },
  {
    "brand": "Toyota",
    "model": "GR Supra (A90)",
    "model_year": 2026,
    "trim": "MkV Final Edition",
    "engine_code": "B58",
    "drivetrain": "RWD",
    "transmission": "ZF 8-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2022,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2022,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2023,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2023,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2024,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2024,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2025,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2025,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2026,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GR86 (ZN8)",
    "model_year": 2026,
    "trim": "Second gen",
    "engine_code": "FA24D",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2017,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2017,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2018,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2018,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2019,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2019,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2020,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Toyota",
    "model": "GT86 (First gen ZN6)",
    "model_year": 2020,
    "trim": "GT86",
    "engine_code": "FA20",
    "drivetrain": "RWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "e-Golf",
    "engine_code": "85 kW electric motor / 24.2 kWh HV battery",
    "drivetrain": "FWD",
    "transmission": "Single-speed reduction gear"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf SportWagen TDI",
    "engine_code": "EA288",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf SportWagen TDI",
    "engine_code": "EA288",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf TDI",
    "engine_code": "EA288",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf TDI",
    "engine_code": "EA288",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2015,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "e-Golf",
    "engine_code": "85 kW electric motor / 24.2 kWh HV battery",
    "drivetrain": "FWD",
    "transmission": "Single-speed reduction gear"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2016,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "e-Golf",
    "engine_code": "100 kW electric motor / 35.8 kWh HV battery",
    "drivetrain": "FWD",
    "transmission": "Single-speed reduction gear"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "DSG (verify MY)"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2017,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "e-Golf",
    "engine_code": "100 kW electric motor / 35.8 kWh HV battery",
    "drivetrain": "FWD",
    "transmission": "Single-speed reduction gear"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "DSG (verify MY)"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "5-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "Golf",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2018,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "e-Golf",
    "engine_code": "100 kW electric motor / 35.8 kWh HV battery",
    "drivetrain": "FWD",
    "transmission": "Single-speed reduction gear"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf Alltrack",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf R",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA211",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "AWD",
    "transmission": "DSG (verify MY)"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf SportWagen",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2019,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2020,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2020,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2020,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2020,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2021,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2021,
    "trim": "Golf",
    "engine_code": "EA211",
    "drivetrain": "FWD",
    "transmission": "8-speed automatic"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2021,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "Golf / GTI / Golf R (Mk7)",
    "model_year": 2021,
    "trim": "GTI",
    "engine_code": "EA888-GEN3",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2022,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2022,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2022,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2022,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2023,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2023,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2023,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2023,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2024,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2024,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2024,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "6-speed manual"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2024,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2025,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2025,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2026,
    "trim": "Golf R",
    "engine_code": "EA888",
    "drivetrain": "AWD",
    "transmission": "7-speed DSG"
  },
  {
    "brand": "Volkswagen",
    "model": "GTI / Golf R (Mk8)",
    "model_year": 2026,
    "trim": "GTI",
    "engine_code": "EA888",
    "drivetrain": "FWD",
    "transmission": "7-speed DSG"
  }
]
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
