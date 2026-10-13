-- Last Bench relational integrity foundation.
--
-- Preconditions before applying to an existing database:
-- 1. Run scripts/database-foundation-preflight.sql.
-- 2. Resolve every duplicate/orphan reported by that preflight.
-- 3. Ensure repo migrations 0001 and 0002 are already present.
--
-- The production database was verified empty/clean before this migration was
-- promoted on 2026-09-07. Default NO ACTION foreign-key behavior is deliberate:
-- product records must not disappear implicitly when an identity row is removed.

-- Restore the project's default-deny PostgREST posture for tables introduced in 0001.
ALTER TABLE "public"."auditLogs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."cohort_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."payouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Harden trigger functions against caller-controlled search_path resolution.
ALTER FUNCTION public.touch_updated_at() SET search_path = public, pg_temp;--> statement-breakpoint
ALTER FUNCTION public.touch_last_seen_at() SET search_path = public, pg_temp;--> statement-breakpoint

-- One extension profile of each type per authenticated user.
CREATE UNIQUE INDEX "students_userId_unique" ON "students" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "tutors_userId_unique" ON "tutors" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "mentors_userId_unique" ON "mentors" USING btree ("userId");--> statement-breakpoint

-- A student can only join a cohort once.
CREATE UNIQUE INDEX "cohort_members_cohort_student_unique" ON "cohort_members" USING btree ("cohortId", "studentId");--> statement-breakpoint

-- Query-path indexes for ownership checks, conversations, notifications and AI history.
CREATE INDEX "applications_studentId_idx" ON "applications" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "applications_mentorAssigned_idx" ON "applications" USING btree ("mentorAssigned");--> statement-breakpoint
CREATE INDEX "applications_lastUpdatedBy_idx" ON "applications" USING btree ("lastUpdatedBy");--> statement-breakpoint
CREATE INDEX "documents_applicationId_idx" ON "documents" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "documents_uploadedBy_idx" ON "documents" USING btree ("uploadedBy");--> statement-breakpoint
CREATE INDEX "referrals_tutorId_idx" ON "referrals" USING btree ("tutorId");--> statement-breakpoint
CREATE INDEX "referrals_studentId_idx" ON "referrals" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "messages_sender_recipient_created_idx" ON "messages" USING btree ("senderId", "recipientId", "createdAt");--> statement-breakpoint
CREATE INDEX "messages_recipient_sender_created_idx" ON "messages" USING btree ("recipientId", "senderId", "createdAt");--> statement-breakpoint
CREATE INDEX "cohort_members_studentId_idx" ON "cohort_members" USING btree ("studentId");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("userId", "createdAt");--> statement-breakpoint
CREATE INDEX "aiChatMessages_student_guide_created_idx" ON "aiChatMessages" USING btree ("studentId", "guide", "createdAt");--> statement-breakpoint
CREATE INDEX "payouts_tutor_requested_idx" ON "payouts" USING btree ("tutorId", "requestedAt");--> statement-breakpoint
CREATE INDEX "auditLogs_actor_created_idx" ON "auditLogs" USING btree ("actorUserId", "createdAt");--> statement-breakpoint
CREATE INDEX "cohort_messages_cohort_created_idx" ON "cohort_messages" USING btree ("cohortId", "createdAt");--> statement-breakpoint
CREATE INDEX "cohort_messages_student_created_idx" ON "cohort_messages" USING btree ("studentId", "createdAt");--> statement-breakpoint

-- Identity/profile relations.
ALTER TABLE "students" ADD CONSTRAINT "students_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint

-- Application/document relations.
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_mentorAssigned_users_id_fk"
  FOREIGN KEY ("mentorAssigned") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_lastUpdatedBy_users_id_fk"
  FOREIGN KEY ("lastUpdatedBy") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicationId_applications_id_fk"
  FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_users_id_fk"
  FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint

-- Referral and payout relations.
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_tutorId_tutors_id_fk"
  FOREIGN KEY ("tutorId") REFERENCES "public"."tutors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_tutorId_tutors_id_fk"
  FOREIGN KEY ("tutorId") REFERENCES "public"."tutors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint

-- Messaging/community relations.
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_id_fk"
  FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_users_id_fk"
  FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_cohortId_cohorts_id_fk"
  FOREIGN KEY ("cohortId") REFERENCES "public"."cohorts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "cohort_members" ADD CONSTRAINT "cohort_members_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "cohort_messages" ADD CONSTRAINT "cohort_messages_cohortId_cohorts_id_fk"
  FOREIGN KEY ("cohortId") REFERENCES "public"."cohorts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "cohort_messages" ADD CONSTRAINT "cohort_messages_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint

-- Notification / AI relations.
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "aiChatMessages" ADD CONSTRAINT "aiChatMessages_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint
ALTER TABLE "aiMemories" ADD CONSTRAINT "aiMemories_studentId_students_id_fk"
  FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;--> statement-breakpoint

-- Privileged audit actor relation.
ALTER TABLE "auditLogs" ADD CONSTRAINT "auditLogs_actorUserId_users_id_fk"
  FOREIGN KEY ("actorUserId") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
