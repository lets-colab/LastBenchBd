import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("production smoke release contract", () => {
  it("keeps the corporate landing fingerprint aligned with the canonical gateway", () => {
    const landing = read("landing/index.html");
    const contract = JSON.parse(read("scripts/release-contract.json")) as {
      corporateLandingFingerprint?: unknown;
    };
    expect(Array.isArray(contract.corporateLandingFingerprint)).toBe(true);
    const fingerprint = contract.corporateLandingFingerprint as string[];
    expect(fingerprint.length).toBeGreaterThan(5);
    for (const needle of fingerprint) {
      expect(typeof needle).toBe("string");
      expect(needle.length).toBeGreaterThan(0);
      expect(landing, `Missing production fingerprint token: ${needle}`).toContain(needle);
    }
  });
});
