create or replace function automation.jev_cron_tick()
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if session_user is distinct from 'postgres' then raise exception 'cron_owner_required' using errcode='42501'; end if;
  perform set_config('request.jwt.claim.role','service_role',true);
  return public.jev_process_batch(20);
end $$;
revoke all on function automation.jev_cron_tick() from public,anon,authenticated,service_role;
grant execute on function automation.jev_cron_tick() to postgres;
select cron.schedule('lastbench-jev-crm-dryrun-minute','* * * * *','select automation.jev_cron_tick()');
