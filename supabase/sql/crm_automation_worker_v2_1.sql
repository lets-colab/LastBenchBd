-- Queue lease and guarded status transitions; service-role execution only.
create or replace function automation.claim_due_events(p_limit integer default 10, p_lease_seconds integer default 120)
returns setof automation.events
language plpgsql security invoker set search_path = automation, public
as $$
begin
  if p_limit < 1 or p_limit > 100 or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'invalid claim bounds';
  end if;
  return query
  with selected as (
    select id from automation.events
    where (status='pending' and next_attempt_at <= now())
       or (status='processing' and lease_until < now())
    order by created_at
    for update skip locked limit p_limit
  )
  update automation.events e
  set status='processing', lease_until=now()+make_interval(secs=>p_lease_seconds), attempts=e.attempts+1
  from selected where e.id=selected.id returning e.*;
end;
$$;
revoke all on function automation.claim_due_events(integer,integer) from public, anon, authenticated;
grant usage on schema automation to service_role;
grant all on all tables in schema automation to service_role;
grant usage, select on all sequences in schema automation to service_role;
grant execute on function automation.claim_due_events(integer,integer) to service_role;
