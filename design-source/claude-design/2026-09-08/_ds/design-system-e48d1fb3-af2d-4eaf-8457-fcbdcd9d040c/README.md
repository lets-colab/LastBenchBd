## What this design system is — read this first

**This bundle contains brand foundations, not components.** There is no
`_ds_bundle.js` and no `window.*` component namespace, because the Last Bench
repo is an Expo/React Native application (`main: expo-router/entry`), not a
distributable component library. Do not attempt to import or render a component
from this design system — none exist here.

What you get: the exact colour, typography, voice and motif vocabulary of the
brand. Build layouts with your own primitives, styled with the tokens below.

## No provider, no wrapper

Nothing needs wrapping. Tokens are plain CSS custom properties on `:root`,
delivered by `styles.css`. Link or import that one file and every token below
resolves. `styles.css` also pulls the brand webfonts, so it is the only entry
point you need.

## The styling idiom: CSS custom properties

Never hardcode a hex value. Every colour and family has a token.

| Token | Value | Use for |
|---|---|---|
| `--lb-color-brand-green` | `#00C853` | Primary actions, the one emphasised phrase per headline |
| `--lb-color-brand-green-dark` | `#00E676` | Brand green on dark surfaces, hover states |
| `--lb-color-charcoal` | `#111111` | Body copy, headlines, dark surfaces |
| `--lb-color-warm-white` | `#FAFAF8` | Light page grounds. **Never pure white** |
| `--lb-color-sage-green` | `#E6F2E9` | Tinted panels, borders, soft fills behind icons |
| `--lb-color-gray` | `#6B6F76` | Secondary text, captions |
| `--lb-color-soft-gray` | `#A1A1AA` | Muted text on dark, disabled states |
| `--lb-font-display` | General Sans | Headlines. All-caps, tight leading |
| `--lb-font-body` | Sora | Body copy, UI labels, captions |
| `--lb-font-bengali` | Hind Siliguri | Bengali (বাংলা) copy — the product ships an EN/বাংলা toggle |

## Three brand laws that are not optional

1. **Dark for emotion, white for trust, green for progress.** Pick the ground
   by which job the section does.
2. **One phrase per headline turns Brand Green.** The rest stays Charcoal.
   Never colour a whole headline; never colour two phrases.
3. **Voice is short declarative pairs, full stops as beats** — "From Last Bench.
   To The World." Do not write flowing marketing sentences.

## Where the truth lives

- `styles.css` — the single entry; imports tokens and fonts.
- `tokens/tokens.css` — every token, generated from the brand kit.
- `components/Colors/Palette/Palette.html` — the palette with usage per swatch.
- `components/Type/Typography/Typography.html` — the type scale and Bengali specimen.
- `components/Brand/Logo/Logo.html` — logo lockup and clear space.

Read the card HTML before styling. It shows the intended treatment, not a summary.

## One idiomatic snippet

```html
<link rel="stylesheet" href="styles.css">

<section style="background: var(--lb-color-charcoal); padding: 4rem 1.5rem;">
  <h1 style="font-family: var(--lb-font-display); font-weight: 700;
             text-transform: uppercase; line-height: 1.04;
             letter-spacing: -0.025em; color: var(--lb-color-warm-white);
             font-size: clamp(30px, 5.4vw, 78px); text-wrap: balance; margin: 0;">
    It starts in Bangladesh.<br>
    <span style="color: var(--lb-color-brand-green);">It doesn't end there.</span>
  </h1>
  <p style="font-family: var(--lb-font-body); font-size: 15.5px; line-height: 1.68;
            color: var(--lb-color-soft-gray); max-width: 65ch; text-wrap: pretty;">
    Honest guidance for Bangladeshi students choosing Malaysia.
  </p>
</section>
```

## Never claim

This is a student accelerator and community, **not a consultancy**. Never state
or imply guaranteed visas, admissions, fees, timelines, acceptance rates, or
partnerships. Cost and requirement figures must come from verified data, never
from invention.

---

# Last Bench — Design System (brand foundations)

Generated from `lets-colab/The-Last-Bench`. Source of truth is
`design-system/tokens.json`, which mirrors the official brand kit.

## Contents

| Card | Group | Verified |
|---|---|---|
| `components/Colors/Palette/Palette.html` | Colors | rendered clean |
| `components/Brand/Logo/Logo.html` | Brand | rendered clean, logo asset loads |
| `components/Type/Typography/Typography.html` | Type | renders; **webfonts unverified** (see below) |

Plus `styles.css` (the single entry point) and `tokens/tokens.css`.

## Known limitation: webfont verification

The brand webfonts load from Fontshare (General Sans) and Google Fonts
(Sora, Hind Siliguri) — the exact sources the shipping Last Bench designs use.
Those hosts were unreachable from the network where this bundle was built, so
the typography card was verified to render and to resolve its tokens, but
**not** to display the real typefaces. Confirm in a browser with network access.

Self-hosting the woff2 files under `fonts/` and importing them from
`styles.css` would remove this dependency and is the preferred long-term fix;
the font binaries are not in the repo today.

## No components, by design

This repo is an Expo/React Native app, not a component library — there is no
compiled `dist/` to bundle, so no `_ds_bundle.js` ships and no component
renders from a `window.*` namespace. The foundations above are the real,
shippable part. See `.design-sync/NOTES.md` in the repo for the full rationale.
