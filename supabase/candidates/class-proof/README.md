# CLASS proof records candidate

This is a candidate for the repository’s separate, reviewed Supabase migration workflow. Opening a Pages PR does not apply this SQL. The public portal demo can stay available during review.

The existing website verifies Supabase Auth and maps `auth.users.id` to the app user's `openId`. CLASS course registration is a different record, and the masterclass session pass grants access to a session. This candidate requires an operator to bind an approved course registration and authenticated UUID to the same named CLASS cohort. The registration must be classified as genuine and belong to the course programme. Reviewer assignments are also cohort-specific. Secure-store identities, assignment approvals and a human review remain necessary for real acceptance.

The cohort operator provisions the cohort, mapping, reviewers and approved lesson title, materials URL and rubric. No role is inferred from an email address or a typed reviewer name. Emergency suspension uses the enrollment's `active` field or removal of a reviewer assignment. Lesson publication controls availability for new submissions. Existing reviews and revision history remain available to assigned participants after a lesson is unpublished.

The five RPCs are the intended authenticated application contract.

- `class_proof_workspace()` returns the caller's published lessons with the most recent revision and decision. Count rows with `outcome = 'approved'` to derive progress.
- `class_proof_submit(...)` accepts evidence text and an HTTPS URL. Supply expected version zero for the first submission and the current version after changes are requested.
- `class_proof_history(...)` returns ordered persisted revisions with feedback to the learner or an assigned cohort reviewer.
- `class_proof_review_queue(...)` lists pending revisions for the assigned reviewer, excluding their own submissions.
- `class_proof_review(...)` records an authenticated decision on the latest revision. Identical retries return successfully. A later change preserves the earlier revision and decision.

For a local regression, install `@electric-sql/pglite@0.3.14` in an isolated test directory, then run `CI=1 PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node test.mjs` from this directory. The test creates an in-memory PostgreSQL database with synthetic Auth roles and registration rows, calls the RPCs across separate identities and verifies the stored history. It makes no production connection. The website uses HTTP-only cookies, so the production API must forward the verified caller's Supabase access token server-side before an authenticated UI can use this contract. The current production receipt covers the public website only.
