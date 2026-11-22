import { describe, expect, it } from "vitest";
import { findingFingerprint, validateAuditRun } from "../scripts/impeccable-gate.mjs";

const engineSha256 = "bf0524d3b44a199953d70ba10548ba48c5ab50d6ad260eeaa84ed8945c10a721";
const run = { cliVersion: "4.9.2", engineVersion: "0.1.28+engine", engineSha256, exitCode: 2, findings: [{ file: "/repo/landing/index.html", antipattern: "low-contrast", snippet: "3:1", severity: "warning" }] };
describe("pinned non-interactive design audit gate", () => {
  it("fails untriaged findings rather than treating exit 2 as a pass", () => {
    expect(() => validateAuditRun(run, {}, "/repo")).toThrow(/untriaged/i);
  });
  it("fails malformed reports, execution failures and the wrong engine", () => {
    expect(() => validateAuditRun({ ...run, findings: null }, {}, "/repo")).toThrow(/report/i);
    expect(() => validateAuditRun({ ...run, exitCode: 1 }, {}, "/repo")).toThrow(/execution/i);
    expect(() => validateAuditRun({ ...run, engineVersion: "0.1.25+engine" }, {}, "/repo")).toThrow(/version/i);
  });
  it("blocks reviewed P0/P1 findings and reports explicitly deferred P2/P3 findings", () => {
    const key = findingFingerprint(run.findings[0], "/repo");
    expect(() => validateAuditRun(run, { [key]: { priority: "P1", reason: "Unreadable primary action", maxOccurrences: 1 } }, "/repo")).toThrow(/P0|P1/);
    expect(validateAuditRun(run, { [key]: { priority: "P2", reason: "Static gradient-model finding; rendered contrast verified separately", maxOccurrences: 1 } }, "/repo").countsByPriority).toEqual({ P0: 0, P1: 0, P2: 1, P3: 0 });
  });
  it("rejects growth in an approved fingerprint while allowing decreases", () => {
    const key = findingFingerprint(run.findings[0], "/repo");
    const triage = { [key]: { priority: "P2", reason: "Reviewed single occurrence", maxOccurrences: 1 } };
    expect(() => validateAuditRun({ ...run, findings: [...run.findings, ...run.findings] }, triage, "/repo")).toThrow(/occurrence/i);
    expect(validateAuditRun({ ...run, exitCode: 0, findings: [] }, triage, "/repo").countsByPriority.P2).toBe(0);
  });
  it("enforces primary-finding exit status without rejecting advisory-only success", () => {
    expect(() => validateAuditRun({ ...run, findings: [] }, {}, "/repo")).toThrow(/exit/i);
    expect(() => validateAuditRun({ ...run, exitCode: 0 }, {}, "/repo")).toThrow(/exit/i);
    const advisory = { ...run.findings[0], severity: "advisory" };
    const key = findingFingerprint(advisory, "/repo");
    expect(validateAuditRun({ ...run, exitCode: 0, findings: [advisory] }, { [key]: { priority: "P3", reason: "Reviewed advisory", maxOccurrences: 1 } }, "/repo").countsByPriority.P3).toBe(1);
  });
});
