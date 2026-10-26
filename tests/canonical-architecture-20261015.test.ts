import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(p:string)=>readFileSync(resolve(root,p),'utf8');

const canonicalFiles=[
  'PRODUCT.md',
  'SITE_BLUEPRINT.md',
  'AGENTS.md',
  'AGENT.md',
  'README.md',
  'design.md',
  'brand/last-bench/BRAND_BLUEPRINT.md',
];

describe('15 October 2026 founder architecture lock',()=>{
  it('keeps the public gateway aligned to the current entry model',()=>{
    const page=read('landing/index.html');
    expect(page).toContain('Malaysia · Student Mobility');
    expect(page).toContain('Learn to Build');
    expect(page).toContain('Build &amp; Get Accelerated');
    expect(page).toContain('one-person AI-powered business');
    expect(page).toContain('href="#intelligence"');
    expect(read('landing/cinematic.mjs')).toContain('No agent operation is implied');
  });

  it('keeps ProjectX as one incubated student product, never the co.lab Projects category',()=>{
    for(const file of canonicalFiles){
      const text=read(file);
      expect(text,file).not.toContain('ProjectX = Website Projects');
      expect(text,file).not.toContain('ProjectX is Website Projects');
    }
    const product=read('PRODUCT.md');
    expect(product).toContain('ProjectX is one incubated student product associated with Abdul Moontakim (Moon Takim)');
    expect(product).toContain('it is not the Projects category and it is not co.lab itself');
  });

  it('locks the capability-to-business progression without guaranteeing outcomes',()=>{
    const product=read('PRODUCT.md');
    expect(product).toContain('teach practical skills → build visible proof → help one person build, launch and operate a one-person AI-powered business');
    expect(product).toContain('not a guarantee of profit, revenue or startup success');
  });

  it('keeps public Dr. X routing consistent with the same architecture',()=>{
    const drx=read('landing/bench-ai.js');
    expect(drx).toContain('CLASS[Λ] is the Last Bench Skill Laboratory — Learn to Build');
    expect(drx).toContain('co.lab is the Last Bench Business Lab — Build & Get Accelerated');
    expect(drx).toContain('ProjectX is one incubated student product, not co.lab itself');
  });

  it('carries the 25 October Skill Laboratory direction through the handoff',()=>{
    for(const file of ['landing/index.html','landing/class-a/index.html','PRODUCT.md','design.md','content/CONTENT_OS.md']){
      const text=read(file);
      expect(text,file).toMatch(/Skill Laboratory/i);
      expect(text,file).not.toMatch(/Human Lab/i);
    }
  });
});
