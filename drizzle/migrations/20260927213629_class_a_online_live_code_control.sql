create or replace function public.class_a_issue_current_live_code(
  p_staff_key text,
  p_minutes integer default 20
)
returns table(
  outcome text,
  session_id uuid,
  session_title text,
  live_code text,
  opens_at timestamptz,
  closes_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected_hash text;
  v_staff_hash text := encode(extensions.digest(coalesce(p_staff_key,''), 'sha256'), 'hex');
  v_session public.class_a_sessions%rowtype;
  v_hex text;
  v_code text;
  v_open timestamptz := now();
  v_close timestamptz;
begin
  select value_hash into v_expected_hash
  from private.class_a_config
  where key='checkin_staff_key_sha256';

  if v_expected_hash is null or v_staff_hash <> v_expected_hash then
    return query select 'invalid_staff_key'::text, null::uuid, null::text, null::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  select * into v_session
  from public.class_a_sessions s
  where s.status in ('live','scheduled')
    and (s.starts_at is null or s.starts_at > now() - interval '4 hours')
  order by
    case when s.status='live' then 0 else 1 end,
    abs(extract(epoch from (coalesce(s.starts_at,now()) - now())))
  limit 1;

  if v_session.id is null then
    return query select 'no_active_session'::text, null::uuid, null::text, null::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  v_close := v_open + make_interval(mins => greatest(5, least(coalesce(p_minutes,20),60)));

  loop
    v_hex := upper(encode(extensions.gen_random_bytes(4), 'hex'));
    v_code := 'BUILD-' || substr(v_hex,1,6);
    begin
      insert into public.class_a_live_checkin_codes(
        session_id, code_hash, code_last4, opens_at, closes_at
      ) values (
        v_session.id,
        encode(extensions.digest(v_code,'sha256'),'hex'),
        right(v_code,4),
        v_open,
        v_close
      );
      exit;
    exception when unique_violation then
    end;
  end loop;

  return query select 'issued'::text, v_session.id, v_session.title, v_code, v_open, v_close;
end;
$$;

revoke all on function public.class_a_issue_current_live_code(text,integer) from public;
grant execute on function public.class_a_issue_current_live_code(text,integer) to anon, authenticated;
