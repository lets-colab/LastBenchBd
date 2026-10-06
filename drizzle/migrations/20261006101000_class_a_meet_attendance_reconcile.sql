create or replace function private.class_a_record_meet_attendance(
  p_session_id uuid,
  p_registration_id bigint,
  p_joined_at timestamptz,
  p_exited_at timestamptz,
  p_total_seconds integer,
  p_present_at_end boolean,
  p_report_source text,
  p_report_ref text,
  p_report_session_end_at timestamptz default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registration public.class_a_registrations%rowtype;
  v_enrollment public.class_a_session_enrollments%rowtype;
  v_metadata jsonb;
begin
  select * into v_registration
  from public.class_a_registrations
  where id = p_registration_id;

  if v_registration.id is null or v_registration.record_kind <> 'genuine' then
    raise exception 'invalid_or_non_genuine_registration' using errcode='22023';
  end if;

  if not exists (
    select 1 from public.class_a_sessions where id = p_session_id
  ) then
    raise exception 'invalid_session' using errcode='22023';
  end if;

  select * into v_enrollment
  from public.class_a_session_enrollments
  where registration_id = p_registration_id
    and session_id = p_session_id;

  if v_enrollment.id is null then
    insert into public.class_a_session_enrollments(
      registration_id,
      session_id,
      status,
      confirmed_at,
      attended_at,
      attendance_source
    ) values (
      p_registration_id,
      p_session_id,
      'attended',
      coalesce(p_joined_at, now()),
      p_joined_at,
      'meet_report'
    )
    returning * into v_enrollment;
  else
    update public.class_a_session_enrollments
    set status = 'attended',
        attended_at = coalesce(attended_at, p_joined_at),
        attendance_source = 'meet_report',
        updated_at = now()
    where id = v_enrollment.id
    returning * into v_enrollment;
  end if;

  v_metadata := jsonb_build_object(
    'joined_at', p_joined_at,
    'exited_at', p_exited_at,
    'total_seconds', greatest(coalesce(p_total_seconds,0),0),
    'present_at_end', coalesce(p_present_at_end,false),
    'completion_eligible', coalesce(p_present_at_end,false),
    'report_source', nullif(btrim(coalesce(p_report_source,'')),''),
    'report_ref', nullif(btrim(coalesce(p_report_ref,'')),''),
    'report_session_end_at', p_report_session_end_at
  );

  if not exists (
    select 1
    from public.class_a_session_attendance_evidence e
    where e.registration_id = p_registration_id
      and e.session_id = p_session_id
      and e.evidence_type = 'meet_report'
      and coalesce(e.metadata->>'report_ref','') = coalesce(p_report_ref,'')
      and coalesce(e.metadata->>'joined_at','') = coalesce(p_joined_at::text,'')
      and coalesce(e.metadata->>'exited_at','') = coalesce(p_exited_at::text,'')
  ) then
    insert into public.class_a_session_attendance_evidence(
      enrollment_id,
      registration_id,
      session_id,
      evidence_type,
      evidence_at,
      metadata
    ) values (
      v_enrollment.id,
      p_registration_id,
      p_session_id,
      'meet_report',
      coalesce(p_exited_at,p_joined_at,now()),
      v_metadata
    );
  end if;

  return v_enrollment.id;
end;
$$;

revoke all on function private.class_a_record_meet_attendance(
  uuid,bigint,timestamptz,timestamptz,integer,boolean,text,text,timestamptz
) from public, anon, authenticated;

comment on function private.class_a_record_meet_attendance(
  uuid,bigint,timestamptz,timestamptz,integer,boolean,text,text,timestamptz
) is
  'Canonical private reconciler for trusted Google Meet attendance-report evidence. Attendance and completion eligibility remain separate: completion_eligible follows explicit present_at_end evidence only.';
