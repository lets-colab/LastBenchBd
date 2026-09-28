create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Runtime invocation values are provisioned into Supabase Vault out-of-band:
--   class_a_project_url
--   class_a_publishable_key
-- Do not commit deploy credentials or provider transport credentials to Git.

alter table public.class_a_session_enrollments
  add column if not exists attendance_slack_notified_at timestamptz,
  add column if not exists attendance_slack_last_error text;

create or replace function private.class_a_invoke_notification_worker(p_reason text default 'database')
returns bigint
language plpgsql
security definer
set search_path=''
as $$
declare
  v_url text;
  v_key text;
  v_request_id bigint;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name='class_a_project_url' limit 1;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='class_a_publishable_key' limit 1;

  if v_url is null or v_key is null then
    raise warning 'CLASS notification worker invocation skipped: vault config missing';
    return null;
  end if;

  select net.http_post(
    url := v_url || '/functions/v1/class-a-notification-worker',
    body := jsonb_build_object('reason',coalesce(p_reason,'database'),'invoked_at',now()),
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey',v_key,
      'Authorization','Bearer ' || v_key
    ),
    timeout_milliseconds := 5000
  ) into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function private.class_a_invoke_notification_worker(text) from public,anon,authenticated;

create or replace function private.class_a_signup_worker_trigger()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform private.class_a_invoke_notification_worker('signup_event');
  return new;
end $$;

drop trigger if exists trg_class_a_signup_worker on public.class_a_signup_events;
create trigger trg_class_a_signup_worker
after insert on public.class_a_signup_events
for each statement execute function private.class_a_signup_worker_trigger();

create or replace function private.class_a_notification_worker_trigger()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform private.class_a_invoke_notification_worker('session_notification');
  return new;
end $$;

drop trigger if exists trg_class_a_notification_worker on public.class_a_session_notifications;
create trigger trg_class_a_notification_worker
after insert on public.class_a_session_notifications
for each statement execute function private.class_a_notification_worker_trigger();

create or replace function private.class_a_attendance_worker_trigger()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.attended_at is not null and old.attended_at is null then
    perform private.class_a_invoke_notification_worker('attendance_verified');
  end if;
  return new;
end $$;

drop trigger if exists trg_class_a_attendance_worker on public.class_a_session_enrollments;
create trigger trg_class_a_attendance_worker
after update of attended_at on public.class_a_session_enrollments
for each row execute function private.class_a_attendance_worker_trigger();

do $$
declare v_jobid bigint;
begin
  for v_jobid in select jobid from cron.job where jobname='class-a-notification-worker-minute'
  loop
    perform cron.unschedule(v_jobid);
  end loop;
end $$;

select cron.schedule(
  'class-a-notification-worker-minute',
  '* * * * *',
  $$select private.class_a_invoke_notification_worker('cron');$$
);
