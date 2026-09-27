alter table public.class_a_session_enrollments
  add column recording_consent_at timestamptz;

drop function public.class_a_register_online(text,text,text,text,text);

create or replace function public.class_a_register_online(
  p_full_name text,
  p_phone text,
  p_email text,
  p_skill_level text default null,
  p_source text default 'class-a-online-masterclass-v1',
  p_recording_consent boolean default false
)
returns table(
  outcome text,
  registration_id bigint,
  enrollment_id uuid,
  confirmed_at timestamptz,
  pass_code text,
  pass_code_last4 text,
  session_id uuid,
  session_status text,
  session_title text,
  session_starts_at timestamptz,
  session_ends_at timestamptz,
  session_timezone text,
  session_join_url text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_full_name,''));
  v_phone text;
  v_email text := lower(btrim(coalesce(p_email,'')));
  v_skill text := nullif(btrim(coalesce(p_skill_level,'')), '');
  v_source text := btrim(coalesce(p_source,'class-a-online-masterclass-v1'));
  v_registration public.class_a_registrations%rowtype;
  v_session public.class_a_sessions%rowtype;
  v_enrollment public.class_a_session_enrollments%rowtype;
  v_code text;
  v_hex text;
begin
  if p_recording_consent is not true then
    return query
      select 'recording_consent_required'::text, null::bigint, null::uuid, null::timestamptz,
             null::text, null::text, null::uuid, null::text, null::text,
             null::timestamptz, null::timestamptz, null::text, null::text;
    return;
  end if;

  v_phone := public.class_a_normalize_phone(p_phone);

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if char_length(v_phone) < 6 or char_length(v_phone) > 40 then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;
  if char_length(v_email) < 5 or char_length(v_email) > 200 or position('@' in v_email) = 0 then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  select * into v_registration
  from public.class_a_registrations r
  where r.program='masterclass' and r.email=v_email and r.phone=v_phone
  order by r.id desc
  limit 1;

  if v_registration.id is null and exists (
    select 1 from public.class_a_registrations r
    where r.program='masterclass' and (r.email=v_email or r.phone=v_phone)
  ) then
    return query
      select 'identity_conflict'::text, null::bigint, null::uuid, null::timestamptz,
             null::text, null::text, null::uuid, null::text, null::text,
             null::timestamptz, null::timestamptz, null::text, null::text;
    return;
  end if;

  if v_registration.id is null then
    insert into public.class_a_registrations(program, full_name, phone, email, skill_level, source, record_kind)
    values ('masterclass', v_name, v_phone, v_email, v_skill, v_source, 'genuine')
    returning * into v_registration;
  elsif v_registration.record_kind <> 'genuine' then
    return query
      select 'excluded_record'::text, v_registration.id, null::uuid, null::timestamptz,
             null::text, null::text, null::uuid, null::text, null::text,
             null::timestamptz, null::timestamptz, null::text, null::text;
    return;
  end if;

  select * into v_session
  from public.class_a_sessions s
  where s.status in ('planning','scheduled')
    and (s.starts_at is null or s.starts_at > now())
  order by
    case when s.status='scheduled' then 0 else 1 end,
    s.starts_at nulls last,
    s.created_at
  limit 1;

  if v_session.id is null then
    return query
      select 'no_session'::text, v_registration.id, null::uuid, null::timestamptz,
             null::text, null::text, null::uuid, null::text, null::text,
             null::timestamptz, null::timestamptz, null::text, null::text;
    return;
  end if;

  select * into v_enrollment
  from public.class_a_session_enrollments e
  where e.registration_id=v_registration.id and e.session_id=v_session.id;

  if v_enrollment.id is not null then
    update public.class_a_session_enrollments
      set recording_consent_at=coalesce(recording_consent_at, now()),
          updated_at=now()
    where id=v_enrollment.id
    returning * into v_enrollment;

    return query
      select 'already_registered'::text, v_registration.id, v_enrollment.id,
             v_enrollment.confirmed_at, null::text, v_enrollment.pass_code_last4,
             v_session.id, v_session.status, v_session.title, v_session.starts_at,
             v_session.ends_at, v_session.timezone, v_session.join_url;
    return;
  end if;

  loop
    v_hex := upper(encode(extensions.gen_random_bytes(6), 'hex'));
    v_code := 'CLA-' || substr(v_hex,1,6) || '-' || substr(v_hex,7,6);
    begin
      insert into public.class_a_session_enrollments(
        registration_id, session_id, status, confirmed_at, pass_code_hash, pass_code_last4,
        recording_consent_at
      ) values (
        v_registration.id, v_session.id, 'confirmed', now(),
        encode(extensions.digest(v_code, 'sha256'), 'hex'), right(v_code,4), now()
      )
      returning * into v_enrollment;
      exit;
    exception when unique_violation then
      select * into v_enrollment
      from public.class_a_session_enrollments e
      where e.registration_id=v_registration.id and e.session_id=v_session.id;
      if v_enrollment.id is not null then
        update public.class_a_session_enrollments
          set recording_consent_at=coalesce(recording_consent_at, now()),
              updated_at=now()
        where id=v_enrollment.id
        returning * into v_enrollment;
        exit;
      end if;
    end;
  end loop;

  return query
    select 'confirmed'::text, v_registration.id, v_enrollment.id,
           v_enrollment.confirmed_at, v_code, right(v_code,4),
           v_session.id, v_session.status, v_session.title, v_session.starts_at,
           v_session.ends_at, v_session.timezone, v_session.join_url;
end;
$$;

revoke all on function public.class_a_register_online(text,text,text,text,text,boolean) from public;
grant execute on function public.class_a_register_online(text,text,text,text,text,boolean) to anon, authenticated;

comment on column public.class_a_session_enrollments.recording_consent_at is
  'Timestamp when the attendee explicitly accepted recording/transcription for learning and quality analysis. This is not marketing/publicity consent.';
