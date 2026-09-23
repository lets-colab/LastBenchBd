---
name: last-bench-brand-source-lock
description: Mandatory identity-fidelity workflow for every Last Bench visual, poster, social asset, website, deck, Canva/Figma file, image-generation request, or marketing artifact. Prevents logo hallucination, brand recall drift, invented slogans, and source substitution by forcing canonical assets, deterministic fingerprints, post-generation compositing, and saved-artifact QA.
version: 1.0.0
user-invocable: true
---

# Last Bench Brand Source Lock

## Purpose

This skill exists to prevent one specific class of failure: an AI, designer, codebase, or external design tool recreates or "remembers" the Last Bench identity instead of using the exact approved source asset.

Brand recognition is a production constraint, not a creative suggestion.

This skill is mandatory whenever work contains, references, places, edits, exports, generates, or reviews any of the following:

- Last Bench name, logo, icon, tagline, parent-brand colors or typography;
- Education & Mobility marketing;
- posters, flyers, social posts, reels, ads, decks or event collateral;
- website/app surfaces that display the Last Bench identity;
- Canva, Figma, Adobe, image-generation or design-generation workflows;
- third-party handoffs where an agent could reconstruct the mark from memory.

## Authority Order

When sources disagree, use this order:

1. Current explicit user instruction.
2. Exact canonical files and fingerprints in `design-system/brand-lock.json`.
3. Exact brand masters in `assets/branding/`.
4. `design-system/tokens.json`, `design-system/README.md`, `PRODUCT.md`, `design.md`, and `FOUNDATION_LOCK.md`.
5. Verified design-source exports.
6. Older screenshots, previews, generated images, mockups, design-tool files, memories, or inferred styling.

A screenshot, generated poster, Canva design, Figma frame, or remembered appearance can never override the canonical logo file.

## Canonical Identity Assets

The machine-readable source of truth is `design-system/brand-lock.json`.

Current production assets:

- Full production lockup: `landing/assets/logo-full.png`
- Production icon: `landing/assets/logo-icon.png`
- Master/reference board: `assets/branding/logo-lockups.png`

Never use `design-system/logo.svg` in production. It is a legacy recreation retained only for historical compatibility.

## Absolute Prohibitions

For the Last Bench identity:

- Never ask an image model to draw, generate, imitate, recreate, improve, clean up, vectorize, stylize, infer, or "include" the logo.
- Never type-set `LAST BENCH` as a substitute for the production logo when a logo is required.
- Never redraw the bench + rising arrow.
- Never create an SVG approximation from the PNG.
- Never recolor the locked logo asset.
- Never crop, stretch, warp, rotate, trace, or alter its internal proportions.
- Never replace the `Λ`-style A or other distinctive geometry with a font approximation.
- Never treat an AI-generated image containing the mark as an acceptable final logo.
- Never invent a tagline, slogan, phone number, partnership, ranking, scholarship condition, visa claim, rebate condition, ticket promise, or outcome to fill a layout.
- Never call a draft or preview "brand-correct" until the saved/exported artifact is inspected.

If the canonical asset cannot be accessed, stop the branding step. Leave a reserved blank area or ask for the asset. Do not fabricate a placeholder.

## Mandatory Two-Stage Visual Workflow

### Stage A — Generate only the unbranded visual layer

When AI imagery is useful, generate photography/background/scene only.

The generation request should avoid asking the model to render:

- the Last Bench name;
- the logo or icon;
- the tagline;
- contact details;
- offer text;
- CTA text;
- any other brand mark.

Where possible, request **no text and no logos** in the AI-generated layer.

The AI layer may use the approved visual mood and palette, but it is not the brand layer.

### Stage B — Composite exact brand assets

After the visual layer exists:

1. Load the exact canonical PNG from the repository or a verified derivative with the same fingerprint.
2. Insert it as an independent image layer in Canva, Figma, Adobe, code, or another compositor.
3. Preserve aspect ratio.
4. Preserve clear space.
5. Use the asset unchanged.
6. Add controlled copy as editable text outside the logo asset.
7. Keep one dominant CTA.

The compositor, not the image generator, owns brand placement.

