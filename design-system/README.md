# Last Bench Design System

This directory is the canonical implementation contract for the **Last Bench parent brand**.

Last Bench is an **Opportunity Accelerator** with three operating engines — Education & Mobility, CLASS[Λ], and co.lab — connected by Community + Platform. The parent visual law is:

> **Dark for emotion. White for trust. Green for progress.**

This system governs Last Bench corporate, Education & Mobility, Journey OS, and the shared app shell. It does **not** visually homogenize CLASS[Λ] or co.lab.

## Brand source lock

Last Bench identity is also protected by a machine-enforced source lock:

- Manifest: `design-system/brand-lock.json`
- Validator: `scripts/validate-brand-lock.mjs`
- Mandatory agent skill: `skills/last-bench-brand-source-lock/SKILL.md`
- Runtime mirrors: `.claude/skills/last-bench-brand-source-lock/SKILL.md` and `.agents/skills/last-bench-brand-source-lock/SKILL.md`
- CI gate: `.github/workflows/brand-lock.yml`

The locked workflow separates **unbranded AI-generated visuals** from **brand compositing**. Image models may generate scene/background material, but they must never generate, redraw, imitate, vectorize, recolor, or reconstruct the Last Bench logo. The exact production PNG is composited afterward and the saved/exported artifact must be inspected before release.

Run:

```bash
pnpm brand:check
```

Any fingerprint mismatch, deprecated-logo usage, skill drift, unapproved root logo asset, or prohibited campaign phrase blocks the brand gate.

## Source priority

When sources disagree, use this order:

1. Current explicit user instruction.
2. Exact locked brand masters in `assets/branding/`.
3. `PRODUCT.md`, `design.md`, and `FOUNDATION_LOCK.md`.
4. This file and `design-system/tokens.json`.
5. Verified Claude Design export under `design-source/claude-design/2026-09-08/`.
6. Older screenshots, mockups, previews, or historical notes.

Unknowns stay unknown. Do not invent brand facts, traction, outcomes, partnerships, or product state to complete a layout.

## Logo lock

**Use exact source assets only. Never redraw, regenerate, recolor, approximate, or type-substitute the Last Bench mark.**

Canonical sources:

- Master/reference lockups: `assets/branding/logo-lockups.png`
- Approved production web lockup: `landing/assets/logo-full.png`
- Approved production icon: `landing/assets/logo-icon.png`

`design-system/logo.svg` is a **legacy digital recreation** kept only for historical compatibility. It is not a brand master and must not be introduced into production surfaces.

## Files

- `tokens.json` — machine-readable design foundations and namespace boundaries.
- `previews/` — reference cards for reviewing colors, type, and lockups.
- `../theme.config.js` — app semantic colors derived directly from `tokens.json`.
- `../scripts/validate-design-system.mjs` — deterministic guardrail against token, logo, deployment, and namespace drift.
- `../design.md` — product/experience constitution.
- `../SITE_BLUEPRINT.md` — corporate 20-scene public narrative.

Run:

```bash
pnpm design:check
```

before merging design-system or UI-source changes.

## Parent foundations

### Color

Locked brand colors:

- Brand Green — `#00C853`
- Bright Green on dark — `#00E676`
- Charcoal — `#111111`
- Warm White — `#FAFAF8`
- Sage — `#E6F2E9`
- Gray — `#6B6F76`

Green is a progress/action signal, not a page-filling decorative color. Warm White is the default light page ground. Charcoal/near-black carries emotional/cinematic moments.

### Typography

- Display: **General Sans**
- Body/UI: **Sora**

Use short declarative headlines, disciplined hierarchy, tight display leading, and comfortable body leading. Avoid decorative type proliferation.

### Layout and spacing

Use the 4px-derived spacing scale in `tokens.json`. Prefer one dominant idea per viewport, generous negative space, and clear action hierarchy. Avoid generic SaaS card grids unless the information architecture genuinely requires a grid.

Responsive breakpoints follow the project/Tailwind contract:

- `sm` 640
- `md` 768
- `lg` 1024
- `xl` 1280
- `2xl` 1536

Design mobile-first. No essential meaning may depend on hover.

### Interaction

- Minimum interactive target: **44 × 44 px**
- Preferred primary target: **48 × 48 px**
- One dominant CTA per section/viewport
- Visible keyboard focus
- Loading, empty, error, success, and disabled states are part of the component, not post-launch cleanup

Motion must explain hierarchy, progress, or spatial relationship. Decorative motion is subordinate to readability and conversion. Always honor `prefers-reduced-motion`.

### Accessibility

Minimum release floor:

- WCAG AA text contrast
- keyboard-operable actions on web
- visible focus treatment
- semantic labels for icon-only controls
- reduced-motion fallback
- no information conveyed only by color
- minimum 44px targets
- readable mobile typography without horizontal overflow

## Namespace boundaries

### Last Bench / Education & Mobility

Visual language: cinematic but trustworthy; dark, warm white, progress green, topographic/contour texture, restrained map/journey cues.

Malaysia is one active Education & Mobility service. It must never become the parent-company identity.

### CLASS[Λ]

Independent capability namespace. Canonical implementation lives under `landing/class-a/`.

Visual language: near-black, editorial, technical, spatial/cinematic, proof-led. Do not force Last Bench green/white marketing styling onto it.

### co.lab

Independent Business & Growth namespace. Canonical visual source belongs to the co.lab project/repository.

Visual language: engineered/blueprint, monochrome discipline with its approved accent system. Do not reduce co.lab to a CLASS[Λ] course module or a Last Bench green subpage.

Shared ownership does not mean shared visual treatment.

## Component law

Every reusable component should answer five questions:

1. **Purpose** — what user decision or action does this support?
2. **Hierarchy** — what is primary, secondary, and optional?
3. **State** — default, hover/focus/pressed where relevant, loading, empty, error, disabled, success.
4. **Evidence** — is displayed information verified, roadmap, or proposed?
5. **Responsiveness** — what changes at mobile width without losing meaning?

If a component cannot answer those questions, it is not finished.

## Release gates

A Last Bench design change is complete only when:

- exact locked logos are preserved;
- parent/CLASS[Λ]/co.lab namespaces remain distinct;
- `pnpm design:check` passes;
- CI passes;
- Impeccable design QA runs on the change;
- mobile and reduced-motion behavior remain supported;
- the GitHub Pages workflow rebuilds when any UI/design-system source that affects production changes;
- no roadmap capability is presented as live proof.
