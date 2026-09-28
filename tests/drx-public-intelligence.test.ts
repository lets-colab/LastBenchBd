import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Dr. X public intelligence identity", () => {
  it("retires Bench AI as a visible assistant identity while preserving the legacy filename", () => {
    const script = read("landing/bench-ai.js");
    expect(script).toContain("The visible intelligence identity is Dr. X");
    expect(script).toContain(">DR. X<");
    expect(script).toContain("Chat with Dr. X");
    expect(script).toContain("window.LB_DRX_OPEN");
    expect(script).not.toContain(">BENCH AI<");
    expect(script).not.toContain("Hi — I’m Bench AI");
    expect(script).not.toContain("Chat with Bench AI");
  });

  it("keeps the founders human-first and binds approved founder portraits", () => {
    const landing = read("landing/index.html");
    expect(landing).toContain("Sayem Ahmed");
    expect(landing).toContain("Fahim Shahbaz Mahmud");
    expect(landing).toContain("Erfan Uddin");
    expect(landing).toContain("Powered by Dr. X");
    expect(landing).toContain("Also known as Dr. X");
    expect(landing).toContain('src="{{ f.photoSrc }}"');
    expect(landing).toContain('src="{{ founderPhotoSrc }}"');
    expect(landing).not.toContain("Sayem AI");
    expect(landing).not.toContain("Fahim AI");
    expect(landing).not.toContain("Erfan AI");
  });

  it("publishes only bounded public founder profile data and no guessed LinkedIn identities", () => {
    const profiles = read("landing/founder-profile-data.js");
    expect(profiles).toContain("No private Founder DR.X / Second Brain context is shipped to the browser");
    expect((profiles.match(/data:image\/jpeg;base64/g) || []).length).toBe(3);
    expect(profiles).toContain("fahim-shahbaz-mahmud-765255124");
    expect((profiles.match(/linkedin\.com/g) || []).length).toBe(1);
    expect(profiles).toContain("Also known as Dr. X");
  });

  it("locks generated founder replies as Dr. X output rather than direct human statements", () => {
    const script = read("landing/bench-ai.js");
    const design = read("design.md");
    const product = read("PRODUCT.md");
    expect(script).toContain("are not direct statements from the founder unless explicitly verified");
    expect(design).toContain("generated interactive-profile replies are **not direct statements from the founder**");
    expect(product).toContain("Generated profile replies must disclose that they are powered by Dr. X");
  });

  it("preserves the public/private project boundary", () => {
    const script = read("landing/bench-ai.js");
    const product = read("PRODUCT.md");
    expect(script).toContain("public_only: true");
    expect(script).toContain("project: 'lastbench'");
    expect(product).toContain("must never expose Erfan's private/global Founder DR.X memory");
  });
});
