import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const classRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../landing/class-a");
const read = (name: string) => readFileSync(resolve(classRoot, name), "utf8");

const hub = read("index.html");
const masterclass = read("masterclass.html");
const course = read("course.html");
const script = read("cinematic.js");
const styles = read("cinematic.css");

describe("CLASS A signup funnel", () => {
  it("keeps all three routes linked", () => {
    expect(hub).toContain('href="./masterclass.html"');
    expect(hub).toContain('href="./course.html"');
    expect(masterclass).toContain('href="./course.html"');
    expect(course).toContain('href="./masterclass.html"');
  });

  it("publishes the full 20-class curriculum and proof outputs", () => {
    expect(course.match(/<li>/g)).toHaveLength(20);
    expect(course).toContain("Meet Your AI Team");
    expect(course).toContain("Build Your AI Workforce");
    expect(course).toContain("Co.lab Gate 5: Launch + Founder Simulation + Demo Day");
    expect(course).toContain("AI TOOL MAP");
    expect(course).toContain("VENTURE DOSSIER + LIVE DEMO");
  });

  it("keeps the masterclass free and the course interest-only", () => {
    expect(masterclass).toContain("No payment is collected here");
    expect(course).toContain("Payment is handled separately after acceptance");
    expect(course).not.toMatch(/type="(?:number|text)"[^>]+name="(?:card|payment|amount)"/i);
  });

  it("uses required labelled forms and the accepted Supabase program values", () => {
    for (const page of [masterclass, course]) {
      expect(page.match(/ required/g)?.length).toBeGreaterThanOrEqual(4);
      expect(page).toContain('netlify-honeypot="company"');
      expect(page).toContain('data-signup-form');
      expect(page).toContain('role="status"');
      expect(page).toContain('role="alert"');
    }
    expect(masterclass).toContain('data-program="masterclass"');
    expect(course).toContain('data-program="course"');
    expect(script).toContain("sb_publishable_");
    expect(script).not.toContain("SUPABASE_ANON_KEY");
  });

  it("preserves cinematic art direction and reduced-motion support", () => {
    for (const page of [hub, masterclass, course]) {
      expect(page).toContain("./assets/class-a-20-orbit.jpg");
      expect(page).toContain("ACQUIRE. APPLY. ADVANCE.");
    }
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("contains no hardcoded event date", () => {
    const pages = `${hub}\n${masterclass}\n${course}`;
    expect(pages).not.toMatch(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
    expect(pages).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
  });
});
