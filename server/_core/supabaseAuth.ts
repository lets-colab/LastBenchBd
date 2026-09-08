import type { Request, Response } from "express";
import { ForbiddenError } from "../../shared/_core/errors.js";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

export const ACCESS_COOKIE_NAME = "lb_access_token";
export const REFRESH_COOKIE_NAME = "lb_refresh_token";

const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user: SupabaseUser;
};

export type SupabaseSignupResult = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number;
  token_type?: string;
  user?: SupabaseUser | null;
};

function assertSupabaseConfig() {
  if (!ENV.supabaseUrl || !ENV.supabasePublishableKey) {
    throw new Error("Supabase Auth is not configured");
  }
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertSupabaseConfig();
  const response = await fetch(`${ENV.supabaseUrl.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      apikey: ENV.supabasePublishableKey,
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as
      | { msg?: string; message?: string; error_description?: string; error?: string }
      | null;
    const safeMessage =
      body?.msg || body?.message || body?.error_description || body?.error ||
      `Supabase Auth returned ${response.status}`;
    const error = new Error(safeMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function readCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length).trim();
  return token || undefined;
}

export function getRequestAccessToken(req: Request): string | undefined {
  return bearerToken(req) || readCookie(req, ACCESS_COOKIE_NAME);
}

export function getRequestRefreshToken(req: Request): string | undefined {
  return readCookie(req, REFRESH_COOKIE_NAME);
}

export async function signInWithPassword(email: string, password: string): Promise<SupabaseSession> {
  return supabaseFetch<SupabaseSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name?: string,
): Promise<SupabaseSignupResult> {
  return supabaseFetch<SupabaseSignupResult>("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: name?.trim() ? { name: name.trim(), full_name: name.trim() } : {},
    }),
  });
}

export async function refreshWithToken(refreshToken: string): Promise<SupabaseSession> {
  return supabaseFetch<SupabaseSession>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getSupabaseUser(accessToken: string): Promise<SupabaseUser> {
  return supabaseFetch<SupabaseUser>("/auth/v1/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function revokeSupabaseSession(accessToken: string): Promise<void> {
  await supabaseFetch<void>("/auth/v1/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

function metadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function syncAppUser(authUser: SupabaseUser): Promise<User> {
  const name =
    metadataString(authUser.user_metadata, "full_name") ||
    metadataString(authUser.user_metadata, "name") ||
    authUser.email?.split("@")[0] ||
    "Student";
  const provider = metadataString(authUser.app_metadata, "provider") || "email";
  const signedInAt = new Date();

  // `openId` is retained as a compatibility column in the existing product
  // schema. Its value is now the Supabase Auth user UUID (`auth.users.id`).
  await db.upsertUser({
    openId: authUser.id,
    name,
    email: authUser.email ?? null,
    loginMethod: provider,
    lastSignedIn: signedInAt,
  });

  const user = await db.getUserByOpenId(authUser.id);
  if (!user) throw new Error("Authenticated user could not be synchronized");
  return user;
}

export function setSessionCookies(req: Request, res: Response, session: SupabaseSession): void {
  const options = getSessionCookieOptions(req);
  const accessMaxAge = Math.max(60, session.expires_in ?? 3600) * 1000;
  res.cookie(ACCESS_COOKIE_NAME, session.access_token, { ...options, maxAge: accessMaxAge });
  res.cookie(REFRESH_COOKIE_NAME, session.refresh_token, {
    ...options,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function clearSessionCookies(req: Request, res: Response): void {
  const options = getSessionCookieOptions(req);
  res.clearCookie(ACCESS_COOKIE_NAME, { ...options, maxAge: -1 });
  res.clearCookie(REFRESH_COOKIE_NAME, { ...options, maxAge: -1 });
}

export async function authenticateRequest(req: Request, res?: Response): Promise<User> {
  let accessToken = getRequestAccessToken(req);
  if (accessToken) {
    try {
      return await syncAppUser(await getSupabaseUser(accessToken));
    } catch {
      // A stale access token may still have a valid refresh token below.
    }
  }

  const refreshToken = getRequestRefreshToken(req);
  if (!refreshToken) throw ForbiddenError("Invalid or expired Supabase session");

  try {
    const refreshed = await refreshWithToken(refreshToken);
    accessToken = refreshed.access_token;
    if (res) setSessionCookies(req, res, refreshed);
    return await syncAppUser(refreshed.user || (await getSupabaseUser(accessToken)));
  } catch {
    if (res) clearSessionCookies(req, res);
    throw ForbiddenError("Invalid or expired Supabase session");
  }
}
