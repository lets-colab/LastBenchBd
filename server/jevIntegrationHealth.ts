/** Runtime adapter health; NEVER returns provider credentials or PII. */
export type ProviderHealth = {provider:string;status:"not_configured"|"reachable"|"unreachable";checkedAt:string};

async function check(provider:string, token:string|undefined, url:string, extraHeaders:Record<string,string>={}):Promise<ProviderHealth> {
  const checkedAt=new Date().toISOString();
  if (!token?.trim()) return {provider,status:"not_configured",checkedAt};
  try {
    const response=await fetch(url,{method:"GET",headers:{"Authorization":`Bearer ${token}`,...extraHeaders},signal:AbortSignal.timeout(2500)});
    const applicationOk=provider==="Slack" ? Boolean(response.ok && (await response.json().catch(()=>({ok:false}))).ok) : response.ok;
    return {provider,status:applicationOk?"reachable":"unreachable",checkedAt};
  } catch {return {provider,status:"unreachable",checkedAt};}
}

export async function getJevProviderHealth():Promise<ProviderHealth[]> {
  return Promise.all([
    check("HubSpot",process.env.HUBSPOT_PRIVATE_APP_TOKEN||process.env.HUBSPOT_ACCESS_TOKEN,"https://api.hubapi.com/crm/v3/objects/contacts?limit=1"),
    check("Notion",process.env.NOTION_API_KEY,"https://api.notion.com/v1/users/me",{"Notion-Version":"2022-06-28"}),
    check("Slack",process.env.SLACK_BOT_TOKEN,"https://slack.com/api/auth.test"),
  ]);
}