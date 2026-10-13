import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createCorsMiddleware, getAllowedOrigins } from "../server/_core/cors";

const productionEnv = {
  NODE_ENV: "production" as const,
  FRONTEND_URL: "https://www.lastbenchbd.com/app",
  CORS_ALLOWED_ORIGINS: "https://preview.example.com, https://preview.example.com/path",
};

function runMiddleware(origin?: string, method = "GET") {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: unknown;
  const next = vi.fn();

  const req = {
    headers: origin === undefined ? {} : { origin },
    method,
  } as Request;

  const res = {
    vary: vi.fn(() => res),
    header: vi.fn((name: string, value: string) => {
      headers.set(name, value);
      return res;
    }),
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((value: unknown) => {
      body = value;
      return res;
    }),
    sendStatus: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
  } as unknown as Response;

  createCorsMiddleware(productionEnv)(req, res, next as NextFunction);

  return { body, headers, next, statusCode };
}

describe("credentialed CORS", () => {
  it("normalizes configured URLs to exact origins", () => {
    const origins = [...getAllowedOrigins(productionEnv)];
    expect(origins).toEqual([
      "https://www.lastbenchbd.com",
      "https://preview.example.com",
    ]);
    expect(new Set(origins).size).toBe(origins.length);
  });

  it("allows an exact configured origin with credentials", () => {
    const result = runMiddleware("https://www.lastbenchbd.com");

    expect(result.statusCode).toBe(200);
    expect(result.headers.get("Access-Control-Allow-Origin")).toBe("https://www.lastbenchbd.com");
    expect(result.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(result.next).toHaveBeenCalledOnce();
  });

  it("rejects hostile and opaque origins", () => {
    for (const origin of ["https://evil.example", "null"]) {
      const result = runMiddleware(origin);
      expect(result.statusCode).toBe(403);
      expect(result.headers.has("Access-Control-Allow-Origin")).toBe(false);
      expect(result.next).not.toHaveBeenCalled();
    }
  });

  it("allows native and server-to-server requests without an Origin header", () => {
    const result = runMiddleware();

    expect(result.statusCode).toBe(200);
    expect(result.headers.has("Access-Control-Allow-Origin")).toBe(false);
    expect(result.next).toHaveBeenCalledOnce();
  });

  it("returns 204 for an allowed preflight", () => {
    const result = runMiddleware("https://preview.example.com", "OPTIONS");

    expect(result.statusCode).toBe(204);
    expect(result.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
    expect(result.next).not.toHaveBeenCalled();
  });
});
