-- Candidate for the reviewed Supabase migration workflow. No enrollments,
-- reviewer assignments, curriculum or evidence are seeded by this migration.
begin;

create table private.class_proof_cohorts (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(trim(label)) > 0)
);

-- An operator grants access only after verifying the course enrollment,
-- registration and Auth account together. An email match alone is insufficient.
create table private.class_proof_enrollments (
  cohort_id uuid not null references private.class_proof_cohorts on delete cascade,
  learner_id uuid not null references auth.users on delete cascade,
  registration_id bigint not null references public.class_a_registrations(id) on delete cascade,
  active boolean not null default true,
  primary key (cohort_id, learner_id),
  unique (cohort_id, registration_id)
);

create table private.class_proof_reviewers (
  cohort_id uuid not null references private.class_proof_cohorts on delete cascade,
  reviewer_id uuid not null references auth.users on delete cascade,
  primary key (cohort_id, reviewer_id)
);

-- Only provision lessons after the cohort owner approves the materials and rubric.
create table private.class_proof_lessons (
  cohort_id uuid not null references private.class_proof_cohorts on delete cascade,
  lesson smallint not null check (lesson between 1 and 20),
  title text not null check (length(trim(title)) > 0),
  materials_url text not null check (materials_url ~ '^https://([a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?|\[[0-9a-fA-F:.]+\])(:[0-9]{1,5})?([/?#][^[:space:]\\]*)?$'),
  rubric text not null check (length(trim(rubric)) > 0),
  published boolean not null default false,
  primary key (cohort_id, lesson)
);

create table private.class_proof_revisions (
  cohort_id uuid not null,
  learner_id uuid not null,
  lesson smallint not null,
  version integer not null check (version > 0),
  proof text not null check (length(trim(proof)) between 1 and 8000),
  evidence_url text not null check (length(evidence_url) <= 2048 and evidence_url ~ '^https://([a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?|\[[0-9a-fA-F:.]+\])(:[0-9]{1,5})?([/?#][^[:space:]\\]*)?$'),
  submitted_at timestamptz not null default now(),
  primary key (cohort_id, learner_id, lesson, version),
  foreign key (cohort_id, learner_id) references private.class_proof_enrollments on delete cascade,
  foreign key (cohort_id, lesson) references private.class_proof_lessons on delete cascade
);

create table private.class_proof_decisions (
  cohort_id uuid not null,
  learner_id uuid not null,
  lesson smallint not null,
  version integer not null,
  reviewer_id uuid references auth.users on delete set null,
  outcome text not null check (outcome in ('changes_requested','approved')),
  feedback text not null check (length(trim(feedback)) between 1 and 4000),
  reviewed_at timestamptz not null default now(),
  check (learner_id is distinct from reviewer_id),
  primary key (cohort_id, learner_id, lesson, version),
  foreign key (cohort_id, learner_id, lesson, version) references private.class_proof_revisions on delete cascade
);

alter table private.class_proof_cohorts enable row level security;
alter table private.class_proof_enrollments enable row level security;
alter table private.class_proof_reviewers enable row level security;
alter table private.class_proof_lessons enable row level security;
alter table private.class_proof_revisions enable row level security;
alter table private.class_proof_decisions enable row level security;
revoke all on private.class_proof_cohorts, private.class_proof_enrollments,
  private.class_proof_reviewers, private.class_proof_lessons,
  private.class_proof_revisions, private.class_proof_decisions from public, anon, authenticated;

create function private.class_proof_enrolled(p_cohort uuid, p_learner uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from private.class_proof_enrollments e
    join public.class_a_registrations r on r.id = e.registration_id
    where e.cohort_id = p_cohort and e.learner_id = p_learner and e.active
      and r.program = 'course' and r.record_kind = 'genuine'
  );
$$;
revoke all on function private.class_proof_enrolled(uuid, uuid) from public, anon, authenticated;

create function public.class_proof_submit(p_cohort uuid, p_lesson smallint, p_expected_version integer, p_proof text, p_url text)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  learner uuid := auth.uid();
  latest private.class_proof_revisions%rowtype;
begin
  -- Serialize writes for this learner, including concurrent first submissions.
  perform 1 from private.class_proof_enrollments
    where cohort_id = p_cohort and learner_id = learner and active for update;
  if not found or not private.class_proof_enrolled(p_cohort, learner) then
    raise exception 'Enrollment unavailable' using errcode = '42501';
  end if;
  perform 1 from private.class_proof_lessons where cohort_id = p_cohort and lesson = p_lesson and published for share;
  if not found then raise exception 'Lesson unavailable' using errcode = '42501'; end if;
  select * into latest from private.class_proof_revisions
    where cohort_id = p_cohort and learner_id = learner and lesson = p_lesson order by version desc limit 1;
  if latest.version = p_expected_version + 1 and latest.proof = trim(p_proof) and latest.evidence_url = trim(p_url) then
    return latest.version;
  end if;
  if coalesce(latest.version, 0) is distinct from p_expected_version then raise exception 'Reload the current revision'; end if;
  if latest.version is not null and not exists (
    select 1 from private.class_proof_decisions where cohort_id = p_cohort and learner_id = learner
      and lesson = p_lesson and version = latest.version and outcome = 'changes_requested'
  ) then raise exception 'This revision has no change request'; end if;
  insert into private.class_proof_revisions(cohort_id, learner_id, lesson, version, proof, evidence_url)
    values (p_cohort, learner, p_lesson, p_expected_version + 1, trim(p_proof), trim(p_url));
  return p_expected_version + 1;
