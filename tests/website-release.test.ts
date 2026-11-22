import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { isPublicSiteAsset, stampRelease, verifyRelease } from "../scripts/release-provenance.mjs";

const fixtures: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "lastbench-release-"));
  fixtures.push(root);
  mkdirSync(join(root, "app/auth"), { recursive: true });
  writeFileSync(join(root, "index.html"), "<!doctype html><html><head><title>Last Bench</title></head><body>Home</body></html>");
  writeFileSync(join(root, "app/auth/index.html"), "<html><head></head><body>Sign in</body></html>");
  writeFileSync(join(root, "site.css"), "body{color:#111}");
  return root;
}
afterEach(() => fixtures.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));
const sha = "84306e12a7bba8b1c439bf61e43732683b8f163e";

describe("immutable website release evidence", () => {
  it("keeps operator notes and source archives out of the public artifact", () => {
    expect(isPublicSiteAsset("class-a/AGENTS.md")).toBe(false);
    expect(isPublicSiteAsset("showcase/client/README.md")).toBe(false);
    expect(isPublicSiteAsset("source.zip")).toBe(false);
    expect(isPublicSiteAsset("assets/node_modules/.pnpm/font/font.ttf")).toBe(true);
    expect(isPublicSiteAsset("class-a/index.html")).toBe(true);
  });
  it("binds every HTML entry and hashed asset to the exact source revision", () => {
    const root = fixture();
    stampRelease(root, { sourceSha: sha, workflowRunUrl: "https://github.com/lets-colab/LastBenchBd/actions/runs/1" });
    expect(verifyRelease(root, sha).sourceSha).toBe(sha);
    for (const entry of ["index.html", "app/auth/index.html"]) {
      expect(readFileSync(join(root, entry), "utf8")).toContain(`<meta name="lastbench-release" content="${sha}">`);
    }
    expect(JSON.parse(readFileSync(join(root, "release-manifest.json"), "utf8"))).toHaveProperty("site.css");
  });
  it("rejects an altered asset instead of accepting a successful deployment receipt", () => {
    const root = fixture();
    stampRelease(root, { sourceSha: sha });
    writeFileSync(join(root, "site.css"), "body{display:none}");
    expect(() => verifyRelease(root, sha)).toThrow(/site.css/);
  });
  it("rejects a different revision and invalid source identifiers", () => {
    const root = fixture();
    expect(() => stampRelease(root, { sourceSha: "main" })).toThrow(/revision/i);
    stampRelease(root, { sourceSha: sha });
    expect(() => verifyRelease(root, "a".repeat(40))).toThrow(/revision/i);
  });
  it("keeps uncleared concept paths out of the public index but verifies the full private artifact", () => {
    const root = fixture();
    const privateRoot = fixture();
    mkdirSync(join(root, "showcase/skin-needs"), { recursive: true });
    writeFileSync(join(root, "showcase/skin-needs/index.html"), "<html><head></head><body>Private concept</body></html>");
    const fullInventoryPath = join(privateRoot, "inventory.json");
    stampRelease(root, { sourceSha: sha, fullInventoryPath });
    expect(readFileSync(join(root, "release-manifest.json"), "utf8")).not.toContain("skin-needs");
    expect(readFileSync(fullInventoryPath, "utf8")).toContain("showcase/skin-needs/index.html");
    expect(verifyRelease(root, sha).sourceSha).toBe(sha);
    writeFileSync(join(root, "showcase/skin-needs/index.html"), "altered");
    expect(() => verifyRelease(root, sha)).toThrow(/inventory/i);
  });
  it("rejects a private inventory destination inside the public output", () => {
    const root = fixture();
    expect(() => stampRelease(root, { sourceSha: sha, fullInventoryPath: join(root, "private.json") })).toThrow(/outside/i);
  });
});
