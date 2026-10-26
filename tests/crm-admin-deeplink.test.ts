import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CRM admin deep-link release contract", () => {
  it("materializes the exact /app/admin/automations entry route for GitHub Pages", () => {
    const redirects = readFileSync(new URL("../landing/_redirects", import.meta.url), "utf8");
    expect(redirects).toMatch(/^\/app\/admin\/automations\s+\/app\/index\.html\s+200\s*$/m);
  });
});
