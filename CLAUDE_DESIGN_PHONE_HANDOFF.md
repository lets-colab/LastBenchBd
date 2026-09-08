# Claude Design — Phone-Only Handoff

Purpose: allow Claude Design to ingest the approved Last Bench + CLASS[Λ] design systems from a phone browser without requiring Claude Code or terminal access.

## Start here

Open Claude Design in a mobile browser and sign in with the Claude account that has Claude Design access.

Official product URL:
`https://claude.com/product/design`

Then choose the option to create/import a design system from a codebase or project source and connect/select this repository:

`lets-colab/LastBenchBd`

Claude Design should read this file first, then the sources listed below.

---

## Brand namespace 1 — Last Bench

Treat Last Bench as an isolated design system.

Canonical sources, in priority order:

1. `assets/branding/`
2. `design-system/README.md`
3. `design-system/tokens.json`
4. `design-system/logo.svg`
5. `PRODUCT.md`
6. Current approved production landing assets under `landing/`

Rules:

- Never redraw, reconstruct, recolor, or substitute the official Last Bench logo/marks.
- Do not inherit CLASS[Λ] cinematic styling into Last Bench by default.
- Preserve the official green / charcoal / warm-white system and its typography unless the user explicitly changes it.
- When code and design notes disagree, flag the conflict rather than silently merging them.

## Brand namespace 2 — CLASS[Λ]

Treat CLASS[Λ] as a separate design system even though it currently lives in the LastBenchBd repository.

Canonical sources, in priority order:

1. Latest explicit user instruction.
2. `skills/class-a-visual-source-lock/SKILL.md`
3. `landing/class-a/README.md`
4. `landing/class-a/AGENTS.md`
5. Current approved files under `landing/class-a/`

Core visual lock:

- near-black cinematic canvas
- large editorial white typography
- signature dimensional `20` object
- restrained orbital / spatial system
- controlled depth, reflections and parallax
- conversion-first CTA
- mobile-first composition
- never replace with a generic SaaS/card-grid aesthetic

Do not allow Last Bench marketing-page styling to overwrite CLASS[Λ]'s cinematic language.

---

## Import goal

Create two maintained Claude Design systems/projects:

- `Last Bench — Canonical`
- `CLASS[Λ] — Cinematic Canonical`

For each system, preserve provenance to the repository paths above.

When Claude Design provides a handoff/export, write or export the result back to the shared mirror convention used by Erfan Second Brain:

- Last Bench snapshot: `integrations/claude-design/snapshots/lastbench-current/`
- CLASS[Λ] snapshot: `integrations/claude-design/snapshots/class-a-current/`

The authoritative cross-agent registry lives in:
`lets-colab/erfan-second-brain/integrations/claude-design/BRAND_REGISTRY.yaml`

## Safety / integrity rules

- Never include OAuth tokens, cookies, access tokens, API keys, or private auth links in exported files.
- Preserve exact design tokens when available.
- Label interpretations as interpretations.
- Do not claim a live Claude Design sync unless the exported snapshot records authenticated Claude Design provenance.
- Keep the Last Bench and CLASS[Λ] namespaces isolated.

## Phone-only outcome

A successful phone-only setup means:

1. Claude Design is opened in the mobile browser.
2. `lets-colab/LastBenchBd` is selected/connected as the source codebase.
3. The two brand systems above are imported separately.
4. Claude Design recognizes the canonical source paths and asset-lock rules.
5. Future design work can be exported/handoff back through GitHub for ChatGPT, Codex, Figma and other approved agents.
