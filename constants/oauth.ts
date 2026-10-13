import * as Linking from "expo-linking";
import { Platform } from "react-native";

const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
};

export const API_BASE_URL = env.apiBaseUrl;
export const SUPABASE_URL = env.supabaseUrl;
export const SUPABASE_PUBLISHABLE_KEY = env.supabasePublishableKey;

// Compatibility exports for existing screens while the auth UI is migrated.
// They now mean "Supabase Auth is configured" and do not contain Manus IDs.
export const APP_ID = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY ? "supabase-auth" : "";
export const OAUTH_PORTAL_URL = APP_ID;
export const OAUTH_SERVER_URL = SUPABASE_URL;
export const OWNER_OPEN_ID = "";
export const OWNER_NAME = "Last Bench";

export function getApiBaseUrl(): string {
  if (API_BASE_URL) return API_BASE_URL.replace(/\/$/, "");

  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) return `${protocol}//${apiHostname}`;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }
  }
  return "";
}

export const SESSION_TOKEN_KEY = "lastbench_supabase_access_token";
export const REFRESH_TOKEN_KEY = "lastbench_supabase_refresh_token";
export const USER_INFO_KEY = "lastbench-runtime-user-info";

/**
 * Compatibility entry point used by the existing home screen. Authentication
 * is now an in-app Supabase email/password flow; no external OAuth portal is
 * opened and no Manus application identity is involved.
 */
export async function startOAuthLogin(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.location.href = "/app/auth";
    return null;
  }

  await Linking.openURL(Linking.createURL("/auth"));
  return null;
}
