import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import appConfig from "../app.config";

describe("mobile release identity", () => {
  it("bundles the reviewed public service configuration for native production", () => {
    const eas = JSON.parse(readFileSync(new URL("../eas.json", import.meta.url), "utf8"));
    expect(eas.build.production.env).toEqual(expect.objectContaining({
      EXPO_PUBLIC_API_BASE_URL: "https://api.lastbenchbd.com",
      EXPO_PUBLIC_SUPABASE_URL: "https://tocxdyqlrvzthpexnmxe.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: expect.stringMatching(/^sb_publishable_/),
    }));
  });
  it("uses the linked EAS project's slug and preserves the store identifiers", () => {
    // EAS rejected the mobile-production release when this project's slug
    // differed from the slug registered for its existing project ID.
    expect(appConfig).toMatchObject({
      name: "Last Bench",
      slug: "llstbench-bd",
      scheme: "lastbench",
      extra: {
        eas: { projectId: "abffbcd3-7fbc-4b73-b519-1fcf5dad4e36" },
      },
      ios: { bundleIdentifier: "com.lastbenchbd.app" },
      android: { package: "com.lastbenchbd.app" },
    });
  });
});
