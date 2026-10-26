import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CRM admin deep-link release contract", () => {
  it("materializes the exact /app/admin/automations entry route for GitHub Pages", () => {
    const redirects = readFileSync(join(process.cwd(), "landing", "_redirects"), "utf8");
    expect(redirects).toMatch(/^\/app\/admin\/automations\s+\/app\/index\.html\s+200\s*$/m);
  });
});
