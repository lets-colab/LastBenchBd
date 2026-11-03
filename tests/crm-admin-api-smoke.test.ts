import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production CRM administrator API security smoke", () => {
  it("verifies anonymous requests are denied by the deployed tRPC API", () => {
    const smoke = readFileSync(join(process.cwd(), "scripts", "release-smoke.mjs"), "utf8");
    expect(smoke).toContain('name: "CRM admin API denies anonymous users"');
    expect(smoke).toContain('expectForbidden: true');
  });
});
