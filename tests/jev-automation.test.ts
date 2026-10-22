import { describe, expect, it, vi } from "vitest";
import { appRouter } from "../server/routers";

vi.mock("../server/jevAutomation", () => ({
  getAutomationOverview: vi.fn(async () => ({counts:{pending:0,processing:0,completed:1,blocked:0,dead_letter:0},workflows:[],runs:[],verifiedSource:"supabase:automation",existingOutbox:{events:19,hubspotRecorded:11,notionRecorded:14},generatedAt:"2026-10-22T00:00:00.000Z"})),
  executeSyntheticAutomationProbe: vi.fn(async () => ({eventId:"synthetic-id",status:"pending",outcome:{execution_mode:"dry_run"}}))
}));

function caller(user:unknown) {
  return appRouter.createCaller({req:{} as any,res:{} as any,user:user as any});
}

describe("JEV automation admin boundary", () => {
  it("denies anonymous read", async () => {
    await expect(caller(null).admin.automationOverview()).rejects.toMatchObject({code:"FORBIDDEN"});
  });
  it("denies ordinary signed-in users", async () => {
    await expect(caller({id:1,role:"student"}).admin.automationOverview()).rejects.toMatchObject({code:"FORBIDDEN"});
  });
  it("denies ordinary signed-in users triggering probes", async () => {
    await expect(caller({id:1,role:"student"}).admin.automationProbe()).rejects.toMatchObject({code:"FORBIDDEN"});
  });
  it("allows a verified admin to read redacted workflow summary", async () => {
    const result=await caller({id:5,role:"admin"}).admin.automationOverview();
    expect(result.verifiedSource).toBe("supabase:automation");
    expect(result.runs).toEqual([]);
    expect(result.existingOutbox).toEqual({events:19,hubspotRecorded:11,notionRecorded:14});
  });
  it("limits the exposed mutation to the synthetic probe", async () => {
    const result=await caller({id:5,role:"admin"}).admin.automationProbe();
    expect(result.status).toBe("pending");
  });
});