## Tool-Specific Rules

### Canva

- Upload the canonical production PNG directly.
- Name it clearly as an official locked asset.
- Insert it as an image layer.
- Do not use Magic Media or generative design to recreate the logo.
- If a generated background contains a fake logo or fake wordmark, remove/cover that element before inserting the official logo.
- Inspect the saved Canva design, not only an editing-transaction preview.

### Figma

- Place the canonical raster asset or a separately approved official vector master.
- Do not auto-trace or reconstruct the mark from shapes.
- Make the logo component non-editable where team permissions allow.

### Image generation

- Generate unbranded scene/background only.
- Never mention "draw the Last Bench logo" or equivalent.
- Never accept an approximate logo from generated output.
- Brand compositing happens afterward.

### Web/app implementation

- Reference the canonical production files.
- Never introduce `design-system/logo.svg`.
- Do not inline a hand-built SVG or CSS recreation of the logo.
- Decorative arrow/bench-like UI geometry must not become a substitute logo.

## Brand Recall Packet

Before any Last Bench design task, recall these locked facts from repository sources rather than memory:

- Parent brand: Last Bench.
- Category: Opportunity Accelerator.
- Visual law: Dark for emotion. White for trust. Green for progress.
- Brand Green: `#00C853`.
- Bright Green on dark: `#00E676`.
- Charcoal: `#111111`.
- Warm White: `#FAFAF8`.
- Display: General Sans.
- Body/UI: Sora.
- Official tagline: `Creating a Lasting Benchmark`.
- Production logo and icon paths/fingerprints come from `design-system/brand-lock.json`.

If a detail is absent from canonical sources, it is unknown. Do not invent it.

## Copy Governance

Use verified copy only.

New campaign headlines may be proposed, but they are not canonical brand lines until explicitly approved.

Do not silently convert generated copy into brand truth.

For offers and claims:

- keep the exact currently approved wording;
- verify eligibility/conditions when needed;
- do not imply guaranteed admission, visa, scholarship, rebate, ticket, employment, revenue, or outcome;
- use terms/eligibility language when a benefit is conditional.

## Mandatory Verification Gates

### Gate A — Asset fingerprint

Run:

```bash
pnpm brand:check
```

The check must verify the canonical logo files and approved duplicates against their locked Git blob fingerprints.

### Gate B — No reconstruction

Confirm the final artifact does not contain:

- a second/fake/generated Last Bench mark;
- typed text pretending to be the logo;
- a hand-built SVG recreation;
- the deprecated logo asset.

### Gate C — Copy truth

Confirm:

- no invented slogans or claims;
- spelling and country demonym are correct;
- offers match approved sources;
- no fake phone number/contact detail;
- no unverified partnership/ranking/outcome.

### Gate D — Saved-artifact review

Inspect the actual saved/exported artifact after edits are committed.

A draft preview is not sufficient evidence.

### Gate E — Visual QA

Check:

- logo clarity and clear space;
- correct aspect ratio;
- one dominant hierarchy;
- readable mobile scale;
- approved palette;
- no logo collision with photography;
- no accidental crop or low-resolution scaling.

## Failure Rules

- Canonical asset unavailable -> stop branding; do not substitute.
- Fingerprint mismatch -> fail.
- Generated fake logo present -> remove it; do not publish.
- Unapproved slogan/claim -> remove or request approval.
- Draft-only verification -> do not call the work final.
- Any uncertainty about logo identity -> use repository source, not memory.
- Any conflict between aesthetics and identity fidelity -> identity fidelity wins.

## Release Language

Do not say `final`, `approved`, `brand-correct`, `10.5/10`, `ready`, or `publishable` merely because a design looks good.

Those statements require all verification gates above to pass.

## Definition of Done

A Last Bench branded artifact is done only when:

1. the exact canonical logo/icon is used where required;
2. its fingerprint matches the lock manifest;
3. no generated or reconstructed substitute remains;
4. all copy is approved or clearly labeled as proposed;
5. all factual offers/claims are verified;
6. the saved/exported artifact has been inspected;
7. brand and visual QA pass;
8. the relevant automated brand check is green.
