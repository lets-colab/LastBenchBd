import { createHash } from "node:crypto";
import path from "node:path";

export const ENGINE_SHA256 = "bf0524d3b44a199953d70ba10548ba48c5ab50d6ad260eeaa84ed8945c10a721";
export function findingFingerprint(finding, root) {
  if (!finding || ["file", "antipattern", "snippet", "severity"].some((key) => typeof finding[key] !== "string")) throw new Error("Malformed audit report finding");
  const file = path.relative(root, path.resolve(root, finding.file));
  if (file.startsWith("..") || !file.startsWith("landing/")) throw new Error("Audit report target is outside landing");
  return createHash("sha256").update(JSON.stringify([file, finding.antipattern, finding.snippet, finding.severity])).digest("hex");
}

export function validateAuditRun(run, triage, root) {
  if (run.cliVersion !== "4.9.2" || run.engineVersion !== "0.1.28+engine" || run.engineSha256 !== ENGINE_SHA256) throw new Error("Pinned audit version or checksum mismatch");
  if (![0, 2].includes(run.exitCode)) throw new Error("Design audit execution failed");
  if (!Array.isArray(run.findings)) throw new Error("Malformed or absent audit report");
  const hasPrimary = run.findings.some((finding) => finding.severity !== "advisory");
  if ((run.exitCode === 2) !== hasPrimary) throw new Error("Audit exit status contradicts primary findings");
  const countsByPriority = { P0: 0, P1: 0, P2: 0, P3: 0 };
  const occurrences = new Map();
  const results = run.findings.map((finding) => {
    const id = findingFingerprint(finding, root);
    const disposition = triage[id];
    if (!disposition || !Object.hasOwn(countsByPriority, disposition.priority) || typeof disposition.reason !== "string" || !disposition.reason.trim()) throw new Error(`Untriaged audit finding: ${id}`);
    const count = (occurrences.get(id) || 0) + 1;
    occurrences.set(id, count);
    if (!Number.isSafeInteger(disposition.maxOccurrences) || disposition.maxOccurrences < count) throw new Error(`Unreviewed audit occurrence growth: ${id}`);
    countsByPriority[disposition.priority]++;
    return { id, file: path.relative(root, path.resolve(root, finding.file)), rule: finding.antipattern, ...disposition };
  });
  if (countsByPriority.P0 || countsByPriority.P1) throw new Error("Unresolved P0/P1 design findings block this release");
  return { countsByPriority, findings: results };
}
