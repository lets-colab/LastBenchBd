import { describe, expect, it } from "vitest";
import appConfig from "../app.config";

describe("mobile release identity", () => {
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
