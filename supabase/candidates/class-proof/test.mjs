import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(process.env.PGLITE_MODULE || "@electric-sql/pglite");
const db = new PGlite();
const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const student = uuid(1), other = uuid(2), mentor = uuid(3), externalMentor = uuid(4);
const cohort = uuid(11), otherCohort = uuid(12);
const actor = async (role, id = "") => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`set role ${role}`);
};
const rows = async (sql, params) => (await db.query(sql, params)).rows;
const scalar = async (sql, params) => Object.values((await rows(sql, params))[0])[0];
const history = (id = student) => rows("select * from public.class_proof_history($1,$2,1::smallint)", [cohort,id]);
const submit = (expected, proof = "Revised proof", url = "https://example.org/build") =>
  scalar("select public.class_proof_submit($1,1::smallint,$2,$3,$4)", [cohort,expected,proof,url]);
const review = (version, decision, text) =>
  db.query("select public.class_proof_review($1,$2,1::smallint,$3,$4,$5)", [cohort,student,version,decision,text]);
const workspace = () => rows("select * from public.class_proof_workspace()");
const queue = () => rows("select * from public.class_proof_review_queue($1)",[cohort]);
try {
  // Minimal dependencies from Supabase Auth and the existing CLASS intake.
  // All identities and human decisions below are synthetic test fixtures.
  await db.exec(`
    create schema auth; create schema private;
    create role anon; create role authenticated;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create table public.class_a_registrations(id bigint primary key, program text, record_kind text);
  `);
  await db.exec(await readFile(new URL("./records.sql",import.meta.url),"utf8"));
  for(const id of [student,other,mentor,externalMentor]) await db.query("insert into auth.users values ($1)",[id]);
  await db.exec("insert into public.class_a_registrations values (20,'course','genuine'),(21,'course','genuine')");
  await db.query("insert into private.class_proof_cohorts values ($1,'Test A'),($2,'Test B')",[cohort,otherCohort]);
  await db.query("insert into private.class_proof_enrollments values ($1,$2,20,true),($1,$3,21,true)",[cohort,student,other]);
  await db.query("insert into private.class_proof_reviewers values ($1,$2),($3,$4),($1,$5)",[cohort,mentor,otherCohort,externalMentor,student]);
  await db.query(`insert into private.class_proof_lessons values
    ($1,1,'Published','https://example.org/course','Demonstrate the result',true),
    ($1,2,'Draft','https://example.org/draft','Unpublished',false)`,[cohort]);

  await actor("anon");
  await assert.rejects(workspace,/permission denied/);
  await actor("authenticated",student);
  let lessons = await workspace();
  assert.equal(lessons.length,1); assert.equal(lessons[0].version,null);
  await assert.rejects(db.query("select * from private.class_proof_enrollments"),/permission denied/);
  await assert.rejects(db.query("select public.class_proof_submit($1,2::smallint,0,'sample','https://example.org')",[cohort]),/Lesson unavailable/);
  await assert.rejects(submit(0,"first","http://example.org"),/check constraint/);
  await assert.rejects(submit(0,"first","https://user:password@example.org"),/check constraint/);
  assert.equal(await submit(0,"First proof"),1); assert.equal(await submit(0,"First proof"),1);
  await assert.rejects(submit(0),/Reload the current revision/);
  await assert.rejects(submit(1),/no change request/);
  await assert.rejects(review(1,"approved","self"),/Independent reviewer/);
  assert.equal((await queue()).length,0); assert.equal((await workspace())[0].outcome,null);
  // A new authenticated context asks the database for persisted content.
  await actor("authenticated",other); await assert.rejects(history(),/History unavailable/);
  await actor("authenticated",student); assert.equal((await history())[0].proof,"First proof");
  await actor("authenticated",externalMentor); assert.equal((await queue()).length,0);
  await assert.rejects(history(),/History unavailable/); await assert.rejects(review(1,"approved","foreign"),/Reviewer unavailable/);
  await actor("authenticated",mentor); assert.equal((await queue())[0].learner_id,student);
  await review(1,"changes_requested","Show the result"); await review(1,"changes_requested","Show the result");
  await assert.rejects(review(1,"approved","Replace decision"),/Decision already recorded/);
  await actor("authenticated",student); assert.equal((await workspace())[0].outcome,"changes_requested");
  assert.equal(await submit(1),2);
  await actor("authenticated",mentor); await assert.rejects(review(1,"approved","stale"),/Reload the current revision/);
  assert.equal((await queue())[0].version,2); await review(2,"approved","Result verified");
  assert.equal((await queue()).length,0);
  await actor("authenticated",student); assert.deepEqual((await history()).map(r=>r.outcome),["changes_requested","approved"]);
  assert.equal((await workspace())[0].outcome,"approved"); await assert.rejects(submit(2),/no change request/);

  // Reclassification or suspension fails closed immediately.
  await db.exec("reset role; update public.class_a_registrations set record_kind='internal_test' where id=20");
  await actor("authenticated",student); assert.equal((await workspace()).length,0); await assert.rejects(history(),/History unavailable/);
  await db.exec("reset role; update public.class_a_registrations set record_kind='genuine', program='masterclass' where id=20");
  await actor("authenticated",student); assert.equal((await workspace()).length,0); await assert.rejects(submit(2),/Enrollment unavailable/);
  console.log("PASS: isolated PostgreSQL fixtures exercised enrollment, publication, privacy, persisted versions, authorized reviews, idempotent retries, approval-derived progress and revocation.");
} finally { await db.close(); }
