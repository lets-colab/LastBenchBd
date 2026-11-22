import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { verifyPublishedRelease } from "../scripts/verify-live-release.mjs";

const sha = "a".repeat(40);
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
function origin(tampered = false) {
  const html = `<html><head><meta name="lastbench-release" content="${sha}"></head><body>Site</body></html>`;
  const manifest = JSON.stringify({ "index.html": hash(html), "site.css": hash("body{}") });
  const release = JSON.stringify({ sourceSha: sha, manifestSha256: hash(manifest) });
  const files: Record<string, string> = { "/release.json": release, "/release-manifest.json": manifest, "/index.html": html, "/site.css": tampered ? "stale" : "body{}" };
  const fetchImpl = async (input: string | URL | Request) => new Response(files[new URL(String(input)).pathname], { status: 200 });
  return { fetchImpl, digest: hash(manifest) };
}
describe("published revision and asset verification", () => {
  it("verifies the source and every file against the expected artifact manifest", async () => {
    const server = origin();
    expect(await verifyPublishedRelease("https://lastbenchbd.com", sha, { fetchImpl: server.fetchImpl, expectedManifestSha256: server.digest })).toMatchObject({ sourceSha: sha, verifiedFiles: 2 });
  });
  it("rejects stale assets, stale revisions and a different artifact manifest", async () => {
    const server = origin(true);
    await expect(verifyPublishedRelease("https://lastbenchbd.com", sha, { fetchImpl: server.fetchImpl })).rejects.toThrow(/site.css/);
    await expect(verifyPublishedRelease("https://lastbenchbd.com", "b".repeat(40), { fetchImpl: server.fetchImpl })).rejects.toThrow(/revision/i);
    await expect(verifyPublishedRelease("https://lastbenchbd.com", sha, { fetchImpl: server.fetchImpl, expectedManifestSha256: "0".repeat(64) })).rejects.toThrow(/manifest/i);
  });
});
