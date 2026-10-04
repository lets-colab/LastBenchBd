import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ui = readFileSync(resolve(root, "landing/class-a/masterclass-cinematic.js"), "utf8");
const sql = readFileSync(resolve(root, "supabase/sql/class-a-duplicate-resolution-proof.sql"), "utf8");
const normalizedSql = sql.replace(/\\s+/g, " ").toLowerCase();

describe("CLASS duplicate registration proof gate", () => {
  it("binds duplicate resolution to the one-time proof returned by the gated signup RPC", () => {
    expect(ui).toContain("const duplicateProof = result.unlock_token");
    expect(ui).toContain("'missed_previous:' + duplicateProof");
    expect(ui).toContain("Duplicate-resolution proof was not issued");
  });

  it("stores only a hash, expires the proof, and consumes it once", () => {
    expect(sql).toContain("private.class_a_duplicate_resolution_tokens");
    expect(sql).toContain("token_hash text not null");
    expect(sql).toContain("expires_at timestamptz not null");
    expect(sql).toContain("used_at timestamptz");
    expect(normalizedSql).toContain("now()+interval '10 minutes'");
    expect(normalizedSql).toContain("and t.used_at is null");
    expect(normalizedSql).toContain("set used_at=now()");
  });

  it("fails closed when the proof is absent, wrong, expired, or replayed", () => {
    expect(sql.match(/duplicate_proof_invalid/g)?.length).toBeGreaterThanOrEqual(3);
    expect(normalizedSql).toContain("t.token_hash=encode(extensions.digest(v_duplicate_proof,'sha256'),'hex')");
    expect(normalizedSql).toContain("t.expires_at>now()");
    expect(normalizedSql).toContain("for update");
  });

  it("preserves the public RPC names and separates duplicate proof from pass unlock proof", () => {
    expect(normalizedSql).toContain("function public.class_a_register_online_gated");
    expect(normalizedSql).toContain("function public.class_a_resolve_duplicate_registration");
    expect(normalizedSql).toContain("'dup-'");
    expect(normalizedSql).toContain("'unlock-'");
  });
});
