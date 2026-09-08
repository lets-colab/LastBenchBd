import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly code: "not_configured" | "invalid_response" | "request_failed" = "request_failed",
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type ApiUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role?: "user" | "admin" | "tutor" | "mentor";
  lastSignedIn: string;
};

type NativeSessionFields = {
  accessToken?: string;
  refreshToken?: string;
};

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (Platform.OS !== "web") {
    headers["x-lastbench-client"] = "native";
    const sessionToken = await Auth.getSessionToken();
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new ApiRequestError(
      "Student services are not connected yet. Please try again later.",
      null,
      "not_configured",
    );
  }

  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${cleanBaseUrl}${cleanEndpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.toLowerCase().includes("application/json");
    const body = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const errorMessage =
        (body as { error?: string; message?: string } | null)?.error ||
        (body as { error?: string; message?: string } | null)?.message ||
        `Student services returned ${response.status}.`;
      throw new ApiRequestError(errorMessage, response.status);
    }

    if (!isJson) {
      throw new ApiRequestError(
        "Student services returned an invalid response. Please try again later.",
        response.status,
        "invalid_response",
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError(
      error instanceof Error ? error.message : "Student services are unavailable.",
    );
  }
}

async function persistNativeSession(result: NativeSessionFields) {
  if (Platform.OS === "web") return;
  if (result.accessToken && result.refreshToken) {
    await Auth.setSessionTokens(result.accessToken, result.refreshToken);
  }
}

export async function signIn(email: string, password: string): Promise<ApiUser> {
  const result = await apiCall<{ user: ApiUser } & NativeSessionFields>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await persistNativeSession(result);
  return result.user;
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ user: ApiUser | null; requiresEmailConfirmation: boolean }> {
  const result = await apiCall<{
    user: ApiUser | null;
    requiresEmailConfirmation: boolean;
  } & NativeSessionFields>("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  await persistNativeSession(result);
  return {
    user: result.user,
    requiresEmailConfirmation: result.requiresEmailConfirmation,
  };
}

export async function refreshSession(): Promise<ApiUser | null> {
  const refreshToken = Platform.OS === "web" ? null : await Auth.getRefreshToken();
  if (Platform.OS !== "web" && !refreshToken) return null;

  try {
    const result = await apiCall<{ user: ApiUser } & NativeSessionFields>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
    await persistNativeSession(result);
    return result.user;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      await Auth.removeSessionToken();
      return null;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await apiCall<{ success: boolean }>("/api/auth/logout", { method: "POST" }).catch(() => {});
  await Promise.all([Auth.removeSessionToken(), Auth.clearUserInfo()]);
}

export async function getMe(): Promise<ApiUser | null> {
  try {
    const result = await apiCall<{ user: ApiUser }>("/api/auth/me");
    return result.user || null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      if (Platform.OS !== "web" && (await Auth.getRefreshToken())) {
        return refreshSession();
      }
      return null;
    }
    throw error;
  }
}
