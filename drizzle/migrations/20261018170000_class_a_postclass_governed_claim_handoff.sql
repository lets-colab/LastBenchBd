-- CLASS[Λ] post-class evidence-gated claim handoff.
-- Preserves the legacy fail-closed trigger for all non-authorized transitions.
-- Intended to be applied only after deployment of the readback-verified
-- class-a-postclass-completion-worker v2+ durable-claim guard.
-- No recipient, payment, attendance, or historical outbox rows are rewritten.

create or replace function private.class_a_fail_closed_legacy_post_class()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.notification_type = 'post_class_followup' then
    -- A SENT record must follow a persisted PROCESSING claim with a provider
    -- reference. This prevents the old skipped-to-sent shortcut.
    if new.status = 'sent' then
      if tg_op = 'INSERT' then
        raise exception 'class_a_postclass_requires_processing_claim';
      end if;
      if old.status <> 'processing'
         or new.sent_at is null
         or nullif(btrim(coalesce(new.external_ref,'')), '') is null then
        raise exception 'class_a_postclass_requires_processing_claim';
      end if;
      return new;
    end if;

    -- Provider acceptance can be uncertain after a timeout or 5xx. The
    -- dedicated sender then updates only its error details while keeping
    -- PROCESSING, which is deliberately not selectable for automatic retry.
    if tg_op = 'UPDATE' then
      if old.notification_type = 'post_class_followup'
         and old.status = 'processing'
         and new.status = 'processing'
         and new.sent_at is null
         and new.external_ref is null
         and new.last_error like 'completion_gate_moved_to_governed_followup:send_failed:%delivery_uncertain%' then
        return new;
      end if;
    end if;

    -- The only processing exception is a previously quarantined,
    -- never-sent post-class notification with verified attendance and pack.
    if tg_op = 'UPDATE' then
      if old.notification_type = 'post_class_followup'
         and old.status = 'skipped'
         and new.status = 'processing'
         and old.last_error like 'completion_gate_moved_to_governed_followup%'
         and old.sent_at is null
         and old.external_ref is null
         and exists (
           select 1
           from public.class_a_registrations r
           join public.class_a_session_enrollments e
             on e.id = new.enrollment_id
            and e.registration_id = new.registration_id
            and e.session_id = new.session_id
           join public.class_a_sessions s on s.id = new.session_id
           where r.id = new.registration_id
             and r.record_kind = 'genuine'
             and nullif(btrim(coalesce(r.email,'')), '') is not null
             and e.status = 'attended'
             and s.ends_at <= now()
             and coalesce(s.analysis_summary ->> 'after_class_pack_url','') ~ '^https://[^[:space:]]+$'
             and exists (
               select 1
               from public.class_a_session_attendance_evidence a
               where a.registration_id = new.registration_id
                 and a.session_id = new.session_id
                 and a.evidence_type in ('meet_report','staff_code')
                 and (
                   a.metadata ->> 'present_at_end' = 'true'
                   or a.metadata ->> 'completion_eligible' = 'true'
                 )
             )
         ) then
        new.last_error := 'governed_post_class_processing';
        return new;
      end if;
    end if;

    -- Original interlock remains in force for legacy or unverified events.
    if new.status in ('pending','failed','processing') then
      new.status := 'skipped';
      new.last_error := 'completion_gate_moved_to_governed_followup';
      new.sent_at := null;
      new.external_ref := null;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.class_a_fail_closed_legacy_post_class() from public, anon, authenticated;

comment on function private.class_a_fail_closed_legacy_post_class() is
  'Fail-closed legacy interlock with a narrow verified post-class skipped-to-processing claim gate; requires sent-state delivery evidence.';
