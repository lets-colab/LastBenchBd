# co.lab GitHub Pages public release mirror

- Public route: `https://lastbenchbd.com/co-lab/`
- **Canonical upstream source:** private `lets-colab/letscolab`, commit `89a6f801ca93ecdec467124d17bd6fb03193da33`
- Build: `npm ci` and `vite build --base=/co-lab/`. Android-only Babel Vite React transform was used instead of unavailable SWC native binding; this substitution was not committed to upstream.
- **Official asset:** `brand/logo-black-trim.png` is byte-identical to `assets/logo-black-trim-BpRXKfAO.png`; SHA-256 `5db60a3d919b6d5a72ef18f8df20ff45159764ae3e2a9be97461c867925770af`. Upstream brand-lock validation passed.
- Intent: replace 27 October 2026 broken legacy Lovable URL (HTTP 404, `project_not_found`) with the verified-source co.lab public gallery on the already canonical LastBench GitHub Pages host.
- This is a compiled artifact mirror, not a new project or a competing source code fork. Upstream co.lab remains authoritative for all branding and content changes.
- Publishing is gated on the Last Bench CI/JEV/brand checks and separate live browser verification.
- Deep link `/co-lab/creators/` has a static HTML fallback; other client-side routes require explicit fallbacks if introduced.
