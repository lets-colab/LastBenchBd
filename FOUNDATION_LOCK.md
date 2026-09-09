# Last Bench Foundation Lock

This document is the production-trust contract for Last Bench. It separates verified infrastructure facts from remaining release gates.

## Principle

Important product state must have one authoritative source, one owner, one verified state, and one safe mutation path.

## Current verified foundation — 9 September 2026

- Canonical repository: `lets-colab/LastBenchBd`.
- Canonical Netlify production project: `lastbenchbdd`.
- Netlify primary production URL: `https://lastbenchbd.com`.
- The currently published Netlify deploy is an older upload-based production deploy and must not be treated as proof that current `main` is live.
- Current `main` builds successfully in CI, including the complete Netlify production artifact.
- A release fingerprint now prevents a stale homepage from passing production smoke checks.
- Canonical API custom hostname: `https://api.lastbenchbd.com`.
- Canonical working Render service: `last-bench-api-v2` in Singapore.
- Direct Render health is verified at `https://last-bench-api-v2.onrender.com/api/health`.
- `api.lastbenchbd.com` currently has no A, AAAA or CNAME answer and is therefore a DNS/custom-domain blocker rather than an API-code blocker.
- Authentication has been migrated away from Manus OAuth to Supabase Auth.
- Supabase production project `the-last-bench` is `ACTIVE_HEALTHY` in `ap-southeast-1`.
- Production web configuration uses the reviewed Supabase URL and publishable key from `netlify.toml`.
- The live Supabase migration ledger includes the repository foundation migrations, Supabase identity/storage migration, CLASS[Λ] registration migration, and DR.X social-engine runtime/activation migrations.
- Supabase security advisor currently has no WARN or ERROR findings; remaining RLS notices are informational and consistent with the server-owned default-deny model.
- `pnpm db:push` remains intentionally blocked while legacy Drizzle snapshots are incomplete; production DDL uses reviewed SQL through Supabase migrations.
- Production smoke monitoring is automated by `.github/workflows/production-smoke.yml` and distinguishes the Render control-plane origin from the custom API hostname.

See [`drizzle/MIGRATION_STATUS.md`](./drizzle/MIGRATION_STATUS.md) for database reconciliation evidence.

## Gate A — Database truth ✅ foundation locked

The safe production migration path is:

1. Edit `drizzle/schema.ts` when the application schema changes.
2. Write/review explicit SQL in `drizzle/`.
3. Run read-only preflight checks when relational/data assumptions change.
4. Pass TypeScript, lint, tests, dependency audit, production builds and CodeQL.
5. Merge the exact reviewed SQL.
6. Apply that SQL through the Supabase migration workflow.
7. Re-run Supabase security/performance advisors and verify the resulting constraint/index state.
8. Update `drizzle/MIGRATION_STATUS.md` when the live ledger changes materially.

**Do not point `drizzle-kit migrate` or `pnpm db:push` blindly at production.**

## Gate B — Production web/API routing ⚠ active blocker

Public health automation targets:

- `https://lastbenchbd.com/`
- `https://lastbenchbd.com/app/`
- `https://lastbenchbd.com/class-a/`
- `https://lastbenchbd.com/class-a/masterclass.html`
- `https://lastbenchbd.com/class-a/course.html`
- `https://api.lastbenchbd.com/api/health`
- diagnostic control plane: `https://last-bench-api-v2.onrender.com/api/health`

Current verified state:

- [x] Direct Render API returns JSON with `ok: true`.
- [x] Current repository builds the complete production web artifact.
- [x] Student app and CLASS routes on the public domain return HTML successfully.
- [ ] `api.lastbenchbd.com` resolves to the Render service. It currently returns no CNAME/A/AAAA record.
- [ ] Netlify serves the current `main` homepage release fingerprint. It currently serves an older homepage.
- [ ] Netlify production deployment authorization is available to the GitHub workflow or the Netlify Git integration is re-established.

A successful static build, deploy or green CI run is not production-routing proof.

## Gate C — Authentication and session proof

Current contract:

