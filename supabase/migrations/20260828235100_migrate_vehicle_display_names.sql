-- Preserve vehicle row IDs and all dependent garage records while adopting the
-- corrected customer-facing model and generation names from the catalog.

alter table public.vehicles disable trigger vehicles_validate_catalog_fitment;

update public.vehicles
set model = '1 Series (E82 and E88)',
    updated_at = now()
where brand = 'BMW'
  and model in ('1 Series Coupe / Convertible (E82/E88)', '1 Series Coupe and Convertible', 'Coupe and Convertible');

update public.vehicles
set model = 'GT86 (First gen ZN6)',
    trim = 'GT86',
    updated_at = now()
where brand = 'Toyota'
  and model in ('86', '86 (first generation)', 'GT86 (First gen ZN6)')
  and trim in ('86', 'GT86');

update public.vehicles
set model = 'BRZ',
    trim = 'First gen',
    updated_at = now()
where brand = 'Subaru'
  and model in ('BRZ (first generation ZC6)', 'BRZ (first generation)', 'BRZ')
  and trim = 'BRZ'
  and model_year between 2013 and 2020;

alter table public.vehicles enable trigger vehicles_validate_catalog_fitment;
