# Last Bench Foundation Lock

This document is the production-trust contract for Last Bench. It separates verified infrastructure facts from remaining release gates.

## Principle

Important product state must have one authoritative source, one owner, one verified state, and one safe mutation path.

## Current verified foundation — 22 September 2026

- Canonical repository: `lets-colab/LastBenchBd`.
- Canonical web URL: `https://lastbenchbd.com`.
- GitHub Pages is the primary production web deployment path. Workflow `.github/workflows/deploy-github-pages.yml` builds the exact host-neutral artifact from `main` and deploys it with GitHub Pages provenance.
- The first GitHub Pages production run (`35683150738`) completed successfully for commit `c9f98c678a43a59c64cbc60e9d09851684a8b2b4`; both build and deploy jobs passed and GitHub reported `https://lets-colab.github.io/LastBenchBd/` as the deployment URL.
- The immutable production artifact from that run is `lastbench-production-dist` `10675761617`, SHA-256 `e2fca9453673353c8a1f68d4099a21a7dd1d05f53c9c3106e72b6fb2707757c3`.
- Automatic Netlify production deployment is retired. Netlify remains a legacy manual fallback only.
- The canonical domain has **not** completed host cutover yet. DNS verified on 22 September 2026 still points the apex to Netlify addresses `75.2.60.5` / `99.83.231.61`, while `www.lastbenchbd.com` CNAMEs to `lastbenchbdd.netlify.app`. Therefore `lastbenchbd.com` must not be treated as proof of the GitHub Pages release until DNS is changed and the release fingerprint is re-verified.
- Current `main` builds the complete host-neutral production artifact successfully.
- A release fingerprint prevents a stale homepage from passing production smoke checks.
- Canonical API custom hostname: `https://api.lastbenchbd.com`.
- Canonical working Render service: `last-bench-api-v2` in Singapore.
- Direct Render health is verified at `https://last-bench-api-v2.onrender.com/api/health`.
- `https://api.lastbenchbd.com/api/health` is verified reachable with semantic JSON `ok: true`; the Render custom-domain routing gate is complete.
- Authentication has been migrated away from Manus OAuth to Supabase Auth.
- Supabase production project `the-last-bench` is `ACTIVE_HEALTHY` in `ap-southeast-1`.
- Production web configuration for GitHub Pages is explicit in `.github/workflows/deploy-github-pages.yml` and uses the reviewed public API/Supabase values.
- The live Supabase migration ledger includes the repository foundation migrations, Supabase identity/storage migration, CLASS[Λ] registration migration, DR.X social-engine runtime/activation migrations, and the insert-only homepage signup migration.
- The homepage source now submits directly to `public.lastbench_signups`; public roles have INSERT only and cannot read, update or delete submitted leads.
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

## Gate B — Production web/API routing ⚠ web cutover active

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
- [x] `api.lastbenchbd.com` returns semantic JSON health from the Render service.
- [x] Current repository builds the complete production web artifact.
- [x] GitHub Pages build and deployment completed successfully from `main`.
- [x] GitHub Pages generated a working deployment target at `https://lets-colab.github.io/LastBenchBd/`.
- [ ] Move the canonical apex and `www` DNS away from Netlify to the GitHub Pages custom-domain configuration.
- [ ] Verify `lastbenchbd.com` serves the same release fingerprint after DNS/HTTPS convergence.

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

The repository homepage now posts to the RLS-protected Supabase table `public.lastbench_signups`. CLASS[Λ] posts to `public.class_a_registrations`; compatibility Netlify markup remains during the host transition. Historical Netlify submissions are retained.

Before declaring conversion flows complete:

- [x] Homepage intake schema, insert-only RLS and public REST transport are verified in production Supabase.
- [ ] A real production homepage journey creates the expected `lastbench_signups` row.
- [ ] A real CLASS[Λ] masterclass journey creates the expected `class_a_registrations` row.
- [ ] A real CLASS[Λ] course journey creates the expected `class_a_registrations` row.
- [ ] Receipt is verified in the intended Supabase table rather than inferred from a thank-you screen.

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
- [x] GitHub Pages production deployment is integrated with `main`; automatic Netlify production deployment is retired.
- [ ] Complete canonical-domain DNS cutover to the verified GitHub Pages deployment.

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
5. Homepage/CLASS[Λ] form → confirmed Supabase row.
6. Logout → protected API call is rejected.
7. Returning browser session → authenticated after refresh.

## Automated monitoring behavior

`.github/workflows/production-smoke.yml` runs:

- after every push to `main`, after a deployment-settle window;
- once daily;
- on manual dispatch.

It calls `scripts/release-smoke.mjs` with the canonical web/API origins plus the direct Render diagnostic origin. The smoke gate verifies semantic API health and detects stale homepage HTML through release fingerprints. A failed run creates or updates the GitHub issue **Production smoke gate**. A later successful run comments on and closes that issue automatically.

## Gate J — Brand identity source lock

Last Bench visual identity is governed by a deterministic source-lock system:

- Canonical manifest: `design-system/brand-lock.json`.
- Production logo: `landing/assets/logo-full.png`.
- Production icon: `landing/assets/logo-icon.png`.
- Master/reference board: `assets/branding/logo-lockups.png`.
- Mandatory skill: `skills/last-bench-brand-source-lock/SKILL.md` with mirrored copies for Claude/agent runtimes.
- Validation command: `pnpm brand:check`.
- CI gate: `.github/workflows/brand-lock.yml`.

Release requirements:

- [x] Canonical logo/icon fingerprints are machine-locked.
- [x] Approved duplicate assets must remain byte-identical to their canonical source.
- [x] The legacy `design-system/logo.svg` recreation is blocked from production use.
- [x] AI image generation is prohibited from rendering/recreating the Last Bench mark; AI may generate only an unbranded visual layer and the exact logo is composited afterward.
- [x] Agent skill copies are checked for drift.
- [x] Saved/exported artifact review is mandatory before calling a branded artifact final.
- [ ] Enable branch/ruleset protection on `main` so the Brand Lock status check and CODEOWNERS review cannot be bypassed by direct pushes.

A visually attractive result is not brand-approved unless this gate passes.

## Definition of done

The Foundation Lock is fully complete when repository code, Supabase migration state, GitHub Pages production deploy, canonical-domain DNS, Render routing, authenticated sessions, form receipt and end-to-end release journeys all agree. Unknowns remain explicit gates; they are never converted into “done” statements by documentation or UI.
