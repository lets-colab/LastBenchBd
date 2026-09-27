# Last Bench Brand Registry

This directory is the fastest human/agent entry point for approved brand identity.

## Namespaces

- **Last Bench parent brand** — `brand/last-bench/`
- **CLASS[Λ] capability brand** — `brand/class-a/`
- **co.lab** — maintained in its own canonical repository: `lets-colab/letscolab`

## Rule

Never reconstruct a logo from memory, text, screenshots, SVG tracing, or generative AI.

Use the exact files in these folders. Their Git blob fingerprints are recorded in each namespace's `brand-lock.json`.

The parent Last Bench identity is additionally enforced by:

- `design-system/brand-lock.json`
- `scripts/validate-brand-lock.mjs`
- `skills/last-bench-brand-source-lock/SKILL.md`
- GitHub Actions Brand Lock gate

If a required asset is missing or uncertain, stop and verify the repository source rather than inventing a replacement.
