-- Mirrors production Supabase migration 20260927110907.
-- Adds canonical CLASS[Λ] registration classification without deleting audit history.

alter table public.class_a_registrations
  add column if not exists record_kind text not null default 'genuine';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.class_a_registrations'::regclass
      and conname = 'class_a_registrations_record_kind_check'
  ) then
    alter table public.class_a_registrations
      add constraint class_a_registrations_record_kind_check
      check (record_kind in ('genuine', 'test', 'internal_test'));
  end if;
end $$;

alter table public.class_a_signup_events
  add column if not exists resolution_note text;

alter table public.class_a_signup_events
  drop constraint if exists class_a_signup_events_status_check;

alter table public.class_a_signup_events
  add constraint class_a_signup_events_status_check
  check (status in ('pending', 'processing', 'sent', 'failed', 'skipped'));

comment on column public.class_a_registrations.record_kind is
  'Canonical registration classification. genuine = learner/lead candidate; test/internal_test = excluded from CRM and learner KPIs but retained for audit.';

comment on column public.class_a_signup_events.resolution_note is
  'Human-readable canonical reason for event resolution, including skipped test/internal events.';
