alter table automation.events add column if not exists last_error text, add column if not exists finished_at timestamptz, add column if not exists correlation_id text;
create table if not exists automation.consent_records(id uuid primary key default gen_random_uuid(), person_id uuid not null, purpose text not null, status text not null check(status in ('granted','withdrawn','unknown')), source_reference text not null, recorded_at timestamptz not null default now(), actor_reference text not null);
create index if not exists automation_consent_lookup on automation.consent_records(person_id,purpose,recorded_at desc);
alter table automation.consent_records enable row level security;
revoke all on automation.consent_records from public,anon,authenticated;
grant all on automation.consent_records to service_role;
create or replace function public.jev_enqueue_event(p_type text,p_source text,p_idempotency_key text,p_payload jsonb,p_schema_version integer default 1)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'service_role_required' using errcode='42501'; end if;
  if p_type !~ '^[a-z][a-z0-9_]*([.][a-z][a-z0-9_]*)+$' or length(p_type)>120 then raise exception 'invalid_event_type'; end if;
  if p_source !~ '^[a-z][a-z0-9_-]{1,79}$' then raise exception 'invalid_source'; end if;
  if length(p_idempotency_key)<8 or length(p_idempotency_key)>200 then raise exception 'invalid_idempotency_key'; end if;
  if p_schema_version<>1 or jsonb_typeof(p_payload)<>'object' or pg_column_size(p_payload)>32768 then raise exception 'invalid_event_contract'; end if;
  insert into automation.events(event_type,source,idempotency_key,payload,schema_version,correlation_id)
  values(p_type,p_source,p_idempotency_key,p_payload,p_schema_version,left(p_idempotency_key,200))
  on conflict(idempotency_key) do nothing returning id into v_id;
  if v_id is null then select id into v_id from automation.events where idempotency_key=p_idempotency_key; end if;
  return v_id;
end $$;
revoke all on function public.jev_enqueue_event(text,text,text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.jev_enqueue_event(text,text,text,jsonb,integer) to service_role;

create or replace function public.jev_process_batch(p_limit integer default 20) returns jsonb
language plpgsql security definer set search_path='' as $$
declare e record; w record; n_workflows integer; n_claimed integer:=0; n_completed integer:=0; n_blocked integer:=0; n_failed integer:=0; v_error text;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'service_role_required' using errcode='42501'; end if;
 if p_limit<1 or p_limit>100 then raise exception 'invalid_batch_limit'; end if;
 for e in select id,event_type,payload,attempts from automation.events
   where (status='pending' and next_attempt_at<=now()) or (status='processing' and lease_until<now())
   order by created_at,id for update skip locked limit p_limit
 loop
   n_claimed:=n_claimed+1;
   update automation.events set status='processing',attempts=attempts+1,lease_until=now()+interval '2 minutes' where id=e.id;
   begin
     n_workflows:=0;
     for w in select id,version,definition from automation.workflow_definitions
       where enabled=true and definition->'trigger'->>'event'=e.event_type order by id,version
     loop
       n_workflows:=n_workflows+1;
       if w.definition->>'execution_mode' is distinct from 'dry_run' then
         insert into automation.runs(event_id,workflow_id,workflow_version,mode,status,result,completed_at)
         values(e.id,w.id,w.version,'dry_run','blocked',jsonb_build_object('reason','live_execution_not_authorized'),now())
         on conflict(event_id,workflow_id,workflow_version,mode) do nothing;
         n_blocked:=n_blocked+1;
       else
         insert into automation.runs(event_id,workflow_id,workflow_version,mode,status,result,completed_at)
         values(e.id,w.id,w.version,'dry_run','completed',jsonb_build_object('outcome','simulated','event_type',e.event_type,'workflow',w.id),now())
         on conflict(event_id,workflow_id,workflow_version,mode) do nothing;
         insert into automation.audit(run_id,action,actor,details)
         select r.id,'workflow_simulated','jev_gate',jsonb_build_object('event_id',e.id,'workflow',w.id)
         from automation.runs r where r.event_id=e.id and r.workflow_id=w.id and r.workflow_version=w.version and r.mode='dry_run'
         and not exists(select 1 from automation.audit a where a.run_id=r.id and a.action='workflow_simulated');
       end if;
     end loop;
     if n_workflows=0 then
       update automation.events set status='blocked',last_error='no_enabled_workflow',lease_until=null,finished_at=now() where id=e.id;
       n_blocked:=n_blocked+1;
     elsif exists(select 1 from automation.runs where event_id=e.id and status='blocked') then
       update automation.events set status='blocked',last_error='workflow_not_authorized',lease_until=null,finished_at=now() where id=e.id;
     else
       update automation.events set status='completed',last_error=null,lease_until=null,finished_at=now() where id=e.id;
       n_completed:=n_completed+1;
     end if;
   exception when others then
      v_error:=left(SQLSTATE||':'||SQLERRM,200);
      if e.attempts+1>=5 then
        update automation.events set status='dead_letter',last_error=v_error,lease_until=null,finished_at=now() where id=e.id;
        insert into automation.dead_letters(event_id,reason) values(e.id,v_error) on conflict(event_id) do update set reason=excluded.reason;
      else
        update automation.events set status='pending',last_error=v_error,lease_until=null,next_attempt_at=now()+make_interval(secs=>least(3600,30*power(2,e.attempts)::int)) where id=e.id;
      end if;
      n_failed:=n_failed+1;
   end;
 end loop;
 return jsonb_build_object('claimed',n_claimed,'completed',n_completed,'blocked',n_blocked,'failed',n_failed,'execution_mode','dry_run');
end $$;
revoke all on function public.jev_process_batch(integer) from public,anon,authenticated;
grant execute on function public.jev_process_batch(integer) to service_role;

create or replace function public.jev_operator_summary() returns jsonb language plpgsql security definer set search_path='' as $$
declare v_result jsonb;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'service_role_required' using errcode='42501'; end if;
 select jsonb_build_object(
 'counts',(select jsonb_build_object('pending',count(*) filter(where status='pending'),'completed',count(*) filter(where status='completed'),'blocked',count(*) filter(where status='blocked'),'dead_letter',count(*) filter(where status='dead_letter')) from automation.events),
 'workflows',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'version',version,'enabled',enabled,'event',definition->'trigger'->>'event','mode',definition->>'execution_mode') order by id,version),'[]'::jsonb) from automation.workflow_definitions),
 'recent_runs',(select coalesce(jsonb_agg(jsonb_build_object('run_id',id,'workflow',workflow_id,'status',status,'mode',mode,'started_at',started_at) order by started_at desc),'[]'::jsonb) from (select id,workflow_id,status,mode,started_at from automation.runs order by started_at desc limit 20) r),
 'generated_at',now()) into v_result;
 return v_result;
end $$;
revoke all on function public.jev_operator_summary() from public,anon,authenticated;
grant execute on function public.jev_operator_summary() to service_role;
insert into automation.workflow_definitions(id,version,enabled,definition)
values('jev-health-probe',1,true,'{"trigger":{"event":"system.health_probe"},"execution_mode":"dry_run","description":"Synthetic diagnostic only; no outbound writes","actions":[]}'::jsonb)
on conflict(id,version) do nothing;
