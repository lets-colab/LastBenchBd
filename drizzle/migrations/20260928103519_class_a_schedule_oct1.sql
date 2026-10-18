update public.class_a_sessions
set status='scheduled',
    starts_at='2026-10-01T20:00:00+06:00'::timestamptz,
    ends_at='2026-10-01T21:30:00+06:00'::timestamptz,
    join_url='https://meet.google.com/nba-tfgh-cxf',
    calendar_event_id='i7nvnon6v0tdlm809r0qe99m9k',
    updated_at=now()
where slug='class-0-online-next';
