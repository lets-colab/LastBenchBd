-- CLASS[Λ] payment evidence → human verification → receipt pipeline
-- Canonical production source for the live Supabase migration applied 2026-10-06.
-- Truth rule: registration != payment; screenshot != verified payment; verified payment gates receipt delivery.

create table if not exists public.class_a_payments (
  id uuid primary key default gen_random_uuid(),
  registration_id bigint not null unique references public.class_a_registrations(id) on delete restrict,
  quote_number text,
  currency text not null default 'BDT' check (currency = 'BDT'),
  amount_expected numeric(12,2) not null default 5000 check (amount_expected > 0),
  amount_received numeric(12,2),
  payment_method text not null default 'bkash' check (payment_method in ('bkash','bank','cash','other')),
  transaction_id text,
  payer_phone text,
  status text not null default 'pending_verification'
    check (status in ('pending_verification','verified','rejected','reversed')),
  evidence_channel text not null default 'whatsapp',
  evidence_received_at timestamptz,
  verified_at timestamptz,
  verified_by text,
  verification_note text,
  receipt_number text unique,
  receipt_status text not null default 'not_ready'
    check (receipt_status in ('not_ready','pending','processing','sent','failed','cancelled')),
  receipt_attempts integer not null default 0 check (receipt_attempts >= 0),
  receipt_sent_at timestamptz,
  receipt_external_ref text,
  receipt_last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists class_a_payments_transaction_id_uidx
  on public.class_a_payments (lower(transaction_id))
  where transaction_id is not null and btrim(transaction_id) <> '';

create table if not exists public.class_a_payment_evidence (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.class_a_payments(id) on delete cascade,
  provider text not null default 'manual',
  external_ref text not null,
  message_type text not null default 'image',
  sender_phone text,
  storage_path text,
  text_hint text,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(provider, external_ref)
);

create table if not exists public.class_a_payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.class_a_payments(id) on delete cascade,
  event_type text not null,
  actor_ref text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.class_a_payments enable row level security;
alter table public.class_a_payment_evidence enable row level security;
alter table public.class_a_payment_events enable row level security;

revoke all on public.class_a_payments from anon, authenticated;
revoke all on public.class_a_payment_evidence from anon, authenticated;
revoke all on public.class_a_payment_events from anon, authenticated;
grant all on public.class_a_payments to service_role;
grant all on public.class_a_payment_evidence to service_role;
grant all on public.class_a_payment_events to service_role;

create index if not exists class_a_payment_evidence_payment_id_idx
  on public.class_a_payment_evidence(payment_id);
create index if not exists class_a_payment_events_payment_id_idx
  on public.class_a_payment_events(payment_id);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'class-a-payment-proof','class-a-payment-proof',false,10485760,
  array['image/jpeg','image/png','application/pdf']::text[]
)
on conflict (id) do update
set public=false,
    file_size_limit=10485760,
    allowed_mime_types=array['image/jpeg','image/png','application/pdf']::text[];

