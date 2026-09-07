# Last Bench Foundation Lock

This document is the production-trust contract for Last Bench. It separates verified infrastructure facts from remaining release gates.

## Principle

Important product state must have one authoritative source, one owner, one verified state, and one safe mutation path.

## Current verified foundation — 7 September 2026

- Canonical repository: `lets-colab/LastBenchBd`.
- Canonical Netlify production project: `lastbenchbdd`.
- Current Netlify primary production URL: `https://lastbenchbd.com`.
- Current production deploy is connected to `main`.
- Supabase production project is healthy.
- Repo migrations `0001` and `0002` are applied to Supabase.
- Relational foundation migration is applied to Supabase.
- Live preflight found no duplicate/orphan business rows before relational hardening.
- Production schema now has explicit relational foreign keys, one-profile uniqueness rules and query-path indexes.
- Supabase security advisor has no current WARN/ERROR findings after hardening.
- Production smoke monitoring is automated by `.github/workflows/production-smoke.yml`.
- `pnpm db:push` is intentionally blocked while legacy Drizzle snapshots remain incomplete; production DDL uses reviewed SQL through Supabase migrations.

See [`drizzle/MIGRATION_STATUS.md`](./drizzle/MIGRATION_STATUS.md) for database reconciliation evidence.

## Gate A — Database truth ✅ foundation locked

The safe production migration path is now:

1. Edit `drizzle/schema.ts`.
2. Write/review explicit SQL in `drizzle/`.
3. Run `scripts/database-foundation-preflight.sql` when relational/data assumptions change.
4. Pass TypeScript, lint, tests, dependency audit, production builds and CodeQL.
5. Merge the exact reviewed SQL.
6. Apply that SQL through the Supabase migration workflow.
7. Re-run Supabase security/performance advisors and verify the resulting constraint/index state.
8. Update `drizzle/MIGRATION_STATUS.md` when the live ledger changes materially.

**Do not point `drizzle-kit migrate` or `pnpm db:push` blindly at production.**

## Gate B — Production identity and environment ⚠ remaining blocker

Public health automation targets:

- `https://lastbenchbd.com/`
- `https://lastbenchbd.com/app/`
- `https://lastbenchbd.com/class-a/masterclass.html`
- `https://lastbenchbd.com/class-a/course.html`
- `https://api.lastbenchbd.com/api/health`

The complete authenticated product is not considered released until all of the following are verified:

- [ ] Netlify production uses the real Manus OAuth `APP_ID`.
- [ ] Netlify production uses the real `OWNER_OPEN_ID`.
- [ ] Placeholder `lastbenchbd-*-unconfigured` identity values are absent from the production build configuration.
- [ ] Render has the required database, OAuth, CORS, Forge/AI, owner, signing and frontend-origin values.
- [ ] `FRONTEND_URL=https://lastbenchbd.com` on the production API runtime.
- [ ] Production CORS explicitly allows `https://lastbenchbd.com`.
- [ ] `api.lastbenchbd.com/api/health` returns JSON with `ok: true`.
- [ ] Fresh-browser login succeeds.
- [ ] Returning session survives reload.
- [ ] At least one authenticated tRPC query succeeds.
- [ ] Logout invalidates access.
- [ ] Each active Netlify form receives a real submission.

A successful static build, deploy or green CI run is not authenticated-production proof.

## Gate C — Security and abuse controls

Already present:

- OAuth rate limiting.
- Broad tRPC burst limiting.
- Tighter AI guidance burst limiting.
- Explicit CORS allow-list behavior.
- Server-side ownership/role checks around high-trust application/document operations.
- Default-deny RLS posture for public Supabase tables used by the server architecture.

Still required before broad public launch:

- [ ] Decide and enforce persistent per-user/day AI usage policy.
- [ ] Add messaging-specific abuse quotas if public traffic warrants it.
- [ ] Test cookie SameSite/CSRF behavior on the real web/API domains.
- [ ] Keep sensitive logs free of authorization codes, bearer/session tokens, private document URLs and student PII.

## Gate D — Product cleanup

- [ ] Decide whether hidden `discover` and `community` routes are supported deep links, redirects or dead code.
- [ ] Finish the reviewed document-picker/upload user flow before describing document upload as complete.
- [x] Development theme lab is blocked outside development.
- [ ] Keep CLASS[Λ] pricing/copy governed by one versioned source of truth.

## Gate E — Repository normalization

- [x] Active repository is `lets-colab/LastBenchBd`.
- [x] Root package metadata identifies `lastbench-platform`, not a generic template.
- [x] CODEOWNERS exists for high-trust and brand/deployment surfaces.
- [x] Dependabot is configured.
- [x] PR safety template exists.
- [x] Production smoke monitoring automatically opens/updates/closes a GitHub incident issue.
- [ ] Continue closing or rebasing stale PRs so obsolete architecture cannot be mistaken for current truth.

## Gate F — Mobile identity

Before first public app-store release, explicitly lock:

- Display name
- Expo slug
- iOS bundle identifier
- Android package identifier
- Deep-link URL scheme
- Associated domains / Android App Links
- EAS project ownership and release credentials

Do not change a released bundle/package identifier casually; it is application identity.

## Gate G — End-to-end release journeys

Automate or certify these journeys before declaring the complete product released:

1. Signup → OAuth → onboarding → authenticated dashboard.
2. Student application → mentor/admin update → student sees sanitized state.
3. Message A → B → B reads → unread state updates.
4. Tutor referral → earned commission → payout reservation.
5. CLASS[Λ] form → confirmed Netlify submission.
6. Logout → protected API call is rejected.
7. Returning browser session → authenticated after refresh.

## Automated monitoring behavior

`.github/workflows/production-smoke.yml` runs:

- after every push to `main`, after a short deployment-settle window;
- once daily;
- on manual dispatch.

It calls `scripts/release-smoke.mjs` with the canonical web/API origins. A failed run creates or updates a GitHub issue titled **Production smoke gate**. A later successful run comments on and closes that issue automatically.

## Definition of done

The Foundation Lock is fully complete when repository code, Supabase migration state, Netlify/Render production identity, public health, authenticated sessions, form receipt and end-to-end release journeys all agree. Unknowns remain explicit gates; they are never converted into “done” statements by documentation or UI.
