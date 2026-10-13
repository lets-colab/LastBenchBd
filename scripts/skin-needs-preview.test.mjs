import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const html=readFileSync(new URL("../landing/showcase/skin-needs/index.html",import.meta.url),"utf8");
const between=(from,to)=>{const a=html.indexOf(from),b=html.indexOf(to,a+from.length);assert.ok(a>=0&&b>a,"Expected boundary absent");return html.slice(a+from.length,b)};
const db=JSON.parse(between("const DB=",";\nconst $="));
test("isolated, non-transactional and search-engine excluded",()=>{
 assert.match(html,/Private concept demonstration/i);
 assert.match(html,/Not an official store/i);
 assert.match(html,/Checkout disabled/i);
 assert.match(html,/noindex,nofollow,noarchive/i);
 assert.doesNotMatch(html,/<form[^>]+action=/i);
});
test("embedded original photographed logo is a valid PNG",()=>{
 const m=html.match(/<img src="data:image\/png;base64,([A-Za-z0-9+/=]+)" alt="The Skin Needs Co/);
 assert.ok(m&&m[1].length>3000,"Card-derived logo missing");
 const binary=Buffer.from(m[1],"base64");
 assert.equal(binary.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
});
test("all candidates remain unsellable until actual merchant verification",()=>{
 assert.equal(db.meta.records,138);
 assert.equal(db.meta.verifiedSellableSkus,0);
 assert.equal(db.meta.merchantApproved,false);
 assert.equal(db.items.length,138);
 assert.equal(new Set(db.items.map(p=>p.id)).size,138);
 for(const p of db.items){assert.equal(p.price,null);assert.equal(p.stock,"UNKNOWN");assert.equal(p.approved,false);assert.ok(p.photoIds);}
});
test("three scroll chapters with defensive, accessible motion",()=>{
 assert.match(html,/data-chapter="0"/);assert.match(html,/data-chapter="1"/);assert.match(html,/data-chapter="2"/);
 assert.match(html,/progress=clamp/);assert.match(html,/webglcontextlost/);
 assert.match(html,/try\{gl=canvas.getContext/);
 assert.match(html,/prefers-reduced-motion: reduce/);
 assert.match(html,/ResizeObserver/);
 assert.match(html,/cinema-fallback/);
});
test("mobile accessibility and privacy invariants",()=>{
 assert.match(html,/Skip to catalog/);
 assert.match(html,/min-height:40px/);
 assert.match(html,/role="group" aria-label="Filter by category"/);
 assert.match(html,/No payment processing · No data collection · No checkout/);
 assert.doesNotMatch(html,/https:\/\/(?:js\.stripe\.com|checkout\.stripe\.com|api\.sslcommerz\.com)/);
});