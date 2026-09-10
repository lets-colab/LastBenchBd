import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

const homepage = read("landing/index.html");
const preview = read("landing/claude-design-preview.html");
const importer = read("scripts/import-claude-design-export.py");
const promotion = read("scripts/promote-claude-design-homepage.py");
const migration = read("drizzle/0005_lastbench_signups.sql");
const redirects = read("landing/_redirects");

describe("Last Bench homepage signup", () => {
  it("submits the production and preview experiences directly to Supabase", () => {
    for (const page of [homepage, preview]) {
      expect(page).toContain("/rest/v1/lastbench_signups");
      expect(page).toContain("sb_publishable_");
      expect(page).toContain("Prefer: 'return=minimal'");
      expect(page).toContain("contact_consent: true");
      expect(page).toContain("signupConsent");
      expect(page).not.toContain("application/x-www-form-urlencoded");
      expect(page).not.toContain('name="form-name" value="signup"');
    }
  });

  it("keeps future design imports and promotions on the Supabase intake path", () => {
    for (const script of [importer, promotion]) {
      expect(script).toContain("/rest/v1/lastbench_signups");
      expect(script).not.toContain("Netlify form detector");
    }
  });

  it("allows anonymous inserts without exposing submitted leads", () => {
    expect(migration).toContain(
      'ALTER TABLE "lastbench_signups" ENABLE ROW LEVEL SECURITY',
    );
    expect(migration).toContain(
      'GRANT INSERT ON TABLE "lastbench_signups" TO anon, authenticated',
    );
    expect(migration).toContain("FOR INSERT\nTO anon, authenticated");
    expect(migration).not.toMatch(
      /GRANT (?:SELECT|UPDATE|DELETE|ALL).*lastbench_signups/i,
    );
    expect(migration).not.toMatch(/FOR (?:SELECT|UPDATE|DELETE|ALL)/i);
  });

  it("keeps Cloudflare SPA rewrites away from fingerprinted application assets", () => {
    expect(redirects).toContain("/app/auth /app/index.html 200");
    expect(redirects).toContain("/app/admin/* /app/index.html 200");
    expect(redirects).toContain("/app/cohort/* /app/index.html 200");
    expect(redirects).not.toMatch(/^\/app\/\*\s/m);
  });
});
