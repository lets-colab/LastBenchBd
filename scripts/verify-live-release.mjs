import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { pathToFileURL } from "node:url";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** @param {string} origin @param {string} expectedSha @param {{fetchImpl?: typeof fetch, expectedManifestSha256?: string}} options */
export async function verifyPublishedRelease(origin, expectedSha, { fetchImpl = fetch, expectedManifestSha256 } = {}) {
  if (!/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error("Expected full source revision");
  const base = new URL(origin);
  if (base.protocol !== "https:" && !(base.protocol === "http:" && ["127.0.0.1", "localhost"].includes(base.hostname))) throw new Error("Release verification requires HTTPS or loopback");
  const deadline = Date.now() + 120000;
  async function get(name) {
    if (Date.now() >= deadline) throw new Error("Release verification deadline exceeded");
    const url = new URL(name.split("/").map(encodeURIComponent).join("/"), base);
    url.searchParams.set("__release_check", expectedSha);
    const response = await fetchImpl(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Release request failed: ${name}: HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > 32 * 1024 * 1024) throw new Error(`Unexpected release asset size: ${name}`);
    return bytes;
  }
  const release = JSON.parse(Buffer.from(await get("release.json")).toString("utf8"));
  if (release.sourceSha !== expectedSha) throw new Error("Published revision mismatch");
  const bytes = await get("release-manifest.json");
  const digest = hash(bytes);
  if (digest !== release.manifestSha256 || (expectedManifestSha256 && digest !== expectedManifestSha256)) throw new Error("Published artifact manifest mismatch");
  const manifest = JSON.parse(Buffer.from(bytes).toString("utf8"));
  if (!manifest || Array.isArray(manifest) || typeof manifest !== "object" || !manifest["index.html"]) throw new Error("Invalid published manifest");
  const entries = Object.entries(manifest);
  for (const [name, checksum] of entries) {
    if (name.includes("\\") || name.split("/").some((part) => !part || part === "." || part === "..") || !/^[a-f0-9]{64}$/.test(checksum)) throw new Error("Unsafe published manifest entry");
  }
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (next < entries.length) {
      const [name, checksum] = entries[next++];
      const asset = await get(name);
      if (hash(asset) !== checksum) throw new Error(`Published asset mismatch: ${name}`);
      if (name.endsWith(".html") && !Buffer.from(asset).toString("utf8").includes(`<meta name="lastbench-release" content="${expectedSha}">`)) throw new Error(`HTML revision mismatch: ${name}`);
    }
  }));
  return { origin: base.origin, sourceSha: expectedSha, manifestSha256: digest, verifiedFiles: entries.length, workflowRunUrl: release.workflowRunUrl };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const value = (flag) => process.argv[process.argv.indexOf(flag) + 1];
  if (!process.argv.includes("--source-sha")) throw new Error("Usage: node scripts/verify-live-release.mjs --source-sha SHA [--origin URL] [--manifest-sha256 SHA256]");
  const result = await verifyPublishedRelease(process.argv.includes("--origin") ? value("--origin") : "https://lastbenchbd.com/", value("--source-sha"), { expectedManifestSha256: process.argv.includes("--manifest-sha256") ? value("--manifest-sha256") : undefined });
  console.log(JSON.stringify(result, null, 2));
}
