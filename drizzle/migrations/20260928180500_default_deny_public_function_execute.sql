-- 2026-09-28 — fail-closed default privileges for future public functions.
--
-- Existing browser-callable CLASS[Λ] RPCs retain their explicit grants.
-- This only changes the default for functions created in public by postgres after
-- this migration: callers receive no EXECUTE unless a later migration grants it.
--
-- Supabase guidance recommends revoking default function execution from PUBLIC,
-- anon and authenticated, then explicitly granting only the intended capability
-- endpoints.

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
