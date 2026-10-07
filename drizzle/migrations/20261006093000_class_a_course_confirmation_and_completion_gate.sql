alter table public.class_a_signup_events
  add column if not exists email_status text,
  add column if not exists email_attempts integer not null default 0,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_external_ref text,
  add column if not exists email_last_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_a_signup_events_email_status_check'
  ) then
    alter table public.class_a_signup_events
      add constraint class_a_signup_events_email_status_check
      check (email_status is null or email_status in (
        'pending','processing','sent','failed','skipped','not_applicable'
      ));
  end if;
end
$$;

update public.class_a_signup_events e
set email_status = case
  when exists (
    select 1
    from public.class_a_registrations r
    where r.id = e.registration_id
      and r.record_kind = 'genuine'
      and r.program = 'course'
      and r.email is not null
  ) then 'pending'
  else 'not_applicable'
end
where e.email_status is null;

alter table public.class_a_signup_events
  alter column email_status set default 'pending';

comment on column public.class_a_signup_events.email_status is
  'Independent learner-email delivery state. This is separate from the Slack signup-event status so one channel cannot mask failure in the other.';

comment on table public.class_a_session_attendance_evidence is
  'Evidence ledger for online attendance signals. For post-class completion delivery, meet_report or staff_code metadata must explicitly record present_at_end=true or completion_eligible=true; registration/open/join alone are insufficient.';
