# The Skin Needs Co. — Last Bench domain deployment mirror

> **NON-CANONICAL DEPLOYMENT ARTIFACT.** The authoritative source lives under co.lab → ProjectX, in [`lets-colab/letscolab/projectx/clients/skin-needs/index.html`](https://github.com/lets-colab/letscolab/blob/feat/projectx-skin-needs-canonical/projectx/clients/skin-needs/index.html). Review the [Co.lab canonical source PR #11](https://github.com/lets-colab/letscolab/pull/11) before editing this artifact.

## Hosting and publication

- **Domain owner/host:** existing Last Bench deployment, target URL `https://lastbenchbd.com/showcase/skin-needs/`. Not yet released on that production route.
- **Verified review preview:** https://deploy-preview-130--lastbenchbdd.netlify.app/showcase/skin-needs/
- **Git identity proof:** both Co.lab canonical source and this mirror have the identical content Git blob SHA `fd37a233df4394c41d69a2e78b1791688989db9e`.
- **Release method:** change canonical Co.lab file first; perform reviewed copy into this mirror; compare actual Git blob hashes; only then deploy. Automated cross-repository sync is **not configured**.
- **Repo boundary:** No Last Bench homepage, private student app, payments, organization identity, or custom domain settings may be changed as a side effect of this client concept.

## Truth and access controls

- **Independent, non-transactional demonstration, not an official merchant store.** No merchant authorization confirmed.
- **Brand:** existing printed card photograph supplies white water-drop and wordmark extraction, NOT a merchant-approved clean master/logo license; cyan/white palette is sampled.
- **Product accuracy:** 138 observed candidate families and lines, **0 merchant-verified saleable SKUs**, and no verified inventory quantities, prices, ingredients, expiry or authenticity.
- **Commerce:** checkout/payment/order collection/courier/CRM/POS are not built. Do not suggest otherwise.
- **Graphics:** three scroll-controlled WebGL motion chapters, CSS fallback, reduced motion; representative physical hardware WebGL still needs inspection.
- **Privacy:** noindex/nofollow and no customer capture. Respect merchant branding rights and consent.

## Required gates before main-domain production release

1. Merchant provides written approval for use of identity, scope, clean logo and colors.
2. Independently verify motion on actual low-power mobile, desktop, keyboard/screen reader and reduced-motion environments.
3. Use an actual owner-approved SKU, prices and stock ledger before transactional commerce.
4. Resolve all relevant failed builds with actual evidence and verify main-domain route plus existing Last Bench functionality.
5. Compare canonical Co.lab source and mirrored Last Bench artifact SHA **at release time**.
6. Run JeX/JEVGate checks, record actual evidence, and obtain founder approval for publication.

Any claim that Steve Jobs personally verified the site would be false; a Steve Jobs-inspired product-direction review is an optional quality lens.

## Smoke and regression test

`node --test scripts/skin-needs-preview.test.mjs` in this repo checks the hosting artifact's nontransactional, identity, 3D fallback and catalog invariants. Co.lab maintains the canonical source/test under `projectx/clients/skin-needs/`.

**This is a draft PR, not a production approved release.**
