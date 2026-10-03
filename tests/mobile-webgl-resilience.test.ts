import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const landing = fs.readFileSync(path.join(process.cwd(), "landing/malaysia/index.html"), "utf8");

describe("mobile WebGL resilience", () => {
  it("keeps the cinematic Malaysia journey inside a conservative Android GPU budget", () => {
    expect(landing).toContain("const constrainedGpu = small");
    expect(landing).toContain("constrainedGpu ? 1 : (small ? 1.25 : 1.75)");
    expect(landing).toContain("if (constrainedGpu) tier = 0");
    expect(landing).toContain("const W = small ? 1024 : 4096");
    expect(landing).toContain("cloudCv = mk(small ? 512 : 1024, small ? 256 : 512)");
  });

  it("fails closed to a static visual instead of leaving Chrome's sad WebGL canvas", () => {
    expect(landing).toContain("webglcontextlost");
    expect(landing).toContain("Departure WebGL context lost — switched to static fallback.");
    expect(landing).toContain("City WebGL context lost — switched to CSS fallback.");
    expect(landing).toContain("cv.style.visibility = 'hidden'");
    expect(landing).toContain("if (!this.cityContextLost) this.renderComposite()");
  });

  it("releases both renderer contexts when the experience unmounts", () => {
    expect(landing).toContain("this.globeRenderer.dispose()");
    expect(landing).toContain("removeEventListener('webglcontextlost', this.onGlobeContextLost)");
    expect(landing).toContain("removeEventListener('webglcontextlost', this.onCityContextLost)");
  });
});