create or replace function private.class_a_invoke_payment_receipt_worker(p_reason text default 'database')
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
  select decrypted_secret into v_url
  from vault.decrypted_secrets
  where name='class_a_project_url'
  limit 1;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name='class_a_publishable_key'
  limit 1;

  if v_url is null or v_key is null then
    raise warning 'CLASS payment receipt worker invocation skipped: vault config missing';
    return null;
  end if;

  select net.http_post(
    url := v_url || '/functions/v1/class-a-payment-receipt-worker',
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

create or replace function private.class_a_record_payment_evidence(
  p_registration_id bigint,
  p_provider text,
  p_external_ref text,
  p_message_type text default 'image',
  p_sender_phone text default null,
  p_storage_path text default null,
  p_text_hint text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_reg public.class_a_registrations%rowtype;
  v_payment_id uuid;
  v_quote text;
begin
  if p_registration_id is null or coalesce(btrim(p_external_ref),'')='' then
    raise exception 'invalid_payment_evidence';
  end if;

  select * into v_reg
  from public.class_a_registrations
  where id=p_registration_id
  limit 1;

  if v_reg.id is null or v_reg.record_kind <> 'genuine' or v_reg.program <> 'course' then
    raise exception 'ineligible_course_registration';
  end if;

  v_quote := 'CLASS-' || to_char(v_reg.created_at at time zone 'UTC','YYYY') || '-' || lpad(v_reg.id::text,3,'0');

  insert into public.class_a_payments (
    registration_id,quote_number,amount_expected,status,evidence_channel,
    evidence_received_at,payer_phone,updated_at
  )
  values (
    v_reg.id,v_quote,5000,'pending_verification',
    case when lower(coalesce(p_provider,''))='meta' then 'whatsapp' else coalesce(nullif(p_provider,''),'manual') end,
    now(),p_sender_phone,now()
  )
  on conflict (registration_id) do update
  set evidence_received_at=greatest(coalesce(public.class_a_payments.evidence_received_at,'epoch'::timestamptz),now()),
      payer_phone=coalesce(excluded.payer_phone,public.class_a_payments.payer_phone),
      status=case
        when public.class_a_payments.status in ('verified','reversed') then public.class_a_payments.status
        else 'pending_verification'
      end,
      updated_at=now()
  returning id into v_payment_id;

  insert into public.class_a_payment_evidence (
    payment_id,provider,external_ref,message_type,sender_phone,storage_path,text_hint,received_at
  )
  values (
    v_payment_id,
    lower(coalesce(nullif(p_provider,''),'manual')),
    p_external_ref,
    lower(coalesce(nullif(p_message_type,''),'image')),
    p_sender_phone,
    p_storage_path,
    left(p_text_hint,500),
    now()
  )
  on conflict (provider,external_ref) do nothing;

  insert into public.class_a_payment_events(payment_id,event_type,actor_ref,evidence)
  values (
    v_payment_id,'evidence_received',lower(coalesce(nullif(p_provider,''),'manual')),
    jsonb_build_object(
      'external_ref',p_external_ref,
      'message_type',p_message_type,
      'storage_path',p_storage_path,
      'sender_phone',p_sender_phone
    )
  );

  return v_payment_id;
end;
$$;

create or replace function private.class_a_verify_payment(
  p_payment_id uuid,
  p_verified_by text,
  p_transaction_id text,
  p_amount_received numeric,
  p_note text default null
)
returns table(payment_id uuid,receipt_number text,receipt_status text)
language plpgsql
security definer
set search_path=''
as $$
declare
  v_payment public.class_a_payments%rowtype;
  v_receipt text;
begin
  if coalesce(btrim(p_verified_by),'')='' then raise exception 'verifier_required'; end if;
  if coalesce(btrim(p_transaction_id),'')='' then raise exception 'transaction_id_required'; end if;

  select * into v_payment
  from public.class_a_payments
  where id=p_payment_id
  for update;

  if v_payment.id is null then raise exception 'payment_not_found'; end if;
  if p_amount_received <> v_payment.amount_expected then
    raise exception 'amount_mismatch_expected_%_received_%',v_payment.amount_expected,p_amount_received;
  end if;
  if not exists (select 1 from public.class_a_payment_evidence e where e.payment_id=v_payment.id) then
    raise exception 'payment_evidence_required';
  end if;

  v_receipt := coalesce(
    v_payment.receipt_number,
    'CLASS-RCP-' || to_char(now() at time zone 'UTC','YYYYMMDD') || '-' ||
      lpad(v_payment.registration_id::text,3,'0')
  );

  update public.class_a_payments
  set amount_received=p_amount_received,
      transaction_id=btrim(p_transaction_id),
      status='verified',
      verified_at=now(),
      verified_by=btrim(p_verified_by),
      verification_note=nullif(btrim(coalesce(p_note,'')),''),
      receipt_number=v_receipt,
      receipt_status='pending',
      receipt_last_error=null,
      updated_at=now()
  where id=v_payment.id;

  insert into public.class_a_payment_events(payment_id,event_type,actor_ref,evidence)
  values (
    v_payment.id,'payment_verified',btrim(p_verified_by),
    jsonb_build_object('amount',p_amount_received,'transaction_id',btrim(p_transaction_id),'receipt_number',v_receipt)
  );

  perform private.class_a_invoke_payment_receipt_worker('payment_verified');
  return query select v_payment.id,v_receipt,'pending'::text;
end;
$$;

create or replace function private.class_a_reject_payment(
  p_payment_id uuid,
  p_actor text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if coalesce(btrim(p_actor),'')='' or coalesce(btrim(p_reason),'')='' then
    raise exception 'actor_and_reason_required';
  end if;

  update public.class_a_payments
  set status='rejected',
      receipt_status='cancelled',
      verification_note=btrim(p_reason),
      verified_by=btrim(p_actor),
      verified_at=now(),
      updated_at=now()
  where id=p_payment_id and status <> 'verified';

  insert into public.class_a_payment_events(payment_id,event_type,actor_ref,evidence)
  values (p_payment_id,'payment_rejected',btrim(p_actor),jsonb_build_object('reason',btrim(p_reason)));
end;
$$;

revoke all on function private.class_a_invoke_payment_receipt_worker(text) from public,anon,authenticated;
revoke all on function private.class_a_record_payment_evidence(bigint,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function private.class_a_verify_payment(uuid,text,text,numeric,text) from public,anon,authenticated;
revoke all on function private.class_a_reject_payment(uuid,text,text) from public,anon,authenticated;
grant execute on function private.class_a_invoke_payment_receipt_worker(text) to service_role;
grant execute on function private.class_a_record_payment_evidence(bigint,text,text,text,text,text,text) to service_role;
grant execute on function private.class_a_verify_payment(uuid,text,text,numeric,text) to service_role;
grant execute on function private.class_a_reject_payment(uuid,text,text) to service_role;

create or replace function private.class_a_payment_receipt_worker_trigger()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.status='verified'
     and new.receipt_status='pending'
     and (
       old.status is distinct from new.status
       or old.receipt_status is distinct from new.receipt_status
     ) then
    perform private.class_a_invoke_payment_receipt_worker('payment_state_change');
  end if;
  return new;
end;
$$;

drop trigger if exists class_a_payment_receipt_worker_after_update on public.class_a_payments;
create trigger class_a_payment_receipt_worker_after_update
after update of status,receipt_status on public.class_a_payments
for each row execute function private.class_a_payment_receipt_worker_trigger();

create schema if not exists compass;
create or replace view compass.class_a_payment_queue
with (security_invoker=true)
as
select
  p.id as payment_id,
  p.registration_id,
  r.full_name,
  r.email,
  r.phone,
  p.quote_number,
  p.amount_expected,
  p.amount_received,
  p.currency,
  p.payment_method,
  p.status,
  p.transaction_id,
  p.evidence_channel,
  p.evidence_received_at,
  p.verified_at,
  p.verified_by,
  p.receipt_number,
  p.receipt_status,
  p.receipt_sent_at,
  p.receipt_last_error,
  (select count(*)::integer from public.class_a_payment_evidence e where e.payment_id=p.id) as evidence_count,
  (select max(e.received_at) from public.class_a_payment_evidence e where e.payment_id=p.id) as latest_evidence_at,
  p.updated_at
from public.class_a_payments p
join public.class_a_registrations r on r.id=p.registration_id
where r.record_kind='genuine' and r.program='course';

revoke all on compass.class_a_payment_queue from public,anon,authenticated;
grant select on compass.class_a_payment_queue to service_role;

do $$
begin
  if not exists (select 1 from cron.job where jobname='class-a-payment-receipt-worker-five-minute') then
    perform cron.schedule(
      'class-a-payment-receipt-worker-five-minute',
      '*/5 * * * *',
      $cron$select private.class_a_invoke_payment_receipt_worker('cron');$cron$
    );
  end if;
end;
$$;
