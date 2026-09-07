-- Last Bench database foundation preflight
-- READ ONLY. Run against the target Supabase/Postgres database before creating
-- or applying any relational-constraint migration.
--
-- Expected result for every duplicate/orphan query before hardening: zero rows.

-- ---------------------------------------------------------------------------
-- 1. One profile per user
-- ---------------------------------------------------------------------------
SELECT "userId", COUNT(*) AS duplicate_count
FROM "students"
GROUP BY "userId"
HAVING COUNT(*) > 1;

SELECT "userId", COUNT(*) AS duplicate_count
FROM "tutors"
GROUP BY "userId"
HAVING COUNT(*) > 1;

SELECT "userId", COUNT(*) AS duplicate_count
FROM "mentors"
GROUP BY "userId"
HAVING COUNT(*) > 1;

-- ---------------------------------------------------------------------------
-- 2. Unique cohort membership
-- ---------------------------------------------------------------------------
SELECT "cohortId", "studentId", COUNT(*) AS duplicate_count
FROM "cohort_members"
GROUP BY "cohortId", "studentId"
HAVING COUNT(*) > 1;

-- ---------------------------------------------------------------------------
-- 3. User/profile orphans
-- ---------------------------------------------------------------------------
SELECT s.id, s."userId"
FROM "students" s
LEFT JOIN "users" u ON u.id = s."userId"
WHERE u.id IS NULL;

SELECT t.id, t."userId"
FROM "tutors" t
LEFT JOIN "users" u ON u.id = t."userId"
WHERE u.id IS NULL;

SELECT m.id, m."userId"
FROM "mentors" m
LEFT JOIN "users" u ON u.id = m."userId"
WHERE u.id IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Application/document orphans
-- ---------------------------------------------------------------------------
SELECT a.id, a."studentId"
FROM "applications" a
LEFT JOIN "students" s ON s.id = a."studentId"
WHERE s.id IS NULL;

SELECT a.id, a."mentorAssigned"
FROM "applications" a
LEFT JOIN "users" u ON u.id = a."mentorAssigned"
WHERE a."mentorAssigned" IS NOT NULL AND u.id IS NULL;

SELECT a.id, a."lastUpdatedBy"
FROM "applications" a
LEFT JOIN "users" u ON u.id = a."lastUpdatedBy"
WHERE a."lastUpdatedBy" IS NOT NULL AND u.id IS NULL;

SELECT d.id, d."applicationId"
FROM "documents" d
LEFT JOIN "applications" a ON a.id = d."applicationId"
WHERE a.id IS NULL;

SELECT d.id, d."uploadedBy"
FROM "documents" d
LEFT JOIN "users" u ON u.id = d."uploadedBy"
WHERE u.id IS NULL;

-- ---------------------------------------------------------------------------
-- 5. Referral/payout orphans
-- ---------------------------------------------------------------------------
SELECT r.id, r."tutorId"
FROM "referrals" r
LEFT JOIN "tutors" t ON t.id = r."tutorId"
WHERE t.id IS NULL;

SELECT r.id, r."studentId"
FROM "referrals" r
LEFT JOIN "students" s ON s.id = r."studentId"
WHERE s.id IS NULL;

-- payouts exists in the current application schema. If a target environment
-- predates that table, skip this query and reconcile migrations before launch.
SELECT p.id, p."tutorId"
FROM "payouts" p
LEFT JOIN "tutors" t ON t.id = p."tutorId"
WHERE t.id IS NULL;

-- ---------------------------------------------------------------------------
-- 6. Messaging / notification orphans
-- ---------------------------------------------------------------------------
SELECT m.id, m."senderId"
FROM "messages" m
LEFT JOIN "users" u ON u.id = m."senderId"
WHERE u.id IS NULL;

SELECT m.id, m."recipientId"
FROM "messages" m
LEFT JOIN "users" u ON u.id = m."recipientId"
WHERE u.id IS NULL;

SELECT n.id, n."userId"
FROM "notifications" n
LEFT JOIN "users" u ON u.id = n."userId"
WHERE u.id IS NULL;

-- ---------------------------------------------------------------------------
-- 7. Cohort orphans
-- ---------------------------------------------------------------------------
SELECT cm.id, cm."cohortId"
FROM "cohort_members" cm
LEFT JOIN "cohorts" c ON c.id = cm."cohortId"
WHERE c.id IS NULL;

SELECT cm.id, cm."studentId"
FROM "cohort_members" cm
LEFT JOIN "students" s ON s.id = cm."studentId"
WHERE s.id IS NULL;

-- ---------------------------------------------------------------------------
-- 8. AI memory/history orphans + duplicate memory keys
-- ---------------------------------------------------------------------------
SELECT acm.id, acm."studentId"
FROM "aiChatMessages" acm
LEFT JOIN "students" s ON s.id = acm."studentId"
WHERE s.id IS NULL;

SELECT am.id, am."studentId"
FROM "aiMemories" am
LEFT JOIN "students" s ON s.id = am."studentId"
WHERE s.id IS NULL;

SELECT "studentId", "memoryKey", COUNT(*) AS duplicate_count
FROM "aiMemories"
GROUP BY "studentId", "memoryKey"
HAVING COUNT(*) > 1;

-- ---------------------------------------------------------------------------
-- 9. Index/constraint inventory for reconciliation
-- ---------------------------------------------------------------------------
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'users', 'students', 'applications', 'documents', 'tutors', 'referrals',
    'mentors', 'messages', 'cohorts', 'cohort_members', 'notifications',
    'aiChatMessages', 'aiMemories', 'payouts'
  )
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'students', 'applications', 'documents', 'tutors', 'referrals',
    'mentors', 'messages', 'cohorts', 'cohort_members', 'notifications',
    'aiChatMessages', 'aiMemories', 'payouts'
  )
ORDER BY tablename, indexname;
