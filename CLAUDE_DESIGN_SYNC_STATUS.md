# Claude Design sync status

The verified 2026-09-08 Claude Design export is stored under `design-source/claude-design/2026-09-08/`.

The production-safe reference remains available at `landing/claude-design-preview.html`.

`landing/index.html` now promotes the verified Claude Design visual experience while retaining production protections: real form submission wiring, contact consent, `/app/` routing, accessibility safeguards, locked Last Bench brand assets, and the separately maintained Bench AI advisor layer.

Static-export hardening restores the Claude Design nested token path, packages an empty image-slot state file, and replaces the malformed inline film-grain data URI with a local SVG asset.

Final browser QA passed on desktop and mobile: HTTP 200, clean production console/network checks, CTA navigation, and Bench AI interaction.

Source priority remains: current explicit user instruction → locked brand assets and production safeguards → verified Claude Design visual export → older snapshots.
