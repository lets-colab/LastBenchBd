# Last Bench — Canonical Brand Blueprint

Status: **canonical parent-brand reference — founder lock reconciled 2026-09-28**  
Repository: `lets-colab/LastBenchBd`  
Authority: latest explicit founder lock overrides older screenshots, mockups, recolors and reconstructed logo versions.

## 1. Brand definition

**Name:** Last Bench  
**Category:** Opportunity Accelerator  
**Descriptor:** Education · Capability · Business · Community  
**Brand promise:** **From where you are. To what you can build.**  
**Official tagline:** **Creating a Lasting Benchmark**  
**Approved slogan in the current design system:** **From Last Bench. To The World.**

Last Bench is the parent opportunity platform. It connects education and mobility, capability building, business creation/growth, community, and the shared platform layer.

## 2. Brand architecture

### Last Bench / Education & Mobility

Helps Bangladeshi students navigate the journey to study, settle and succeed in Malaysia. Malaysia is an active service lane, not the identity of the whole parent brand.

### CLASS[Λ]

Independent capability accelerator under the Last Bench ecosystem. It keeps its own visual namespace.

### co.lab

Independent Business & Growth namespace. Its canonical brand assets and blueprint live in the separate `lets-colab/letscolab` repository.

Shared ownership does **not** mean identical visual treatment.

## 3. Visual law

> **Dark for emotion. White for trust. Green for progress.**

### Locked colors

- Brand Green — `#00C853`
- Bright Green on dark — `#00E676`
- Charcoal — `#111111`
- Warm White — `#FAFAF8`
- Sage — `#E6F2E9`
- Gray — `#6B6F76`

Green is a progress/action signal, not a page-filling decorative color.

### Typography

- Display — **General Sans**
- Body/UI — **Sora**

Use short declarative headlines, disciplined hierarchy, generous negative space, and one dominant action.

## 4. Logo system

### Founder lock — 27–28 September 2026

The uploaded and approved Last Bench artwork is the **sole official brand mark**. Every older redraw, approximation, alternate construction, recolor or AI-generated version is deprecated unless the founder explicitly replaces this lock later.

The identity consists of the exact:

- stacked **LAST / BENCH** wordmark with the approved stylized **A**;
- green bench + upward-arrow symbol;
- tagline **CREATING A LASTING BENCHMARK**;
- approved proportions, spacing and geometry.

### Background behavior

The logo must remain **transparent** when used as an overlay/brand asset.

- On **light / white backgrounds**: use the exact approved variant with **black wordmark**, green bench-arrow, and the approved tagline treatment.
- On **dark / black backgrounds**: use the exact approved variant with **white wordmark**, green bench-arrow, and the approved tagline treatment.
- Do **not** recolor an asset with CSS filters, blend modes, image generation or tracing to manufacture the other variant. Use an exact approved source file.
- The green bench-arrow remains the brand signal; do not convert it into a substitute logo treatment unless an exact approved variant explicitly contains that treatment.

### Repository assets

Current locked/reference assets include:

- `landing/assets/logo-full.png` — current production transparent full lockup for dark backgrounds (white wordmark).
- `landing/assets/logo-icon.png` — production icon where icon-only use is explicitly appropriate.
- `assets/branding/logo-lockups.png` — approved reference board showing the identity construction and variants.
- `design-system/brand-lock.json` — machine-readable byte/source lock for repository assets.

The reference board is **reference evidence**, not permission to crop, redraw or recreate a logo from the board. If a required light-background transparent full-lockup source is not present as an exact approved asset in the working environment, do not improvise it.

### Non-negotiable logo rules

- Never redraw, regenerate, approximate, trace, vectorize, type-substitute or reconstruct the mark.
- Never ask an image model to create or imitate the Last Bench logo.
- Never use `design-system/logo.svg` in production.
- Never stretch, squash, rotate, skew, alter spacing or change the approved geometry.
- Never substitute a previous logo version because it is easier to access.
- Generate backgrounds/photography separately, then composite the exact approved logo asset afterward.
- Preserve aspect ratio and clear space.
- Inspect the actual saved/exported artifact before release.

### Conflict rule

If an older source says the logo must have a baked white background, says no transparent variant exists, or identifies a previous JPEG as the sole master, that instruction is **superseded by the 27–28 September 2026 founder lock**. The current rule is transparent placement with the approved black-on-light / white-on-dark wordmark behavior.

## 5. Visual language

Last Bench should feel:

- cinematic but sincere;
- trustworthy rather than consultancy-generic;
- forward-moving;
- human and opportunity-led;
- premium without visual noise.

Approved supporting motifs include restrained topographic/contour lines and journey/route cues. They must remain secondary to the identity and message.

## 6. Voice

Use:

- truth before persuasion;
- outcome before feature;
- direct, human language;
- clear distinctions between live, planned and proposed capability.

Never imply guaranteed admission, visa, scholarship, rebate, ticket, employment, revenue, or outcome.

## 7. Experience principles

- one dominant idea per viewport;
- one dominant CTA per section;
- mobile-first;
- WCAG AA minimum;
- minimum 44px targets;
- visible focus;
- reduced-motion support;
- motion only when it explains hierarchy, progress, or spatial relationship.

## 8. Production release gate

A Last Bench branded artifact is not final until:

1. exact canonical logo asset is used;
2. asset fingerprint matches;
3. no fake/generated duplicate logo remains;
4. copy and factual claims are verified;
5. saved/exported artifact is visually inspected;
6. `pnpm brand:check` passes where applicable.

When aesthetics conflict with identity fidelity, **identity fidelity wins**.
