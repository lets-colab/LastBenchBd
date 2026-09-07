# Last Bench Foundation Lock

This document is the release contract for moving Last Bench from a strong release candidate to a production-trustworthy platform.

## Principle

Important product state must have one authoritative source, one owner, one verified state, and one safe mutation path.

## Gate A — Database truth

Before any production migration is applied:

1. Export the live Supabase schema.
2. Compare it against `drizzle/schema.ts` and committed SQL migrations.
3. Run the preflight checks in `scripts/database-foundation-preflight.sql`.
4. Resolve every orphan and duplicate reported by the preflight.
5. Only then generate/review a migration that adds missing uniqueness, foreign-key, and index constraints.
6. Back up production before applying the migration.
7. Verify application, messaging, tutor/referral, payout, notification, cohort, and AI-memory flows after migration.

**Do not run `pnpm db:push` blindly against production.**

## Gate B — Production identity and environment

Production is not considered live until all of the following are verified against the canonical domains:

- `www.lastbenchbd.com` serves the landing experience.
- `/app/` serves the student application.
- `api.lastbenchbd.com/api/health` succeeds.
- Netlify production has real OAuth identifiers; placeholder `*-unconfigured` values are not accepted.
- Render has the required database, OAuth, CORS, Forge/AI, owner, and signing values.
- Fresh-browser login succeeds.
- Returning session survives reload.
- At least one authenticated tRPC query succeeds.
- Logout invalidates access.
- Each active Netlify form receives a real submission.

A successful static build or CI run is not production proof.

## Gate C — Security and abuse controls

Required before broad public launch:

- OAuth rate limiting remains enabled.
- AI chat has per-user burst and daily usage controls.
- Messaging has per-user abuse controls.
- CORS remains explicit allow-list only.
- Cookie SameSite/CSRF behavior is tested on the real web/API domains.
- Document URLs remain HTTPS-only and application access remains ownership/role checked.
- Sensitive logs must not contain authorization codes, bearer tokens, session tokens, document URLs, phone numbers, email addresses, or raw model prompts containing student PII.

## Gate D — Product cleanup

- Decide whether hidden `discover` and `community` routes are supported deep links, redirects, or dead code; do not leave ambiguous duplicates.
- Finish the reviewed document-picker/upload user flow before describing document upload as complete.
- Development-only routes such as the theme lab must not be exposed as normal production navigation.
- Commercial copy and pricing for CLASS[Λ] must have one versioned source of truth.

## Gate E — Repository normalization

- Active repository: `lets-colab/LastBenchBd`.
- Root package metadata must identify Last Bench, not a generic template.
- Stale repo names and obsolete deployment instructions must be removed when encountered.
- Conflicted/stale PRs must not be used as architectural truth.
- `README.md` is repository orientation; `AGENT.md` is the detailed operating guide; product/design files own product/brand rules.

## Gate F — Mobile identity

Before first public app-store release, explicitly lock:

- Display name
- Expo slug
- iOS bundle identifier
- Android package identifier
- Deep-link URL scheme
- Associated domains / Android App Links
- EAS project ownership and release credentials

Do not change a released bundle/package identifier casually; it is effectively application identity.

## Gate G — End-to-end release journeys

Automate or manually certify these journeys on staging/production before declaring a release:

1. Signup → OAuth → onboarding → authenticated dashboard.
2. Student application → mentor/admin update → student sees sanitized state.
3. Message A → B → B reads → unread state updates.
4. Tutor referral → earned commission → payout reservation.
5. CLASS[Λ] form → confirmed Netlify submission.
6. Logout → protected API call is rejected.
7. Returning browser session → authenticated after refresh.

## Definition of done

The Foundation Lock is complete only when repository code, migration history, live database state, deployment configuration, and release verification all agree. Unknowns are recorded as unknowns; they are never promoted to facts by documentation or UI.