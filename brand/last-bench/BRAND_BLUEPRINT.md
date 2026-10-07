# Last Bench — Canonical Brand Blueprint

Status: **canonical parent-brand reference**  
Repository: `lets-colab/LastBenchBd`

## 1. Brand definition

**Name:** Last Bench  
**Category:** Company / opportunity-building ecosystem  
**Architecture descriptor:** CLASS[Λ] Human Lab · co.lab Business Lab · Co.MPASS Business Dashboard · Dr. X Founder Second Brain  
**Brand promise:** **From where you are. To what you can build.**  
**Official tagline:** **Creating a Lasting Benchmark**  
**Approved slogan in the current design system:** **From Last Bench. To The World.**

Last Bench is the company. CLASS[Λ] builds builders; co.lab incubates, accelerates and grows businesses; Co.MPASS converges governed company evidence into context and direction; Dr. X is the Founder Second Brain / Twin that reasons and decides. Education & Mobility remains an operating/service domain rather than a separate top-level engine in the locked architecture.

## 2. Brand architecture

### Last Bench / Education & Mobility

Helps Bangladeshi students navigate the journey to study, settle and succeed in Malaysia. Malaysia is an active service lane, not the identity of the whole parent brand.

### CLASS[Λ]

Human Lab inside Last Bench. It builds builders through skill, execution and proof and keeps its own visual namespace.

### co.lab

Business Lab inside Last Bench. Its four doors are Ventures, Projects, Services and Community. ProjectX is Website Projects. Its canonical brand assets and blueprint live in the separate `lets-colab/letscolab` repository.

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

Canonical files in this folder:

- `logo-full.png` — production full lockup
- `logo-icon.png` — production icon
- `logo-lockups.png` — master/reference board

The exact fingerprints are in `brand-lock.json`.

### Adaptive transparent logo rule

This rule overrides any older mockup or preview treatment:

- **Logo background is always transparent.** Never export or place the Last Bench logo with a baked-in black, white, cream, or colored rectangle.
- **Light/white background:** use the black/charcoal `LAST BENCH` wordmark. The bench + rising-arrow mark stays Brand Green.
- **Dark/black background:** use the white `LAST BENCH` wordmark. The bench + rising-arrow mark stays Brand Green.
- The non-green portion of the tagline follows the wordmark contrast: black/charcoal on light backgrounds, white on dark backgrounds. `BENCHMARK` remains Brand Green.
- **Never add a logo plate/box** merely to create contrast. Move the logo to a suitable area or adjust the surrounding composition instead.
- Do not recolor the green bench-arrow to solve contrast.
- Do not use a white-wordmark variant on a light background or a black-wordmark variant on a dark background.

For Canva, the currently verified transparent working variants are:
- light-background / black-wordmark: asset `MAHWdEIgzME`
- dark-background / white-wordmark: asset `MAHWdLPnTmc`

These Canva IDs are workflow references, not substitutes for the repository brand master.

### Non-negotiable logo rules

- Never redraw, regenerate, recolor, approximate, trace, or type-substitute the mark.
- Never ask an image model to create or imitate the Last Bench logo.
- Never use `design-system/logo.svg` in production.
- Generate backgrounds/photography separately, then composite the exact logo asset afterward.
- Preserve aspect ratio and clear space.
- Inspect the actual saved/exported artifact before release.

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
