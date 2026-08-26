-- Preserve existing garages while adopting the corrected public model names.
-- The preceding catalog migration loads these replacement fitments first.

alter table public.vehicles disable trigger vehicles_validate_catalog_fitment;

update public.vehicles
set model = '86',
    trim = 'GT86',
    updated_at = now()
where brand = 'Toyota'
  and model = '86 (first generation)'
  and trim = '86';

update public.vehicles
set model = 'FR-S',
    updated_at = now()
where brand = 'Scion'
  and model = 'FR-S (first generation)';

alter table public.vehicles enable trigger vehicles_validate_catalog_fitment;
