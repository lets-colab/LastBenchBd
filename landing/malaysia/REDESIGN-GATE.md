# Malaysia redesign — release gate
Base: 114cf3d2d99f11b34fde558431d95512c4b2826f. Scope: landing/malaysia only. This is a staged revision, not award certification or deployment.

Preserve original Three.js geography/camera timing, audio opt-in, language control, campus travel, official links, estimates disclaimer, signup validation and transport, founder profiles, dashboard and corporate home. New design prioritizes the student path, editorial hero, white trust surfaces and visible bilingual labels. Original logo is reused.

Run `node landing/malaysia/experience-contract.cjs`. Before merge: desktop and 360/390/768 px screenshots; check navigation, both languages, keyboard/focus, campus overlay and exit, optional sound, reduced-motion, WebGL disabled, and form validation (mock submission; never create real leads during testing). Check axe serious/critical = 0, LCP <= 2.5s, CLS <= 0.1, no console errors and verify route in production after separately authorized deploy. Compare all existing functions to base. No award or 10.5/10 claim until independent review and evidence.

A standalone Blender source study (`blender_bench.py`) authors an original blue-hour bench with architectural depth, material studies and an offline camera. It is not an accurate KL landmark model and is not wired into the live page. Blender source and rendered media are a separate gate: no Blender executable was detected on inspected host paths; no rendered Blender asset is claimed or loaded. Existing browser scene remains available. No paid tool authorized.
