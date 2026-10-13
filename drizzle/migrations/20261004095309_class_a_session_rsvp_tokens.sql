create table if not exists public.class_a_session_rsvp_tokens (
  id uuid primary key default gen_random_uuid(),
  registration_id bigint not null references public.class_a_registrations(id) on delete cascade,
  session_id uuid not null references public.class_a_sessions(id) on delete cascade,
  token_hash text not null unique,
  response text null check (response in ('joining','reschedule','previous_attendee')),
  responded_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registration_id, session_id)
);

alter table public.class_a_session_rsvp_tokens enable row level security;

revoke all on table public.class_a_session_rsvp_tokens from anon, authenticated;
grant select, insert, update on table public.class_a_session_rsvp_tokens to service_role;
