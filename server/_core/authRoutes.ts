import type { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import {
  authenticateRequest,
  clearSessionCookies,
  getRequestAccessToken,
  getRequestRefreshToken,
  refreshWithToken,
  revokeSupabaseSession,
  setSessionCookies,
  signInWithPassword,
  signUpWithPassword,
  syncAppUser,
} from "./supabaseAuth";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please wait and try again." },
});

function isNativeClient(req: Request) {
  return req.get("x-lastbench-client") === "native";
}

function textField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(req: Request, res: Response) {
  const email = textField(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required" });
    return null;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must contain at least 6 characters" });
    return null;
  }
  return { email, password };
}

function userResponse(user: Awaited<ReturnType<typeof authenticateRequest>>) {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    lastSignedIn: user.lastSignedIn.toISOString(),
  };
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/sign-in", authLimiter, async (req, res) => {
    const credentials = validateCredentials(req, res);
    if (!credentials) return;

    try {
      const session = await signInWithPassword(credentials.email, credentials.password);
      const user = await syncAppUser(session.user);
      setSessionCookies(req, res, session);

      res.json({
        user: userResponse(user),
        ...(isNativeClient(req)
          ? { accessToken: session.access_token, refreshToken: session.refresh_token }
          : {}),
      });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      res.status(status === 400 || status === 401 ? 401 : 502).json({
        error: status === 400 || status === 401
          ? "Email or password is incorrect"
          : "Authentication service is temporarily unavailable",
      });
    }
  });

  app.post("/api/auth/sign-up", authLimiter, async (req, res) => {
    const credentials = validateCredentials(req, res);
    if (!credentials) return;
    const name = textField(req.body?.name);

    try {
      const signup = await signUpWithPassword(credentials.email, credentials.password, name);
      if (!signup.user) {
        res.status(502).json({ error: "Authentication service returned an incomplete response" });
        return;
      }

      if (!signup.access_token || !signup.refresh_token) {
        res.status(202).json({
          user: null,
          requiresEmailConfirmation: true,
        });
        return;
      }

      const session = {
        access_token: signup.access_token,
        refresh_token: signup.refresh_token,
        expires_in: signup.expires_in,
        token_type: signup.token_type,
        user: signup.user,
      };
      const user = await syncAppUser(signup.user);
      setSessionCookies(req, res, session);

      res.status(201).json({
        user: userResponse(user),
        requiresEmailConfirmation: false,
        ...(isNativeClient(req)
          ? { accessToken: signup.access_token, refreshToken: signup.refresh_token }
          : {}),
      });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      res.status(status === 400 || status === 422 ? 400 : 502).json({
        error: status === 400 || status === 422
          ? "This account could not be created. Check the email and password and try again."
          : "Authentication service is temporarily unavailable",
      });
    }
  });

  app.post("/api/auth/refresh", async (req, res) => {
    const supplied = textField(req.body?.refreshToken);
    const refreshToken = supplied || getRequestRefreshToken(req);
    if (!refreshToken) {
      res.status(401).json({ error: "Refresh session is missing" });
      return;
    }

    try {
      const session = await refreshWithToken(refreshToken);
      const user = await syncAppUser(session.user);
      setSessionCookies(req, res, session);
      res.json({
        user: userResponse(user),
        ...(isNativeClient(req)
          ? { accessToken: session.access_token, refreshToken: session.refresh_token }
          : {}),
      });
    } catch {
      clearSessionCookies(req, res);
      res.status(401).json({ error: "Session has expired" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = getRequestAccessToken(req);
    if (token) {
      await revokeSupabaseSession(token).catch(() => {});
    }
    clearSessionCookies(req, res);
    res.json({ success: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await authenticateRequest(req, res);
      res.json({ user: userResponse(user) });
    } catch {
      res.status(401).json({ error: "Not authenticated", user: null });
    }
  });
}
