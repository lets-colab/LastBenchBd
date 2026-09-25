import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const classRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../landing/class-a");
const read = (name: string) => readFileSync(resolve(classRoot, name), "utf8");
const landing = readFileSync(resolve(classRoot, "../index.html"), "utf8");

const hub = read("index.html");
const masterclass = read("masterclass.html");
const course = read("course.html");
const script = read("cinematic.js");
const styles = read("cinematic.css");
const masterclassScript = read("masterclass-cinematic.js");
const masterclassStyles = read("masterclass-cinematic-a.css") + read("masterclass-cinematic-b.css");

describe("CLASS A signup funnel", () => {
  it("keeps all three routes linked", () => {
    expect(landing).toContain('href="./class-a/"');
    expect(landing).toContain("ENTER CLASS[Λ]");
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
      expect(page).toContain('./assets/class-a-logo.jpg');
      expect(page).toContain('./assets/class-a-favicon.jpg');
      expect(page).toContain("ACQUIRE. APPLY. ADVANCE.");
    }
    expect(hub).toContain('data-brand-intro');
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(script).toContain("--journey-progress");
    expect(script).toContain("visibilitychange");
  });


  it("locks the approved cinematic reel as masterclass Scene 01", () => {
    const reelPath = resolve(classRoot, "assets/masterclass-entry.mp4");
    expect(existsSync(reelPath)).toBe(true);
    expect(statSync(reelPath).size).toBeGreaterThan(1_000_000);
    expect(masterclass).toContain('data-reel-entry');
    expect(masterclass).toContain('./assets/masterclass-entry.mp4');
    expect(masterclass).toContain('SCENE 01 · 0.01%');
    expect(masterclass).toContain('ENTER EXPERIENCE');
    expect(masterclass).toContain('>SKIP<');
    expect(masterclass).toContain('TURN AI INTO');
    expect(masterclass).toContain('YOUR TEAM.');
    expect(masterclass).toContain('CONTENT · AUTOMATION · MARKETING · OPERATIONS');
    expect(masterclass).toContain('10 SEATS ONLY · RESERVE YOUR FREE SEAT');
    expect(masterclass).toContain('data-intro-end-card');
    expect(masterclass).not.toContain('class="intro-bench"');
    expect(masterclass).not.toContain('class="manifesto"');
    expect(masterclassScript).toContain('const INTRO_END_AT = 26.88');
    expect(masterclassScript).toContain('requestVideoFrameCallback');
    expect(masterclassScript).toContain('film.muted = false');
    expect(masterclassStyles).toContain('object-fit:cover');
    expect(masterclassStyles).toContain('.intro-end-card');
  });

  it("keeps the masterclass hierarchy focused on one conversion path", () => {
    const heroIndex = masterclass.indexOf('class="hero"');
    const journeyIndex = masterclass.indexOf('class="journey"');
    const finalIndex = masterclass.indexOf('class="final-cta"');
    expect(heroIndex).toBeGreaterThan(-1);
    expect(journeyIndex).toBeGreaterThan(heroIndex);
    expect(finalIndex).toBeGreaterThan(journeyIndex);
    expect(masterclass).toContain('EXPLORE THE 20-CLASS PROGRAM →');
    expect(masterclass).not.toContain('class="manifesto"');
  });

  it("shares the CLASS Lambda spatial orbit system without changing locked art", () => {
    expect(script).toContain('scene-orbit-system');
    expect(styles).toContain('.scene-orbit-1');
    expect(styles).toContain('@keyframes classOrbitA');
    for (const page of [hub, masterclass, course]) {
      expect(page).toContain('./assets/class-a-20-orbit.jpg');
      expect(page).toContain('./assets/class-a-logo.jpg');
    }
  });

  it("avoids the known Impeccable slop regressions", () => {
    const sharedCss = read("cinematic.css");
    const masterCss = read("masterclass-cinematic-a.css") + read("masterclass-cinematic-b.css");
    const checkinCss = read("checkin.css");
    for (const css of [sharedCss, masterCss, checkinCss]) {
      expect(css).not.toMatch(/font-family:\s*Inter/i);
    }
    expect(sharedCss).not.toContain("background-size: 32px 32px");
    expect(masterclass).not.toContain('class="gate-kicker"');
    expect(masterclass).not.toContain('<p class="eyebrow">FREE MASTERCLASS');
    expect(course).not.toContain('20-CLASS ONE-PERSON VENTURE BUILDER</p>');
    expect(hub).not.toContain('CLASS[Λ] · ONE-PERSON AI TEAM</p>');
    expect(checkinCss).not.toMatch(/font-family:\s*Inter/i);
  });

  it("contains no hardcoded event date", () => {
    const pages = `${hub}\n${masterclass}\n${course}`;
    expect(pages).not.toMatch(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
    expect(pages).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
  });
});
