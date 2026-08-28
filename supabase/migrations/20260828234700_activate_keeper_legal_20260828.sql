-- Activate the materially updated Keeper Terms and Privacy Policy.
-- Existing acceptance records remain immutable; accounts may accept this new pair.

update public.legal_documents
set status = 'retired'
where document_type in ('terms', 'privacy')
  and status = 'active'
  and version <> '2026-08-28';

insert into public.legal_documents (document_type, version, status, effective_at)
values
  ('terms', '2026-08-28', 'active', '2026-08-28 00:00:00-04'::timestamptz),
  ('privacy', '2026-08-28', 'active', '2026-08-28 00:00:00-04'::timestamptz)
on conflict (document_type, version) do update
set status = excluded.status,
    effective_at = excluded.effective_at;
