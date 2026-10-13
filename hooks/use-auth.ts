import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = { autoFetch?: boolean };

function mapUser(apiUser: NonNullable<Awaited<ReturnType<typeof Api.getMe>>>): Auth.User {
  return {
    id: apiUser.id,
    openId: apiUser.openId,
    name: apiUser.name,
    email: apiUser.email,
    loginMethod: apiUser.loginMethod,
    role: apiUser.role,
    lastSignedIn: new Date(apiUser.lastSignedIn),
  };
}

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUser = await Api.getMe();
      const userInfo = apiUser ? mapUser(apiUser) : null;
      setUser(userInfo);
      if (userInfo && Platform.OS !== "web") await Auth.setUserInfo(userInfo);
      if (!userInfo && Platform.OS !== "web") await Auth.clearUserInfo();
    } catch (err) {
      const resolved = err instanceof Error ? err : new Error("Failed to fetch user");
      if (__DEV__) console.warn("[useAuth] fetchUser error:", resolved.message);
      setError(resolved);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await Api.logout();
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    if (Platform.OS !== "web") {
      void Auth.getUserInfo().then((cached) => {
        if (cached) setUser(cached);
        void fetchUser();
      });
      return;
    }

    void fetchUser();
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
  };
}
