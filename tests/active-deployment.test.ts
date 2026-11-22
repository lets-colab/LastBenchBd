import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveActivePagesDeployment, verificationMode } from "../scripts/resolve-pages-deployment.mjs";
const rollback = "84306e12a7bba8b1c439bf61e43732683b8f163e";
describe("active Pages deployment and rollback monitoring", () => {
  it("resolves the active environment receipt, including an older workflow rerun", async () => {
    const api = async (endpoint: string) => {
      if (endpoint.endsWith("/statuses")) return endpoint.includes("/30/") ? [{ state: "failure" }] : endpoint.includes("/20/") ? [{ state: "success", log_url: "https://github.com/lets-colab/LastBenchBd/actions/runs/44735383811/job/1" }] : [{ state: "inactive" }];
      return [{ id: 30, sha: "c".repeat(40) }, { id: 20, sha: rollback }, { id: 10, sha: "b".repeat(40) }];
    };
    expect(await resolveActivePagesDeployment("lets-colab/LastBenchBd", api)).toMatchObject({ sourceSha: rollback, deploymentId: 20, runId: "44735383811", verificationMode: "legacy-known" });
  });
  it("does not guess a revision when no active successful deployment exists", async () => {
    await expect(resolveActivePagesDeployment("lets-colab/LastBenchBd", async () => [])).rejects.toThrow(/active/i);
    expect(verificationMode(rollback)).toBe("legacy-known");
    expect(verificationMode("a".repeat(40))).toBe("manifest");
  });
  it("keeps source and integrity failures on the existing incident-reporting path", () => {
    const workflow = readFileSync(resolve(process.cwd(), ".github/workflows/production-smoke.yml"), "utf8");
    const reporter = workflow.slice(workflow.indexOf("- name: Report production smoke state"));
    expect(reporter).toContain("if: always()");
    expect(reporter).toContain("steps.integrity.outcome");
    expect(reporter).toContain("steps.target.outcome");
    expect(workflow).toContain("ref: ${{ steps.target.outputs.source_sha }}");
  });
});
