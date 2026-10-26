import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CRM admin deep-link release contract", () => {
  it("materializes the exact /app/admin/automations entry route for GitHub Pages", () => {
    const redirects = readFileSync(join(process.cwd(), "landing", "_redirects"), "utf8");
    expect(redirects).toMatch(/^\/app\/admin\/automations\s+\/app\/index\.html\s+200\s*$/m);
  });
});

describe("CRM production smoke coverage", () => {
  it("requires the direct admin entry to be checked after deployment", () => {
    const smoke = readFileSync(join(process.cwd(), "scripts", "release-smoke.mjs"), "utf8");
    expect(smoke).toContain('name: "CRM automation console entry"');
  });
});
