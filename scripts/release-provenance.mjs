import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const metadata = new Set(["release.json", "release-manifest.json"]);
export function isPublicSiteAsset(name) {
  return !/(?:^|\/)\.env(?:$|\.)|\.(?:md|zip|log|pem|key)$/i.test(name);
}
function files(root, prefix = "") {
  return readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap((entry) => {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Release contains a symlink: ${name}`);
    return entry.isDirectory() ? files(root, name) : metadata.has(name) ? [] : [name];
  }).sort();
}
const publicInventoryPath = (name) => !name.startsWith("showcase/");
function inventory(root, names) {
  return Object.fromEntries(names.map((name) => [name, hash(readFileSync(path.join(root, name)))]));
}
const serialize = (value) => JSON.stringify(value, null, 2) + "\n";

/** @param {string} root @param {{sourceSha: string, workflowRunUrl?: string | null, fullInventoryPath?: string}} options */
export function stampRelease(root, { sourceSha, workflowRunUrl = null, fullInventoryPath }) {
  if (!/^[a-f0-9]{40}$/.test(sourceSha ?? "")) throw new Error("Release revision must be a full commit SHA");
  if (fullInventoryPath && (path.resolve(fullInventoryPath) === path.resolve(root) || path.resolve(fullInventoryPath).startsWith(path.resolve(root) + path.sep))) throw new Error("Private inventory must stay outside the public output");
  for (const name of files(root)) {
    const target = path.join(root, name);
    if (name.endsWith(".html")) {
      let html = readFileSync(target, "utf8");
      html = html.replace(/<meta\s+name=["']lastbench-release["'][^>]*>\s*/gi, "");
      if (!/<\/head>/i.test(html)) throw new Error(`HTML entry has no head: ${name}`);
      html = html.replace(/<\/head>/i, `<meta name="lastbench-release" content="${sourceSha}"></head>`);
      writeFileSync(target, html);
    }
  }
  const all = inventory(root, files(root));
  const fullBytes = serialize(all);
  if (fullInventoryPath) writeFileSync(fullInventoryPath, fullBytes);
  const bytes = serialize(Object.fromEntries(Object.entries(all).filter(([name]) => publicInventoryPath(name))));
  writeFileSync(path.join(root, "release-manifest.json"), bytes);
  const release = { schemaVersion: 1, sourceSha, workflowRunUrl, manifestSha256: hash(bytes), artifactInventorySha256: hash(fullBytes) };
  writeFileSync(path.join(root, "release.json"), JSON.stringify(release, null, 2) + "\n");
  return release;
}

export function verifyRelease(root, expectedSha) {
  const release = JSON.parse(readFileSync(path.join(root, "release.json"), "utf8"));
  if (release.sourceSha !== expectedSha) throw new Error("Release revision mismatch");
  const bytes = readFileSync(path.join(root, "release-manifest.json"));
  if (hash(bytes) !== release.manifestSha256) throw new Error("Release manifest checksum mismatch");
  const manifest = JSON.parse(bytes.toString("utf8"));
  const allFiles = files(root);
  const currentFiles = allFiles.filter(publicInventoryPath);
  if (JSON.stringify(currentFiles) !== JSON.stringify(Object.keys(manifest).sort())) throw new Error("Release file inventory mismatch");
  for (const name of currentFiles) {
    if (hash(readFileSync(path.join(root, name))) !== manifest[name]) throw new Error(`Release asset checksum mismatch: ${name}`);
  }
  if (hash(serialize(inventory(root, allFiles))) !== release.artifactInventorySha256) throw new Error("Full artifact inventory checksum mismatch");
  return release;
}
