import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(root, file));

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

  it("keeps the public founders human-first and binds approved founder portraits", () => {
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

  it("uses repository founder assets and publishes only verified external profile URLs", () => {
    const profiles = read("landing/founder-profile-data.js");
    expect(profiles).toContain("No private Founder DR.X / Second Brain context is shipped to the browser");
    expect((profiles.match(/portrait: '.\/assets\/founders\//g) || []).length).toBe(3);
    expect(exists("assets/founders/sayem-ahmed.jpg")).toBe(true);
    expect(exists("assets/founders/fahim-shahbaz-mahmud.jpg")).toBe(true);
    expect(exists("assets/founders/erfan-uddin.jpg")).toBe(true);
    expect(exists("landing/assets/founders/sayem-ahmed.jpg")).toBe(true);
    expect(exists("landing/assets/founders/fahim-shahbaz-mahmud.jpg")).toBe(true);
    expect(exists("landing/assets/founders/erfan-uddin.jpg")).toBe(true);
    expect(profiles).toContain("fahim-shahbaz-mahmud-765255124");
    expect((profiles.match(/linkedin\.com/g) || []).length).toBe(1);
    expect(profiles).toContain("Also known as Dr. X");
  });

  it("makes the authenticated portal real-person profiles powered by Dr. X", () => {
    const portal = read("app/(tabs)/ai-guidance.tsx");
    const layout = read("app/(tabs)/_layout.tsx");
    expect(portal).toContain("MEET THE FOUNDERS.");
    expect(portal).toContain("Sayem Ahmed");
    expect(portal).toContain("Fahim Shahbaz Mahmud");
    expect(portal).toContain("Erfan Uddin");
    expect(portal).toContain("Also known as Dr. X");
    expect(portal).toContain("POWERED BY DR. X");
    expect(portal).toContain('require("../../assets/founders/sayem-ahmed.jpg")');
    expect(portal).toContain('require("../../assets/founders/fahim-shahbaz-mahmud.jpg")');
    expect(portal).toContain('require("../../assets/founders/erfan-uddin.jpg")');
    expect(portal).not.toContain("JOURNEY GUIDE AI");
    expect(portal).not.toContain("CAREER GUIDE AI");
    expect(portal).not.toContain("COMMUNITY GUIDE AI");
    expect(portal).not.toContain("Three AI perspectives");
    expect(layout).toContain('title: "Dr. X"');
    expect(layout).not.toContain('title: "AI Guides"');
  });

  it("enforces non-impersonation in the server prompt, not only in the UI", () => {
    const server = read("server/routers.ts");
    expect(server).toContain("const DRX_FOUNDER_PROFILES");
    expect(server).toContain("You are Dr. X operating inside the approved Last Bench interactive profile for Sayem Ahmed");
    expect(server).toContain("You are not Sayem Ahmed");
    expect(server).toContain("You are not Fahim Shahbaz Mahmud");
    expect(server).toContain("Erfan Uddin is also known as Dr. X");
    expect(server).toContain("You are not Erfan Uddin");
    expect(server).not.toContain("You are Sayem's AI");
    expect(server).not.toContain("You are Fahim's AI");
    expect(server).not.toContain("You are Erfan's AI");
    expect(server).not.toContain("Speak like a founder");
  });

  it("locks generated founder replies as Dr. X output rather than direct human statements", () => {
    const script = read("landing/bench-ai.js");
    const portal = read("app/(tabs)/ai-guidance.tsx");
    const design = read("design.md");
    const product = read("PRODUCT.md");
    expect(script).toContain("are not direct statements from the founder unless explicitly verified");
    expect(portal).toContain("Generated replies are not direct statements from a founder unless explicitly verified.");
    expect(design).toContain("generated interactive-profile replies are **not direct statements from the founder**");
    expect(product).toContain("Generated profile replies must disclose that they are powered by Dr. X");
  });

  it("preserves the public/private project boundary", () => {
    const script = read("landing/bench-ai.js");
    const server = read("server/routers.ts");
    const product = read("PRODUCT.md");
    expect(script).toContain("public_only: true");
    expect(script).toContain("project: 'lastbench'");
    expect(server).toContain("private founder memory");
    expect(product).toContain("must never expose Erfan's private/global Founder DR.X memory");
  });
});
