-- Temporary safety interlock for the legacy CLASS[Λ] session notification worker.
-- The legacy worker does not enforce end-of-session completion evidence for
-- post_class_followup, so fail closed until the governed completion worker is live.

update public.class_a_session_notifications
set status = 'skipped',
    last_error = 'completion_gate_moved_to_governed_followup'
where notification_type = 'post_class_followup'
  and status in ('pending','failed','processing');

create or replace function private.class_a_fail_closed_legacy_post_class()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.notification_type = 'post_class_followup'
     and new.status in ('pending','failed','processing') then
    new.status := 'skipped';
    new.last_error := 'completion_gate_moved_to_governed_followup';
    new.sent_at := null;
    new.external_ref := null;
  end if;
  return new;
end;
$$;

revoke all on function private.class_a_fail_closed_legacy_post_class() from public, anon, authenticated;

drop trigger if exists trg_class_a_fail_closed_legacy_post_class
  on public.class_a_session_notifications;

create trigger trg_class_a_fail_closed_legacy_post_class
before insert or update of notification_type, status
on public.class_a_session_notifications
for each row
execute function private.class_a_fail_closed_legacy_post_class();

comment on function private.class_a_fail_closed_legacy_post_class() is
  'Fail-closed interlock: legacy post-class notifications cannot send without the governed completion-evidence path.';
