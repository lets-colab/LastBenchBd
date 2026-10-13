-- JEV security contract: CLASS[Λ] duplicate registration resolution proof
-- Applied live 2026-10-05. Public RPC signatures remain unchanged.

create table if not exists private.class_a_duplicate_resolution_tokens (
  registration_id bigint primary key references public.class_a_registrations(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table private.class_a_duplicate_resolution_tokens enable row level security;
revoke all on table private.class_a_duplicate_resolution_tokens from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.class_a_register_online_gated(p_full_name text, p_phone text, p_email text, p_skill_level text DEFAULT NULL::text, p_source text DEFAULT 'class-a-online-masterclass-v2'::text, p_recording_consent boolean DEFAULT false)
 RETURNS TABLE(outcome text, registration_id bigint, enrollment_id uuid, confirmed_at timestamp with time zone, unlock_token text, session_id uuid, session_status text, session_title text, session_starts_at timestamp with time zone, session_ends_at timestamp with time zone, session_timezone text, session_join_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_name text := btrim(coalesce(p_full_name,''));
  v_phone text;
  v_email text := lower(btrim(coalesce(p_email,'')));
  v_skill text := nullif(btrim(coalesce(p_skill_level,'')), '');
  v_source text := btrim(coalesce(p_source,'class-a-online-masterclass-v2'));
  v_registration public.class_a_registrations%rowtype;
  v_session public.class_a_sessions%rowtype;
  v_enrollment public.class_a_session_enrollments%rowtype;
  v_unlock text;
  v_duplicate_proof text;
  v_has_attended boolean := false;
begin
  if p_recording_consent is not true then
    return query select 'recording_consent_required'::text,null::bigint,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  v_phone := public.class_a_normalize_phone(p_phone);
  if char_length(v_name)<2 or char_length(v_name)>120 then raise exception 'invalid_name' using errcode='22023'; end if;
  if char_length(v_phone)<6 or char_length(v_phone)>40 then raise exception 'invalid_phone' using errcode='22023'; end if;
  if char_length(v_email)<5 or char_length(v_email)>200 or position('@' in v_email)=0 then raise exception 'invalid_email' using errcode='22023'; end if;

  select * into v_registration
  from public.class_a_registrations r
  where r.program='masterclass' and r.email=v_email and r.phone=v_phone
  order by r.id desc limit 1;

  if v_registration.id is null and exists(
    select 1 from public.class_a_registrations r
    where r.program='masterclass' and (r.email=v_email or r.phone=v_phone)
  ) then
    return query select 'identity_conflict'::text,null::bigint,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  select * into v_session
  from public.class_a_sessions s
  where s.status in ('planning','scheduled') and (s.starts_at is null or s.starts_at>now())
  order by case when s.status='scheduled' then 0 else 1 end,s.starts_at nulls last,s.created_at
  limit 1;

  if v_registration.id is not null then
    if v_registration.record_kind<>'genuine' then
      return query select 'excluded_record'::text,v_registration.id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
      return;
    end if;

    select exists(
      select 1 from public.class_a_session_enrollments e
      where e.registration_id=v_registration.id and (e.attended_at is not null or e.status='attended')
    ) into v_has_attended;

    if v_has_attended then
      return query select 'course_redirect'::text,v_registration.id,null::uuid,null::timestamptz,null::text,
        v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
      return;
    end if;

    if v_session.id is not null and exists(
      select 1 from public.class_a_session_enrollments e
      where e.registration_id=v_registration.id and e.session_id=v_session.id
    ) then
      select * into v_enrollment
      from public.class_a_session_enrollments e
      where e.registration_id=v_registration.id and e.session_id=v_session.id;
      return query select 'already_registered'::text,v_registration.id,v_enrollment.id,v_enrollment.confirmed_at,null::text,
        v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
      return;
    end if;

    v_duplicate_proof := 'DUP-' || upper(encode(extensions.gen_random_bytes(16),'hex'));
    insert into private.class_a_duplicate_resolution_tokens(registration_id,token_hash,expires_at,used_at,created_at)
    values(
      v_registration.id,
      encode(extensions.digest(v_duplicate_proof,'sha256'),'hex'),
      now()+interval '10 minutes',
      null,
      now()
    )
    on conflict on constraint class_a_duplicate_resolution_tokens_pkey do update
      set token_hash=excluded.token_hash,
          expires_at=excluded.expires_at,
          used_at=null,
          created_at=excluded.created_at;

    return query select 'duplicate_confirmation_required'::text,v_registration.id,null::uuid,null::timestamptz,v_duplicate_proof,
      v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
    return;
  end if;

  insert into public.class_a_registrations(program,full_name,phone,email,skill_level,source,record_kind)
  values('masterclass',v_name,v_phone,v_email,v_skill,v_source,'genuine')
  returning * into v_registration;

  if v_session.id is null then
    return query select 'no_session'::text,v_registration.id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  loop
    v_unlock := 'UNLOCK-'||upper(encode(extensions.gen_random_bytes(16),'hex'));
    begin
      insert into public.class_a_session_enrollments(
        registration_id,session_id,status,confirmed_at,recording_consent_at,
        pass_unlock_token_hash,pass_unlock_token_expires_at
      )
      values(
        v_registration.id,v_session.id,'confirmed',now(),now(),
        encode(extensions.digest(v_unlock,'sha256'),'hex'),now()+interval '30 minutes'
      )
      returning * into v_enrollment;
      exit;
    exception when unique_violation then
      v_unlock:=null;
    end;
  end loop;

  return query select 'follow_required'::text,v_registration.id,v_enrollment.id,v_enrollment.confirmed_at,v_unlock,
    v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
end;
$function$;

CREATE OR REPLACE FUNCTION public.class_a_resolve_duplicate_registration(p_registration_id bigint, p_reason text, p_recording_consent boolean DEFAULT false)
 RETURNS TABLE(outcome text, registration_id bigint, enrollment_id uuid, confirmed_at timestamp with time zone, unlock_token text, session_id uuid, session_status text, session_title text, session_starts_at timestamp with time zone, session_ends_at timestamp with time zone, session_timezone text, session_join_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_registration public.class_a_registrations%rowtype;
  v_session public.class_a_sessions%rowtype;
  v_enrollment public.class_a_session_enrollments%rowtype;
  v_unlock text;
  v_reason text := btrim(coalesce(p_reason,''));
  v_duplicate_proof text;
  v_token private.class_a_duplicate_resolution_tokens%rowtype;
begin
  if v_reason='mistake' then
    return query select 'duplicate_cancelled'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  if position('missed_previous:' in v_reason) <> 1 then
    return query select 'duplicate_proof_invalid'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  v_duplicate_proof := substr(v_reason, length('missed_previous:') + 1);
  if char_length(v_duplicate_proof) < 20 then
    return query select 'duplicate_proof_invalid'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  if p_recording_consent is not true then
    return query select 'recording_consent_required'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  select * into v_token
  from private.class_a_duplicate_resolution_tokens t
  where t.registration_id=p_registration_id
    and t.token_hash=encode(extensions.digest(v_duplicate_proof,'sha256'),'hex')
    and t.expires_at>now()
    and t.used_at is null
  for update;

  if v_token.registration_id is null then
    return query select 'duplicate_proof_invalid'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  select * into v_registration
  from public.class_a_registrations r
  where r.id=p_registration_id and r.program='masterclass' and r.record_kind='genuine';

  if v_registration.id is null then
    return query select 'registration_not_found'::text,p_registration_id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  if exists(
    select 1 from public.class_a_session_enrollments e
    where e.registration_id=v_registration.id and (e.attended_at is not null or e.status='attended')
  ) then
    update private.class_a_duplicate_resolution_tokens as t
    set used_at=now()
    where t.registration_id=p_registration_id;
    return query select 'course_redirect'::text,v_registration.id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  select * into v_session
  from public.class_a_sessions s
  where s.status in('planning','scheduled') and (s.starts_at is null or s.starts_at>now())
  order by case when s.status='scheduled' then 0 else 1 end,s.starts_at nulls last,s.created_at
  limit 1;

  if v_session.id is null then
    return query select 'no_session'::text,v_registration.id,null::uuid,null::timestamptz,null::text,null::uuid,null::text,null::text,null::timestamptz,null::timestamptz,null::text,null::text;
    return;
  end if;

  select * into v_enrollment
  from public.class_a_session_enrollments e
  where e.registration_id=v_registration.id and e.session_id=v_session.id
  for update;

  if v_enrollment.id is not null and v_enrollment.pass_code_hash is not null then
    update private.class_a_duplicate_resolution_tokens as t
    set used_at=now()
    where t.registration_id=p_registration_id;
    return query select 'already_unlocked'::text,v_registration.id,v_enrollment.id,v_enrollment.confirmed_at,null::text,
      v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
    return;
  end if;

  loop
    v_unlock:='UNLOCK-'||upper(encode(extensions.gen_random_bytes(16),'hex'));
    begin
      if v_enrollment.id is null then
        insert into public.class_a_session_enrollments(
          registration_id,session_id,status,confirmed_at,recording_consent_at,
          pass_unlock_token_hash,pass_unlock_token_expires_at
        )
        values(
          v_registration.id,v_session.id,'confirmed',now(),now(),
          encode(extensions.digest(v_unlock,'sha256'),'hex'),now()+interval '30 minutes'
        )
        returning * into v_enrollment;
      else
        update public.class_a_session_enrollments
        set recording_consent_at=coalesce(recording_consent_at,now()),
            pass_unlock_token_hash=encode(extensions.digest(v_unlock,'sha256'),'hex'),
            pass_unlock_token_expires_at=now()+interval '30 minutes',
            updated_at=now()
        where id=v_enrollment.id
        returning * into v_enrollment;
      end if;
      exit;
    exception when unique_violation then
      v_unlock:=null;
    end;
  end loop;

  update private.class_a_duplicate_resolution_tokens as t
  set used_at=now()
  where t.registration_id=p_registration_id;

  return query select 'follow_required'::text,v_registration.id,v_enrollment.id,v_enrollment.confirmed_at,v_unlock,
    v_session.id,v_session.status,v_session.title,v_session.starts_at,v_session.ends_at,v_session.timezone,v_session.join_url;
end;
$function$;
