import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../server/_core/context";
import {
  assertProductionConfiguration,
  DEFAULT_AI_GUIDANCE_MODEL,
  getMissingProductionEnv,
  getProductionIntegrationStatus,
  resolveAiGuidanceModel,
} from "../server/_core/env";
import { appRouter } from "../server/routers";
import * as db from "../server/db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthenticatedContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "student-without-profile",
    email: "student@example.com",
    name: "Student",
    loginMethod: "email",
    role: "user",
    expoPushToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AI guidance model configuration", () => {
  it("uses the configured OpenAI default when no model is supplied", () => {
    expect(resolveAiGuidanceModel(undefined)).toBe(DEFAULT_AI_GUIDANCE_MODEL);
    expect(resolveAiGuidanceModel("   ")).toBe(DEFAULT_AI_GUIDANCE_MODEL);
    expect(DEFAULT_AI_GUIDANCE_MODEL).toBe("gpt-5.6-terra");
  });

  it("accepts a configured model without surrounding whitespace", () => {
    expect(resolveAiGuidanceModel("  gpt-5  ")).toBe("gpt-5");
  });
});

describe("production environment gate", () => {
  const coreProductionEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://project:password@db.example.com:5432/postgres",
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_key",
    FRONTEND_URL: "https://lastbenchbd.com",
    CORS_ALLOWED_ORIGINS: "https://lastbenchbd.com",
  } satisfies NodeJS.ProcessEnv;

  const completeProductionEnv = {
    ...coreProductionEnv,
    OPENAI_API_KEY: "test-openai-key",
    OPENAI_API_BASE_URL: "https://api.openai.com/v1",
    AI_GUIDANCE_MODEL: "configured-model",
  } satisfies NodeJS.ProcessEnv;

  it("fails closed when a core production value is missing", () => {
    const env = { ...coreProductionEnv, DATABASE_URL: "" };
    expect(getMissingProductionEnv(env)).toContain("DATABASE_URL");
    expect(() => assertProductionConfiguration(env)).toThrow(
      "Missing required production environment: DATABASE_URL",
    );
  });

  it("allows the core API to start while AI remains unavailable", () => {
    expect(() => assertProductionConfiguration(coreProductionEnv)).not.toThrow();
    expect(getMissingProductionEnv(coreProductionEnv)).toEqual([]);
    expect(getProductionIntegrationStatus(coreProductionEnv)).toEqual({
      authConfigured: true,
      storageConfigured: true,
      aiConfigured: false,
    });
  });

  it("reports all integrations ready for a complete HTTPS production configuration", () => {
    expect(() => assertProductionConfiguration(completeProductionEnv)).not.toThrow();
    expect(getProductionIntegrationStatus(completeProductionEnv)).toEqual({
      authConfigured: true,
      storageConfigured: true,
      aiConfigured: true,
    });
  });
});

describe("AI guidance profile requirement", () => {
  it("rejects chat before reading history or writing messages when no profile exists", async () => {
    vi.spyOn(db, "getStudent").mockResolvedValue(undefined);
    const historySpy = vi.spyOn(db, "getAIChatHistory");
    const memorySpy = vi.spyOn(db, "getAIMemories");
    const saveSpy = vi.spyOn(db, "saveAIChatMessage");
    const caller = appRouter.createCaller(createAuthenticatedContext());

    await expect(
      caller.aiGuidance.chat({
        message: "Help me choose a course",
        guide: "sayem",
      }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: "Complete your student profile before using AI guidance.",
    });

    expect(historySpy).not.toHaveBeenCalled();
    expect(memorySpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("rejects recommendations when no student profile exists", async () => {
    vi.spyOn(db, "getStudent").mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createAuthenticatedContext());

    await expect(caller.aiGuidance.getRecommendations()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: "Complete your student profile before using AI guidance.",
    });
  });
});
