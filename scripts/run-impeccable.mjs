import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { ENGINE_SHA256, validateAuditRun } from "./impeccable-gate.mjs";

const index = process.argv.indexOf("--output-dir");
if (index < 0 || !process.argv[index + 1]) throw new Error("Usage: node scripts/run-impeccable.mjs --output-dir PATH");
if (process.platform !== "linux" || process.arch !== "x64") throw new Error("This pinned audit receipt supports Linux x64 only; verify a platform-specific checksum before using another platform");
const output = resolve(process.argv[index + 1]);
mkdirSync(output, { recursive: true });
const binary = process.env.IMPECCABLE_BIN || join(output, "impeccable-engine-0.1.28");
const env = { ...process.env, CI: "1", IMPECCABLE_BIN: binary };
function execute(command, args, timeout = 120000) {
  const result = spawnSync(command, args, { env, encoding: "utf8", timeout, maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.signal) throw new Error(`Bounded audit command failed: ${command}: ${result.error?.message || result.signal}`);
  return result;
}
if (!process.env.IMPECCABLE_BIN) {
  const download = execute("curl", ["--fail", "--location", "--silent", "--show-error", "--connect-timeout", "10", "--max-time", "60", "--retry", "0", "--output", binary, "https://github.com/pbakaus/impeccable/releases/download/engine-v0.1.28/impeccable-linux-x64"], 65000);
  if (download.status !== 0) throw new Error(`Engine download failed: ${download.stderr}`);
}
const engineSha256 = createHash("sha256").update(readFileSync(binary)).digest("hex");
if (engineSha256 !== ENGINE_SHA256) throw new Error("Official engine checksum mismatch");
chmodSync(binary, 0o755);
const cli = execute("npx", ["--yes", "impeccable@4.9.2", "--version"]);
const engine = execute(binary, ["--version"]);
if (cli.status !== 0 || engine.status !== 0) throw new Error("Cannot verify audit versions");
const audit = execute("npx", ["--yes", "impeccable@4.9.2", "detect", "--json", "landing"]);
writeFileSync(join(output, "findings.json"), audit.stdout);
writeFileSync(join(output, "diagnostics.log"), audit.stderr);
const run = { cliVersion: cli.stdout.trim(), engineVersion: engine.stdout.trim(), engineSha256, exitCode: audit.status, findings: JSON.parse(audit.stdout) };
const receipt = { ...run, findings: undefined };
writeFileSync(join(output, "versions.json"), JSON.stringify(receipt, null, 2) + "\n");
const triage = JSON.parse(readFileSync("scripts/impeccable-triage.json", "utf8"));
const summary = validateAuditRun(run, triage.findings, process.cwd());
writeFileSync(join(output, "summary.json"), JSON.stringify({ ...receipt, ...summary }, null, 2) + "\n");
console.log(JSON.stringify({ ...receipt, ...summary, findings: summary.findings.length }));
