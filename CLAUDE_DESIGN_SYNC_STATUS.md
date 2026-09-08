# Claude Design sync status

The verified 2026-09-08 Claude Design export is stored under `design-source/claude-design/2026-09-08/`.

A production-safe review route is generated at `landing/claude-design-preview.html`.

The live root `landing/index.html` is intentionally not overwritten by the import. The user-exported Claude project contains older/non-production behavior in places, while the current root contains newer production hardening such as real Netlify form handling, contact consent, accessibility improvements, and advisor integrations.

Promotion rule: visually review the preview against the approved Claude Design project, then port or promote approved sections without deleting newer production protections.
