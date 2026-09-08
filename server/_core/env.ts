export const DEFAULT_AI_GUIDANCE_MODEL = "gpt-5";

export function resolveAiGuidanceModel(value = process.env.AI_GUIDANCE_MODEL) {
  const configuredModel = value?.trim();
  return configuredModel || DEFAULT_AI_GUIDANCE_MODEL;
}

const REQUIRED_PRODUCTION_ENV = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "FRONTEND_URL",
  "CORS_ALLOWED_ORIGINS",
] as const;

export type ProductionIntegrationStatus = {
  authConfigured: boolean;
  storageConfigured: boolean;
  aiConfigured: boolean;
};

export function getProductionIntegrationStatus(
  env: NodeJS.ProcessEnv = process.env,
): ProductionIntegrationStatus {
  const supabaseConfigured = Boolean(
    env.SUPABASE_URL?.trim() && env.SUPABASE_PUBLISHABLE_KEY?.trim(),
  );
  return {
    authConfigured: supabaseConfigured,
    storageConfigured: supabaseConfigured,
    aiConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
  };
}

export function getMissingProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  if (env.NODE_ENV !== "production") return [];
  return REQUIRED_PRODUCTION_ENV.filter((name) => !env[name]?.trim());
}

export function assertProductionConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const missing = getMissingProductionEnv(env);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment: ${missing.join(", ")}`);
  }

  if (env.NODE_ENV !== "production") return;

  for (const name of ["SUPABASE_URL", "FRONTEND_URL"] as const) {
    const url = new URL(env[name]!);
    if (url.protocol !== "https:") {
      throw new Error(`${name} must use HTTPS in production`);
    }
  }

  if (env.OPENAI_API_BASE_URL?.trim()) {
    const url = new URL(env.OPENAI_API_BASE_URL);
    if (url.protocol !== "https:") {
      throw new Error("OPENAI_API_BASE_URL must use HTTPS in production");
    }
  }

  if (!/^postgres(ql)?:\/\//.test(env.DATABASE_URL!)) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
  // Compatibility property used by the existing DB upsert path. It now means
  // the explicitly configured Supabase Auth user UUID that should receive the
  // platform-admin role; it is no longer a Manus/OpenID identity.
  ownerOpenId: process.env.ADMIN_AUTH_USER_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  openAiApiUrl: (process.env.OPENAI_API_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, ""),
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  aiGuidanceModel: resolveAiGuidanceModel(),
};
