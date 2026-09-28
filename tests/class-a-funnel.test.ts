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
const pass = read("pass.html");
const passScript = read("pass.js");
const liveControl = read("live-control.html");
const liveControlScript = read("live-control.js");

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
    expect(masterclass).toContain("FREE REGISTRATION");
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
    expect(masterclass).toContain('class="intro-number"');
    expect(masterclass).toContain('<h1><span>TURN AI INTO</span>');
    expect(masterclass).toContain('ACCEPT INVITATION');
    expect(masterclass).toContain('>SKIP<');
    expect(masterclass).toContain('TURN AI INTO');
    expect(masterclass).toContain('YOUR TEAM.');
    expect(masterclass).toContain('Research · Build · Create · Sell · Operate');
    expect(masterclass).toContain('data-public-session-chip');
    expect(masterclass).toContain('1 OCT · 8:00 PM · LIVE ONLINE');
    expect(masterclass).toContain('data-intro-end-card');
    expect(masterclass).not.toContain('class="intro-bench"');
    expect(masterclass).not.toContain('class="manifesto"');
    expect(masterclassScript).toContain('const INTRO_END_AT = 26.88');
    expect(masterclassScript).toContain('requestVideoFrameCallback');
    expect(masterclassScript).toContain('film.muted = false');
    expect(masterclassStyles).toContain('object-fit:cover');
    expect(masterclassStyles).toContain('.intro-end-card');
  });

  it("locks the 2026-09-28 CLASS 3D UI art direction", () => {
    expect(masterclass).toContain('class="hero-system-stack"');
    expect(masterclass).toContain('class="transform-rig"');
    expect(masterclass).toContain('data-capability="5"');
    expect(masterclassStyles).toContain('--green:#00c853');
    expect(masterclassStyles).toContain('.system-pane');
    expect(masterclassStyles).toContain('.journey.is-transforming');
    expect(masterclassStyles).toContain('background-size:64px 64px');
    expect(masterclassScript).toContain("journey?.setAttribute('data-scene'");
    expect(masterclassScript).toContain("journey.classList.add('is-transforming')");
    expect(styles).toContain('.class-ui-stack');
    expect(script).toContain("className = 'class-ui-stack'");
  });

  it("locks the online admission, pass and evidence flow", () => {
    expect(masterclass).toContain("You’ve been invited to join them.");
    expect(masterclass).toContain("GOOGLE MEET · FREE REGISTRATION");
    expect(masterclass).toContain("CLAIM YOUR PASS.");
    expect(masterclassScript).toContain("class_a_register_online_gated");
    expect(masterclassScript).toContain("class_a_public_session");
    expect(masterclass).toContain("data-public-session-chip");
    expect(masterclass).toContain("data-public-session-meta");
    expect(masterclassScript).toContain("class_a_unlock_online_pass");
    expect(masterclassScript).toContain("p_follow_confirmed: true");
    expect(masterclassScript).toContain("result.outcome !== 'follow_required'");
    expect(masterclass).toContain("may be recorded and transcribed for learning and quality improvement");
    expect(masterclass).toContain("does not grant permission to use my image, voice, or words in public marketing");
    expect(masterclass).toContain('name="recording_consent"');
    expect(masterclassScript).toContain("p_recording_consent");
    expect(masterclass).toContain("https://whatsapp.com/channel/0029Vb8z67SGJP8MABoA3A00");
    expect(masterclass).toContain("FOLLOW &lt;CLASS[Λ]&gt; | LEARN AI ON WHATSAPP");
    expect(masterclass).toContain("FOLLOW CHANNEL →");
    expect(masterclass).toContain("I'VE FOLLOWED — UNLOCK MY PASS");
    expect(masterclass).toContain("data-pass-reveal hidden");
    expect(masterclassScript).toContain("prepareWhatsappUnlock(result)");
    expect(masterclassScript).toContain("result.unlock_token");
    expect(masterclassScript).toContain("result.pass_code");
    expect(masterclassScript).toContain("unlockPass?.addEventListener('click'");
    expect(masterclassScript).toContain("sessionStorage.setItem('class_a_last_pass_url'");
    expect(masterclassScript).not.toContain("location.assign(WHATSAPP_CHANNEL_URL)");
    expect(masterclassScript).not.toContain("WHATSAPP_REDIRECT_SECONDS");
    expect(masterclassScript).toContain("/class-a/pass.html#code=");
    expect(masterclass).toContain("ADD TO GOOGLE CALENDAR");
    expect(pass).toContain("<h1>YOUR<br>MASTERCLASS PASS.</h1>");
    expect(pass).toContain("LIVE ATTENDANCE PROOF");
    expect(passScript).toContain("class_a_get_session_pass");
    expect(passScript).toContain("class_a_record_session_signal");
    expect(passScript).toContain("class_a_verify_live_attendance");
    expect(liveControl).toContain("ISSUE LIVE");
    expect(liveControl).toContain("ATTENDANCE CODE.");
    expect(liveControlScript).toContain("class_a_issue_current_live_code");
    expect(liveControl).toContain("BUILD-XXXXXX");
  });

  it("keeps join signals separate from verified attendance", () => {
    expect(pass).toContain("Joining the room is a signal. The live code verifies attendance.");
    expect(passScript).toContain("p_signal:'join_click'");
    expect(passScript).toContain("class_a_verify_live_attendance");
    expect(passScript).not.toContain("p_signal:'attended'");
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
    const pages = `${hub}\n${masterclass}\n${course}\n${pass}\n${liveControl}`;
    expect(pages).not.toMatch(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
    expect(pages).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
  });
});
