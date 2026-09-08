import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { REFRESH_TOKEN_KEY, SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role?: "user" | "admin" | "tutor" | "mentor";
  lastSignedIn: Date;
};

export async function getSessionToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setSessionTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all([
    SecureStore.setItemAsync(SESSION_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function setSessionToken(token: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function removeSessionToken(): Promise<void> {
  if (Platform.OS === "web") return;
  await Promise.all([
    SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]).catch(() => {});
}

export async function getUserInfo(): Promise<User | null> {
  if (Platform.OS === "web") return null;
  try {
    const info = await SecureStore.getItemAsync(USER_INFO_KEY);
    if (!info) return null;
    const parsed = JSON.parse(info) as Omit<User, "lastSignedIn"> & { lastSignedIn: string | Date };
    return { ...parsed, lastSignedIn: new Date(parsed.lastSignedIn) };
  } catch {
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user)).catch(() => {});
}

export async function clearUserInfo(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(USER_INFO_KEY).catch(() => {});
}