- Auth provider: Supabase Auth.
- Public client configuration: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Authentication UI: `/app/auth`.
- Server authorization remains authoritative for protected business operations.

Before declaring authenticated production complete, verify:

- [ ] Fresh-browser account creation/sign-in succeeds on `/app/auth`.
- [ ] Returning Supabase session survives reload.
- [ ] At least one authenticated tRPC query succeeds.
- [ ] Logout invalidates access to the next protected request.
- [ ] Production CORS explicitly allows `https://lastbenchbd.com`.
- [ ] No legacy Manus OAuth dependency is required for production login.

## Gate D — Forms and conversion proof

Netlify forms remain enabled for the canonical site.

Before declaring conversion flows complete:

- [ ] `signup` receives a real submission.
- [ ] `class-a-masterclass` receives a real submission.
- [ ] `class-a-course` receives a real submission.
- [ ] Submission receipt is verified in Netlify rather than inferred from a thank-you page.

## Gate E — Security and abuse controls

Already present:

- Auth/API rate limiting.
- Broad tRPC burst limiting.
- Tighter AI-guidance burst limiting.
- Explicit CORS allow-list behavior.
- Server-side ownership/role checks around high-trust application/document operations.
- Default-deny RLS posture for public Supabase tables used by the server architecture.
- CI, CodeQL and production dependency auditing.

Still required before broad public launch:

- [ ] Decide and enforce persistent per-user/day AI usage policy.
- [ ] Add messaging-specific abuse quotas if public traffic warrants it.
- [ ] Keep sensitive logs free of bearer/session tokens, private document URLs and student PII.

## Gate F — Product cleanup

- [ ] Decide whether hidden `discover` and `community` routes are supported deep links, redirects or dead code.
- [ ] Finish the reviewed document-picker/upload user flow before describing document upload as complete.
- [x] Development theme lab is blocked outside development.
- [ ] Keep CLASS[Λ] pricing/copy governed by one versioned source of truth.

## Gate G — Repository normalization

- [x] Active repository is `lets-colab/LastBenchBd`.
- [x] Root package metadata identifies `lastbench-platform`, not a generic template.
- [x] CODEOWNERS exists for high-trust and brand/deployment surfaces.
- [x] Dependabot is configured.
- [x] PR safety template exists.
- [x] Production smoke monitoring automatically opens/updates/closes a GitHub incident issue.
- [x] CI rejects stale production-homepage assumptions through release fingerprinting.
- [ ] Restore a working production-deploy credential/integration for the canonical Netlify site.

## Gate H — Mobile identity

Before first public app-store release, explicitly lock:

- Display name
- Expo slug
- iOS bundle identifier
- Android package identifier
- Deep-link URL scheme
- Associated domains / Android App Links
- EAS project ownership and release credentials

Do not change a released bundle/package identifier casually; it is application identity.

## Gate I — End-to-end release journeys

Automate or certify these journeys before declaring the complete product released:

1. Signup/sign-in → onboarding → authenticated dashboard.
2. Student application → mentor/admin update → student sees sanitized state.
3. Message A → B → B reads → unread state updates.
4. Tutor referral → earned commission → payout reservation.
5. CLASS[Λ] form → confirmed Netlify submission.
6. Logout → protected API call is rejected.
7. Returning browser session → authenticated after refresh.

## Automated monitoring behavior

`.github/workflows/production-smoke.yml` runs:

- after every push to `main`, after a deployment-settle window;
- once daily;
- on manual dispatch.

It calls `scripts/release-smoke.mjs` with the canonical web/API origins plus the direct Render diagnostic origin. The smoke gate verifies semantic API health, detects stale homepage HTML through release fingerprints, and prints DNS diagnostics when the custom API hostname fails. A failed run creates or updates the GitHub issue **Production smoke gate**. A later successful run comments on and closes that issue automatically.

## Definition of done

The Foundation Lock is fully complete when repository code, Supabase migration state, Netlify production deploy, Render custom-domain routing, authenticated sessions, form receipt and end-to-end release journeys all agree. Unknowns remain explicit gates; they are never converted into “done” statements by documentation or UI.
