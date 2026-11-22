import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
describe("public release navigation and privacy", () => {
  it("provides direct people, public evidence and existing sign-in routes", () => {
    const page = read("landing/index.html");
    expect(page).toContain("ONE STARTING POINT.");
    expect(page).toContain("MANY POSSIBLE FUTURES.");
    expect(page).toContain('href="explore/"');
    expect(page).toContain('href="work/"');
    expect(page).toContain('href="https://erfanuddin.lastbenchbd.com/"');
    expect(page).toContain('href="app/auth/"');
    expect(page).toContain('id="paths"');
    expect(page.match(/<a\b[^>]*class="gate gate-colab"[^>]*>/)?.[0]).not.toContain("aria-label");
  });
  it("opens only the exact approved city map with no referrer or credentials", () => {
    const page = read("landing/malaysia/index.html");
    const anchors = page.match(/<a\b[^>]*href="https:\/\/godseyeview\.ai\/"[^>]*>/g) || [];
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toContain('target="_blank"');
    expect(anchors[0]).toContain('rel="noopener noreferrer"');
    expect(anchors[0]).toContain('referrerpolicy="no-referrer"');
    expect(page).toContain("শহরের মানচিত্র খুলুন");
    expect(page).not.toContain("মানচিত্রে বাস্তব কেএলসিসি বেঞ্চ খুলুন");
  });
  it("offers public first-party evidence without exposing private founder systems", () => {
    const atlas = read("landing/explore/index.html");
    expect(atlas).toContain('href="/class-a/course.html"');
    expect(atlas).not.toMatch(/api\.lastbenchbd|\/rest\/v1|service_role|co-mpass\.onrender/);
    const work = read("landing/work/index.html");
    expect(work).not.toMatch(/href="[^\"]*(?:projectx|showcase\/skin-needs)/i);
    expect(work).toContain("No client case studies are published here yet");
  });
});
