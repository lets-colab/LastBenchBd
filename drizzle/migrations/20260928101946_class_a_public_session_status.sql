create or replace function public.class_a_public_session()
returns table(
  session_status text,
  session_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  registration_open boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    s.status,
    s.title,
    s.starts_at,
    s.ends_at,
    s.timezone,
    (s.status in ('planning','scheduled') and (s.starts_at is null or s.starts_at > now())) as registration_open
  from public.class_a_sessions s
  where s.slug='class-0-online-next'
  limit 1
$$;

revoke all on function public.class_a_public_session() from public;
grant execute on function public.class_a_public_session() to anon, authenticated, service_role;
