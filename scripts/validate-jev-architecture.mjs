import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const contract=JSON.parse(fs.readFileSync(path.join(root,'architecture/JEV_VERSION.json'),'utf8'));
const requiredVersion='2026.09.29';
if(contract.currentVersion!==requiredVersion || contract.minimumReleaseVersion!==requiredVersion){
  console.error('JEV version contract mismatch. Current/minimum must be '+requiredVersion);
  process.exit(1);
}

const activeFiles=[
 'PRODUCT.md','README.md','AGENT.md','AGENTS.md','design.md','SITE_BLUEPRINT.md',
 'CHATGPT_SITE_PUBLISH.md','content/CONTENT_OS.md','brand/last-bench/BRAND_BLUEPRINT.md',
 'brand/last-bench/ART_DIRECTION.md','design-system/README.md','design-system/tokens.json',
 'landing/index.html','landing/lastbench-blueprint.js','landing/bench-ai.js'
];
const retired=[
 /Last Bench is an Opportunity Accelerator/i,
 /three (?:independent )?operating engines/i,
 /Community \+ Platform connects/i,
 /CLASS\[Λ\] is the capability engine/i,
 /co\.lab is the business\s*&\s*growth engine/i
];
let failed=false;
for(const file of activeFiles){
 const full=path.join(root,file);
 if(!fs.existsSync(full)) continue;
 const text=fs.readFileSync(full,'utf8');
 for(const pattern of retired){
  if(pattern.test(text)){
   console.error('JEV RELEASE REJECT: retired current architecture in '+file+' -> '+pattern);
   failed=true;
  }
 }
}
const required={
 'PRODUCT.md':['Last Bench is the company','CLASS[Λ] — Human Lab','co.lab — Business Lab','Co.MPASS','Founder Second Brain'],
 'README.md':['Last Bench is the company','CLASS[Λ]','Business Lab','Co.MPASS','Founder Second Brain'],
 'landing/lastbench-blueprint.js':["version:ALIGNMENT_VERSION","company:'Last Bench'","humanLab:'CLASS[Λ]'","businessLab:'co.lab'","dashboard:'Co.MPASS'","founderSecondBrain:'Dr. X'"]
};
for(const [file,terms] of Object.entries(required)){
 const text=fs.readFileSync(path.join(root,file),'utf8');
 for(const term of terms) if(!text.includes(term)){console.error('JEV RELEASE REJECT: '+file+' missing '+term);failed=true;}
}
if(failed) process.exit(1);
console.log('JEV architecture release gate PASS — '+requiredVersion);