end;
$$;

create function public.class_proof_review(p_cohort uuid, p_learner uuid, p_lesson smallint, p_version integer, p_outcome text, p_feedback text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  reviewer uuid := auth.uid();
  latest integer;
  previous private.class_proof_decisions%rowtype;
begin
  if reviewer is null or reviewer = p_learner then raise exception 'Independent reviewer required' using errcode = '42501'; end if;
  perform 1 from private.class_proof_reviewers where cohort_id = p_cohort and reviewer_id = reviewer for share;
  if not found then raise exception 'Reviewer unavailable' using errcode = '42501'; end if;
  perform 1 from private.class_proof_enrollments where cohort_id = p_cohort and learner_id = p_learner and active for update;
  if not found or not private.class_proof_enrolled(p_cohort, p_learner) then raise exception 'Enrollment unavailable' using errcode = '42501'; end if;
  select max(version) into latest from private.class_proof_revisions
    where cohort_id = p_cohort and learner_id = p_learner and lesson = p_lesson;
  if latest is null or latest is distinct from p_version then raise exception 'Reload the current revision'; end if;
  select * into previous from private.class_proof_decisions
    where cohort_id = p_cohort and learner_id = p_learner and lesson = p_lesson and version = p_version;
  if found then
    if previous.reviewer_id = reviewer and previous.outcome = p_outcome and previous.feedback = trim(p_feedback) then return; end if;
    raise exception 'Decision already recorded';
  end if;
  insert into private.class_proof_decisions(cohort_id, learner_id, lesson, version, reviewer_id, outcome, feedback)
    values (p_cohort, p_learner, p_lesson, p_version, reviewer, p_outcome, trim(p_feedback));
end;
$$;

create function public.class_proof_history(p_cohort uuid, p_learner uuid, p_lesson smallint)
returns table(version integer, proof text, evidence_url text, submitted_at timestamptz, outcome text, feedback text, reviewed_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not private.class_proof_enrolled(p_cohort, p_learner) or (
    actor <> p_learner and not exists (
      select 1 from private.class_proof_reviewers where cohort_id = p_cohort and reviewer_id = actor
    )
  ) then raise exception 'History unavailable' using errcode = '42501'; end if;
  return query select r.version, r.proof, r.evidence_url, r.submitted_at, d.outcome, d.feedback, d.reviewed_at
    from private.class_proof_revisions r left join private.class_proof_decisions d using (cohort_id, learner_id, lesson, version)
    where r.cohort_id = p_cohort and r.learner_id = p_learner and r.lesson = p_lesson order by r.version;
end;
$$;

-- A lesson counts as complete only when its latest revision has human approval.
-- A learner's next action is the first published lesson without that outcome.
create function public.class_proof_workspace()
returns table(cohort_id uuid, cohort_label text, lesson smallint, title text, materials_url text, rubric text,
              version integer, outcome text)
language sql stable security definer set search_path = '' as $$
  select e.cohort_id, c.label, l.lesson, l.title, l.materials_url, l.rubric,
         latest.version, d.outcome
  from private.class_proof_enrollments e
  join private.class_proof_cohorts c on c.id = e.cohort_id
  join private.class_proof_lessons l on l.cohort_id = e.cohort_id and l.published
  left join lateral (
    select r.version from private.class_proof_revisions r
    where r.cohort_id = e.cohort_id and r.learner_id = e.learner_id and r.lesson = l.lesson
    order by r.version desc limit 1
  ) latest on true
  left join private.class_proof_decisions d on d.cohort_id = e.cohort_id and d.learner_id = e.learner_id
    and d.lesson = l.lesson and d.version = latest.version
  where e.learner_id = auth.uid() and private.class_proof_enrolled(e.cohort_id, e.learner_id)
  order by e.cohort_id, l.lesson;
$$;

create function public.class_proof_review_queue(p_cohort uuid)
returns table(learner_id uuid, lesson smallint, version integer, submitted_at timestamptz, rubric text)
language sql stable security definer set search_path = '' as $$
  select r.learner_id, r.lesson, r.version, r.submitted_at, l.rubric
  from private.class_proof_reviewers m
  join private.class_proof_revisions r on r.cohort_id = m.cohort_id
  join private.class_proof_lessons l on l.cohort_id = r.cohort_id and l.lesson = r.lesson
  left join private.class_proof_decisions d on d.cohort_id = r.cohort_id and d.learner_id = r.learner_id and d.lesson = r.lesson and d.version = r.version
  where m.cohort_id = p_cohort and m.reviewer_id = auth.uid() and r.learner_id <> m.reviewer_id
    and private.class_proof_enrolled(r.cohort_id, r.learner_id) and d.version is null
  order by r.submitted_at, r.learner_id, r.lesson;
$$;

revoke all on function public.class_proof_workspace(), public.class_proof_review_queue(uuid), public.class_proof_submit(uuid, smallint, integer, text, text),
  public.class_proof_review(uuid, uuid, smallint, integer, text, text),
  public.class_proof_history(uuid, uuid, smallint) from public, anon, authenticated;
grant execute on function public.class_proof_workspace(), public.class_proof_review_queue(uuid), public.class_proof_submit(uuid, smallint, integer, text, text),
  public.class_proof_review(uuid, uuid, smallint, integer, text, text),
  public.class_proof_history(uuid, uuid, smallint) to authenticated;
commit;
