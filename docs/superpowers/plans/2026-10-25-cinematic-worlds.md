# LastBench Cinematic Worlds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement the approved cinematic entry and lab journeys around existing production routes without replacing auth, intake, private data or exact brand assets.
**Architecture:** Progressive enhancement of the existing static landing. Semantic HTML remains navigable before JavaScript; optional Three.js adds camera depth and portal choreography. Hash-routed public chapters preserve browser history; real existing service/auth routes remain canonical.
**Tech Stack:** HTML, CSS, browser JavaScript modules, existing local Three.js; repository Vitest tests plus browser verification.
**Spec:** docs/cinematic-experience-spec-2026-10-25.md

## Global Constraints
- Exact locked logos; General Sans / Sora; green #00C853 / charcoal / warm white.
- CLASS[Λ] public descriptor: Skill Laboratory, current founder instruction 25 Oct.
- No fictional portfolios, rosters, live cameras or agent runs.
- No new paid service, account migration, database change, merge or publication.
- Preserve existing Malaysia/Class intake, legacy deep links, student sign-in and source archives.
- Source visual: first displayed generated atrium concept; clearer explicit path selector from second is a documented user-delegated choice.
- Real approved founder portraits until authorized standing media exists.

## Review Focus
- JavaScript/WebGL unavailable: all public destinations remain reachable.
- Reduced motion/save-data: camera animation never blocks tasks.
- Browser Back and invalid hashes: return to a meaningful prior route without loops.
- AI unavailable: clearly describe local published-information mode, no fabricated live answer.
- Empty or unapproved directories: show honest empty state without leaking internal records.

### Task 1: State and route contract
Files: landing/cinematic-state.mjs; tests/cinematic-worlds.test.ts; tests/route-gateway.test.ts.
Produces: worlds, resolveScene(hash), nextWorld(id), canAnimate(preferences), selectPublicRecords(records,filter).
- [x] Add failing behavior tests for invalid hashes, preserved routes, motion preferences, public-only evidence.
- [x] Inspect the missing-module failure before implementation; full Vitest RED was unavailable until the pinned dependency install completed. Later naming and entry-interruption regressions were explicitly observed RED → GREEN.
- [x] Implement pure route/preference helpers.
- [x] Run and inspect GREEN; retain existing gateway/deep-link safeguards.

### Task 2: Cinematic entry and lab worlds
Files: landing/index.html; landing/cinematic.css; landing/cinematic.mjs; landing/cinematic-scene.js; landing/assets/cinematic/*.
Consumes: Task1 helpers; existing vendor/three.min.js and exact logo assets.
Produces: accessible portal choice, class/co.lab narrative chapters, URL history, return and continue controls; optional GPU enhancement.
- [x] Replace flat entry on isolated branch with semantic cinematic hub and explicit route links.
- [x] Add world chapters and distinct palettes; preserve direct existing conversion actions.
- [x] Load unbranded generated environment assets and lazy local Three.js after explicit activation.
- [x] Verify static/reduced-motion/failure behavior and meaningful controls.

### Task 3: Company, people, work and intelligence surfaces
Files: landing/cinematic.mjs and company-markup within index; landing/cinematic-content.mjs.
Consumes: approved founder-profile-data.js and original portrait files.
Produces: real-person founder selector, public directory filtering with empty states, evidence-aware portfolio views, public Dr.X local guidance labelled honestly, Co.MPASS status without simulated operations.
- [x] Founder carousel with keyboard/buttons and approved real portraits.
- [x] Add public directory/work views; preserve privacy and content status.
- [x] Keep students in existing /app/auth and /app routes; no mock login success.
- [x] Integrate semantic chat panel with explicit published-information mode and contact escalation.

### Task 4: Review, checks and handoff
Files: design-qa.md; docs/cinematic-verification-2026-10-25.md; preview harness under tools/cinematic-preview/.
- [x] Use sites-preview at terminal.local:4173 and actual cloud-browser inspection.
- [ ] Saved source/implementation screenshot comparison and successful GPU rendering: blocked in this browser environment; recorded in design-qa.md. Static visual inspection and review fixes completed.
- [x] Exercise available public interactions, 390/320px layouts and console fallback; preference logic is unit-covered. Real-device preference/GPU checks remain open.
- [x] Run repository test suite, brand/design checks, TypeScript/lint/build checks appropriate to touched code. Record pre-existing failures separately.
- [x] Fresh whole-branch review, resolve material findings, commit to feature branch.
- [ ] Create a draft PR if remote write access works. No merge or deployment without current publication authorization.

## Scope coverage
The public cinematic layer is executable now. Full standing/volumetric founder capture, approved directory records, event rights, live campus feeds, production agent runtimes and authenticated backend certification remain explicit dependencies, not fabricated completion.

