/** CLASS[Λ] email surface — brand/class-a/BRAND_BLUEPRINT.md §10.
 * `body` must contain only static markup and escaped helper outputs. */
export const CLASS_A_EMAIL = {
  outer: "#222525", card: "#101110", status: "#1C2620",
  green: "#00C853", text: "#F5F7F5", muted: "#D0D7D1",
} as const;

export function escapeClassAHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as Record<string,string>)[char] || char);
}
export function safeClassAUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || /[\x00-\x1F\x7F]/.test(value)) return "";
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || !u.hostname || u.username || u.password) return "";
    return escapeClassAHtml(u.toString());
  } catch { return ""; }
}
export function classAButton(label: string, url: unknown): string {
  const href = safeClassAUrl(url);
  if (!href) return "";
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:18px 0 4px"><tr><td bgcolor="#00C853" style="background:#00C853;border-radius:9px"><a href="' + href + '" style="display:inline-block;padding:15px 22px;line-height:20px;color:#092715;background:#00C853;font-size:14px;font-weight:800;text-decoration:none;border-radius:9px">' + escapeClassAHtml(label) + '</a></td></tr></table>';
}
export function classAInlineLink(label: string, url: unknown): string {
  const href = safeClassAUrl(url);
  return href ? '<a href="' + href + '" style="color:#89E3A6;text-decoration:underline">' + escapeClassAHtml(label) + '</a>' : "";
}
export function classAStatusCard(rows: ReadonlyArray<readonly [string, unknown]>): string {
  if (!rows.length) return "";
  const entries = rows.map(([label,value]) => '<tr><td style="padding:5px 0;color:#89D6A0;font-size:12px;line-height:19px;font-weight:700;vertical-align:top">' + escapeClassAHtml(label) + '</td><td style="padding:5px 0 5px 15px;color:#F5F7F5;font-size:14px;line-height:20px;vertical-align:top">' + escapeClassAHtml(value) + '</td></tr>').join("");
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background:#1C2620;border:1px solid #314B3A;border-radius:10px;margin:18px 0 20px"><tr><td style="padding:16px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' + entries + '</table></td></tr></table>';
}
/** `body` is trusted HTML assembled from static markup and escaped helpers. */
export function renderClassAEmail(input: {title:string;body:string;eyebrow?:string}): string {
  const heading=escapeClassAHtml(input.title).replace(/\n/g,"<br>");
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>',
    '<body style="margin:0;padding:0;background:#222525;color:#F5F7F5;font-family:Arial,Helvetica,sans-serif">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#222525;border-collapse:collapse"><tr><td align="center" style="padding:24px 12px">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#101110;border-collapse:separate;border-spacing:0;border:1px solid #2D332F;border-radius:24px">',
    '<tr><td bgcolor="#00C853" style="height:9px;background:#00C853;font-size:1px;line-height:9px;border-radius:24px 24px 0 0">&nbsp;</td></tr>',
    '<tr><td style="padding:30px 28px 10px">',
    '<p style="margin:0 0 24px;color:#E8F5EB;font-size:14px;line-height:20px;font-weight:800;letter-spacing:1.8px">CLASS[Λ] <span style="color:#00C853">× LAST BENCH</span></p>',
    '<p style="margin:0 0 12px;color:#7BC992;font-size:12px;line-height:18px;font-weight:800;letter-spacing:2px;text-transform:uppercase">' + escapeClassAHtml(input.eyebrow ?? "CLASS[Λ] · HUMAN LAB") + '</p>',
    '<h1 style="margin:0 0 24px;color:#FFFFFF;font-size:36px;line-height:1.11;letter-spacing:-.65px;font-weight:800">' + heading + '</h1>',
    '<div style="color:#D0D7D1;font-size:15px;line-height:1.72">' + input.body + '</div>',
    '</td></tr><tr><td style="padding:22px 28px 30px"><div style="border-top:1px solid #354139;padding-top:20px;color:#BCC9C0;font-size:12px;line-height:1.7">',
    '<img src="https://lastbenchbd.com/assets/logo-full.png" alt="Last Bench — Creating a Lasting Benchmark" width="140" style="display:block;max-width:70%;height:auto;background:#101110;border-radius:5px;padding:7px;margin-bottom:13px;border:0">',
    'CLASS[Λ] · Last Bench<br><a href="mailto:info@lastbenchbd.com" style="color:#89E3A6;text-decoration:underline">info@lastbenchbd.com</a>',
    '</div></td></tr></table></td></tr></table></body></html>'
  ].join("");
}
export function classAPlainText(html: string): string {
  return html.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,(_match,href,label)=>label+" ("+href+")")
    .replace(/<br\s*\/?\s*>/gi,"\n")
    .replace(/<\/(?:p|h[1-6]|tr|table|div)>/gi,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ").replace(/&lt;/gi,"<").replace(/&gt;/gi,">")
    .replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&amp;/gi,"&")
    .replace(/[ \t]+/g," ").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
