import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateRequest } from "./supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateRequest(opts.req, opts.res);
  } catch {
    // Authentication is optional for public procedures. Protected procedures
    // receive `user: null` and fail closed in the tRPC authorization layer.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
