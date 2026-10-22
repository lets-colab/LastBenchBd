import { afterEach, describe, expect, it, vi } from "vitest";
import { getJevProviderHealth } from "../server/jevIntegrationHealth";

afterEach(()=>{ vi.unstubAllGlobals();vi.unstubAllEnvs(); });

describe("JEV adapter readiness fails closed",()=>{
  it("does not try network calls without per-provider credentials",async()=>{
    vi.stubEnv("HUBSPOT_PRIVATE_APP_TOKEN","");vi.stubEnv("HUBSPOT_ACCESS_TOKEN","");
    vi.stubEnv("NOTION_API_KEY","");vi.stubEnv("SLACK_BOT_TOKEN","");
    const fetchSpy=vi.fn();vi.stubGlobal("fetch",fetchSpy);
    const results=await getJevProviderHealth();
    expect(results).toHaveLength(3);
    expect(results.every(r=>r.status==="not_configured")).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("rejects Slack auth.test responses with HTTP 200 and ok=false",async()=>{
    vi.stubEnv("HUBSPOT_PRIVATE_APP_TOKEN","");vi.stubEnv("HUBSPOT_ACCESS_TOKEN","");
    vi.stubEnv("NOTION_API_KEY","");vi.stubEnv("SLACK_BOT_TOKEN","test-token");
    const fetchSpy=vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:false,error:"invalid_auth"})});
    vi.stubGlobal("fetch",fetchSpy);
    const results=await getJevProviderHealth();
    expect(results.find(r=>r.provider==="Slack")?.status).toBe("unreachable");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});