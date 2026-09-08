const required = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

const urlVariables = new Set([
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
]);

const errors = [];

for (const name of required) {
  const value = process.env[name]?.trim();

  if (!value) {
    errors.push(`${name} is required`);
    continue;
  }

  if (/replace-with|example\.com/i.test(value)) {
    errors.push(`${name} still contains a placeholder value`);
    continue;
  }

  if (urlVariables.has(name)) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") errors.push(`${name} must use HTTPS`);
      if (url.username || url.password) errors.push(`${name} must not contain credentials`);
    } catch {
      errors.push(`${name} must be a valid absolute URL`);
    }
  }
}

const publicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
if (publicKey.startsWith("sb_secret_")) {
  errors.push("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY must never contain a Supabase secret key");
}

if (errors.length > 0) {
  console.error("[public-env] production web build refused:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("[public-env] production public configuration is present and valid");
