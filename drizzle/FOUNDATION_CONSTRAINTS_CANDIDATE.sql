-- Last Bench relational hardening candidate
--
-- THIS FILE IS NOT AN AUTO-APPLY MIGRATION.
-- Do not rename it into the migration sequence or run it against production until:
--   1) the live Supabase schema has been exported and reconciled,
--   2) scripts/database-foundation-preflight.sql returns no duplicate/orphan rows,
--   3) a production backup exists,
--   4) this SQL has been adapted to the verified live schema.
--
-- Purpose: make the intended relational contract explicit while the existing
-- Drizzle journal/live-schema drift is being reconciled.

-- One profile per authenticated user.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS students_user_id_unique
  ON "students" ("userId");

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS tutors_user_id_unique
  ON "tutors" ("userId");

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS mentors_user_id_unique
  ON "mentors" ("userId");

-- A student belongs to a cohort at most once.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS cohort_members_cohort_student_unique
  ON "cohort_members" ("cohortId", "studentId");

-- Query-path indexes used by ownership and conversation checks.
CREATE INDEX CONCURRENTLY IF NOT EXISTS applications_student_id_idx
  ON "applications" ("studentId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS applications_mentor_assigned_idx
  ON "applications" ("mentorAssigned");
CREATE INDEX CONCURRENTLY IF NOT EXISTS documents_application_id_idx
  ON "documents" ("applicationId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS referrals_tutor_id_idx
  ON "referrals" ("tutorId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS referrals_student_id_idx
  ON "referrals" ("studentId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_sender_recipient_idx
  ON "messages" ("senderId", "recipientId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_recipient_sender_idx
  ON "messages" ("recipientId", "senderId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS notifications_user_id_idx
  ON "notifications" ("userId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_chat_student_guide_created_idx
  ON "aiChatMessages" ("studentId", "guide", "createdAt");

-- Foreign keys are introduced NOT VALID first so existing rows can be audited
-- separately. VALIDATE CONSTRAINT is intentionally not included here.
ALTER TABLE "students"
  ADD CONSTRAINT students_user_id_users_id_fk
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "tutors"
  ADD CONSTRAINT tutors_user_id_users_id_fk
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "mentors"
  ADD CONSTRAINT mentors_user_id_users_id_fk
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "applications"
  ADD CONSTRAINT applications_student_id_students_id_fk
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "applications"
  ADD CONSTRAINT applications_mentor_assigned_users_id_fk
  FOREIGN KEY ("mentorAssigned") REFERENCES "users"("id") ON DELETE SET NULL NOT VALID;

ALTER TABLE "applications"
  ADD CONSTRAINT applications_last_updated_by_users_id_fk
  FOREIGN KEY ("lastUpdatedBy") REFERENCES "users"("id") ON DELETE SET NULL NOT VALID;

ALTER TABLE "documents"
  ADD CONSTRAINT documents_application_id_applications_id_fk
  FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "documents"
  ADD CONSTRAINT documents_uploaded_by_users_id_fk
  FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT NOT VALID;

ALTER TABLE "referrals"
  ADD CONSTRAINT referrals_tutor_id_tutors_id_fk
  FOREIGN KEY ("tutorId") REFERENCES "tutors"("id") ON DELETE RESTRICT NOT VALID;

ALTER TABLE "referrals"
  ADD CONSTRAINT referrals_student_id_students_id_fk
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT NOT VALID;

ALTER TABLE "messages"
  ADD CONSTRAINT messages_sender_id_users_id_fk
  FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT NOT VALID;

ALTER TABLE "messages"
  ADD CONSTRAINT messages_recipient_id_users_id_fk
  FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT NOT VALID;

ALTER TABLE "cohort_members"
  ADD CONSTRAINT cohort_members_cohort_id_cohorts_id_fk
  FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "cohort_members"
  ADD CONSTRAINT cohort_members_student_id_students_id_fk
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "notifications"
  ADD CONSTRAINT notifications_user_id_users_id_fk
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "aiChatMessages"
  ADD CONSTRAINT ai_chat_messages_student_id_students_id_fk
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE NOT VALID;

ALTER TABLE "aiMemories"
  ADD CONSTRAINT ai_memories_student_id_students_id_fk
  FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE NOT VALID;

-- After all constraints are added and the preflight is clean, validate them one
-- at a time during a controlled migration window, then encode the verified
-- contract back into drizzle/schema.ts and rebuild the migration baseline.
