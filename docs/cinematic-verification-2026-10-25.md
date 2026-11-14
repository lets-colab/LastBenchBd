# LastBench cinematic implementation — verification and release boundary

Date: 25 October 2026. Branch: `feat/cinematic-worlds-20261025`.
Status: reviewable public frontend implementation; production release and full cinematic acceptance remain open.

## What is implemented

- A realistic architectural entry with three explicit paths and semantic direct links.
- Malaysia city establishing artwork; dark CLASS[Λ] Skill Laboratory chapters around the original silver 20/orbit asset; white glass co.lab chapters with electric blue actions.
- Three chapters per path, optional continuation, return navigation and browser history.
- Real approved founder portraits with buttons, arrow keys, swipe selection and public information chat.
- Public people directory search/filtering; industry-labelled work concept; honest unpublished roster, student product and event states.
- Dr. X public-information guide clearly labelled as local, with no live AI connection. Co.MPASS workspace direction is described without implying agent runs or connected private access.
- Static content and navigation when application scripts are absent. Lazy camera enhancement, reduced-motion/save-data checks, resource disposal and a static WebGL failure path.
- Existing intake, authentication, student app, exact logos and approved profile data remain the owners of their existing functionality. Public CLASS descriptor is reconciled to the current founder direction in canonical docs and destinations.

## What is not completed by this branch

| Requirement | Actual state / dependency |
|---|---|
| Claude student portal | Original desktop/mobile source recovered from the latest matching saved archive; source/design review recorded in the blueprint. Its prototype `window.claude.complete` and sample data are not a production login or AI service. This branch preserves `/app/` and `/app/auth`; it does not replace the authenticated application with that prototype. |
| Full realistic city travel | New photoreal establishing chapter is implemented. The existing Malaysia journey runtime is preserved; a free-roaming reconstructed city and campus geometry are not implemented. |
| Standing holographic founders | Profile selector uses real approved portraits in a spatial frame. Standing/volumetric media and authorized voice are still needed. |
| Creators, ambassadors, student products | Directory surfaces exist. Approved public records, product evidence and contact permissions are still needed. |
| Partylab, Redsea, Formula 1, Neo | Requested editorial inventory is in the spec. Actual roles, media rights and case evidence remain unverified, so no case study was fabricated. |
| Dr. X / Co.MPASS runtime | Public UI and product direction only. Production personal assistant, specialist agents, identity scopes, audit trails and workspace connections remain separate work. |
| God's Eye / campus view | Feasibility researched in the spec; no map keys, paid integration, campus live feed or phone orientation permission was added. Live campus imagery requires actual licensed feeds. |

## Automated verification

- Vitest: **20 files / 110 tests passed**, including interruption deadline/cancellation regression tests.
- TypeScript: `tsc --noEmit` passed after test annotations were corrected.
- Full repository lint: **0 errors, 3 existing array-style warnings in `server/_core/llm.ts`**.
- Targeted cinematic lint: passed.
- Design system, brand lock, JEV architecture and audience boundary checks: passed.
- Server bundle: passed. Complete web export and landing assembly: passed; 25 local app asset references verified and 12 exact app routes materialized.
- Production public-env validation correctly refused a release without `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No credentials were fetched or fabricated.
- No dependency or lockfile change; pinned pnpm 9.12.0 used after ambient pnpm 11 rejected configuration.

## Browser evidence and limits

Observed in the actual browser: desktop hub and co.lab, CLASS chapter changes and continuation to co.lab, founder button/keyboard selection, profile chat with literal HTML handled as text, directory search, unpublished ambassador state, event state, mobile menu and founder navigation, keyboard skip regression before/after correction, and all public overview anchors with application scripts stripped by the preview harness.

390px and 320px iframe viewports were exercised. The 390px hub reported client/scroll width 375/375 and the 320px CLASS world 305/305 (15px reserved for the browser scrollbar): no horizontal overflow in those states. The chapter targets were then raised to the 44px minimum.

WebGL is disabled in this cloud browser. Enabling depth produced a renderer context error, then visibly returned to the static view with **zero leftover canvases and all routes available**. This verifies failure recovery, not successful GPU rendering. Camera depth must be tested on a GPU-enabled desktop and actual iOS/Android phones before release. Reduced-motion/save-data logic is unit-covered; device-level preference changes remain to be checked.

Rendered screenshots were inspected through the browser. Export to the coding workspace was unavailable, so no saved source-versus-implementation screenshot comparison or full visual acceptance is claimed. Contrast, screen-reader behavior, live authentication, real-device GPU performance and canonical-host `.mjs` MIME behavior remain release checks.

## Independent review and corrections

A fresh reviewer inspected the whole branch and found four P2 issues:

1. Missing static public content: semantic overview anchors and visible mobile fallback navigation added.
2. Interrupted camera entry could swallow navigation: navigation now owns a 650ms deadline, completes on pause/visibility interruption and cancels stale callbacks when routes change. Two tests observed failing, then passing.
3. Skip link changed a content route into the hub: reproduced in browser, corrected to focus main without changing the hash, then verified on Company.
4. Empty approved project list left a blank region: explicit empty state added. Data filtering remains public-and-approved only.

Additional resilience fixes: asynchronous scene loads are discarded after route/preference changes, failed texture loads release their renderer, and pausing depth reveals the static image.

No minor review findings were deferred. The remaining release checks above are explicit acceptance gaps, not a claim of 10.5/10 readiness. Nothing was merged or deployed.
