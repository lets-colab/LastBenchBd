create or replace function private.class_a_invoke_course_confirmation_worker(
  p_reason text default 'database'
) returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_key text;
  v_request_id bigint;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name='class_a_project_url'
  limit 1;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name='class_a_publishable_key'
  limit 1;

  if v_url is null or v_key is null then
    raise warning 'CLASS course confirmation worker invocation skipped: vault config missing';
    return null;
  end if;

  select net.http_post(
    url := v_url || '/functions/v1/class-a-course-confirmation-worker',
    body := jsonb_build_object(
      'reason',coalesce(p_reason,'database'),
      'invoked_at',now()
    ),
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

revoke all on function private.class_a_invoke_course_confirmation_worker(text)
  from public, anon, authenticated;

create or replace function private.class_a_course_confirmation_worker_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.class_a_invoke_course_confirmation_worker('signup_event');
  return new;
end;
$$;

revoke all on function private.class_a_course_confirmation_worker_trigger()
  from public, anon, authenticated;

drop trigger if exists trg_class_a_course_confirmation_worker
  on public.class_a_signup_events;

create trigger trg_class_a_course_confirmation_worker
after insert on public.class_a_signup_events
for each statement
execute function private.class_a_course_confirmation_worker_trigger();

do $$
declare
  v_jobid bigint;
begin
  for v_jobid in
    select jobid
    from cron.job
    where jobname='class-a-course-confirmation-worker-five-minute'
  loop
    perform cron.unschedule(v_jobid);
  end loop;
end
$$;

select cron.schedule(
  'class-a-course-confirmation-worker-five-minute',
  '*/5 * * * *',
  $$select private.class_a_invoke_course_confirmation_worker('cron');$$
);
