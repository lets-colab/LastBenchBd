import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Cloudflare API candidate pre-cutover safety gate", () => {
  it("runs the read-only Node parity regression tests as part of project CI", () => {
    const run = spawnSync(process.execPath, ["--test", "scripts/probe-api-parity-checks.mjs"], {
      cwd: root,
      encoding: "utf8",
      timeout: 15_000,
      env: { PATH: process.env.PATH || "" },
    });

    expect(run.error?.message).toBeUndefined();
    expect(run.status, [run.stdout, run.stderr].join("\n")).toBe(0);
    expect(run.stdout).toMatch(/# tests 9/);
    expect(run.stdout).toMatch(/# fail 0/);
  });
});
