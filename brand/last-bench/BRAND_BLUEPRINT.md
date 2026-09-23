# Last Bench — Canonical Brand Blueprint

Status: **canonical parent-brand reference**  
Repository: `lets-colab/LastBenchBd`

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

Canonical files in this folder:

- `logo-full.png` — production full lockup
- `logo-icon.png` — production icon
- `logo-lockups.png` — master/reference board

The exact fingerprints are in `brand-lock.json`.

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
