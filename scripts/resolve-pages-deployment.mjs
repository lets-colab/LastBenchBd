import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const legacySha = "84306e12a7bba8b1c439bf61e43732683b8f163e";
export function verificationMode(sourceSha) {
  if (!/^[a-f0-9]{40}$/.test(sourceSha ?? "")) throw new Error("Invalid deployed source revision");
  return sourceSha === legacySha ? "legacy-known" : "manifest";
}
function githubApi(endpoint) {
  const response = spawnSync("gh", ["api", "--method", "GET", endpoint], { encoding: "utf8", timeout: 10000, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, CI: "1" } });
  if (response.error || response.status !== 0) throw new Error(`Cannot read deployment receipt: ${response.error?.message || response.stderr}`);
  return JSON.parse(response.stdout);
}
export async function resolveActivePagesDeployment(repository, api = githubApi) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? "")) throw new Error("Expected owner/repository");
  const deadline = Date.now() + 90000;
  const prefix = `repos/${repository}/deployments`;
  const deployments = await api(`${prefix}?environment=github-pages&per_page=10`);
  if (!Array.isArray(deployments)) throw new Error("Invalid deployment receipt list");
  for (const deployment of deployments.slice(0, 10)) {
    if (Date.now() >= deadline) throw new Error("Active deployment resolution timed out");
    if (!Number.isSafeInteger(deployment.id)) throw new Error("Invalid deployment identifier");
    const statuses = await api(`${prefix}/${deployment.id}/statuses`);
    if (!Array.isArray(statuses) || statuses[0]?.state !== "success") continue;
    let runId = null;
    try {
      const log = new URL(statuses[0].log_url);
      const base = `/${repository}/actions/runs/`;
      if (log.origin === "https://github.com" && log.pathname.startsWith(base)) {
        const value = log.pathname.slice(base.length).split("/")[0];
        if (/^\d+$/.test(value)) runId = value;
      }
    } catch { /* A missing log URL does not justify guessing the active SHA. */ }
    return { sourceSha: deployment.sha, deploymentId: deployment.id, runId, verificationMode: verificationMode(deployment.sha) };
  }
  throw new Error("No active successful github-pages deployment found in the bounded receipt window");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf("--repo");
  if (i < 0 || !process.argv[i + 1]) throw new Error("Usage: node scripts/resolve-pages-deployment.mjs --repo OWNER/REPO [--github-output]");
  const result = await resolveActivePagesDeployment(process.argv[i + 1]);
  if (process.argv.includes("--github-output")) console.log(`source_sha=${result.sourceSha}\nrun_id=${result.runId || ""}\ndeployment_id=${result.deploymentId}\nverification_mode=${result.verificationMode}`);
  else console.log(JSON.stringify(result, null, 2));
}
