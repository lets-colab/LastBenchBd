/**
 * Local environment loader. Production values come from Render/Netlify.
 * Existing process environment always wins over values from .env.
 */
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    if (!line || line.trim().startsWith("#")) continue;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

// These Supabase values are publishable client configuration, not secrets.
const publicMappings = {
  SUPABASE_URL: "EXPO_PUBLIC_SUPABASE_URL",
  SUPABASE_PUBLISHABLE_KEY: "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
};

for (const [serverVar, publicVar] of Object.entries(publicMappings)) {
  if (process.env[serverVar] && !process.env[publicVar]) {
    process.env[publicVar] = process.env[serverVar];
  }
}
