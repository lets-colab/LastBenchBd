import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(p:string)=>readFileSync(resolve(root,p),'utf8');

describe('Company gateway and Malaysia route separation',()=>{
 it('loads no cinematic runtime until a public route is chosen',()=>{
  const page=read('landing/index.html');
  expect(page).toContain('href="malaysia/"');
  expect(page).toContain('href="class-a/"');
  expect(page).toContain('https://colab-growth-os.onrender.com/');
  expect(page).toContain('Malaysia · Student Mobility');
  expect(page).toContain('CLASS[Λ] · HUMAN LAB');
  expect(page).toContain('co.lab · BUSINESS LAB');
  expect(page).not.toMatch(/<canvas|<x-dc|three\.min|bench-ai|claude-design-support/);
 });

 it('keeps Co.MPASS and Dr. X below the public service/lab gates',()=>{
  const page=read('landing/index.html');
  expect(page).toContain('Founder intelligence layer');
  expect(page).toContain('<b>Co.MPASS</b>');
  expect(page).toContain('<b>Dr. X</b>');
  expect(page).toContain('Co.MPASS and Dr. X are not public service routes');
  expect(page).toContain('Founder access');
  expect(page).not.toContain('href="https://co-mpass.onrender.com');
  expect(page).not.toContain('href="https://drx.lastbenchbd.com');
 });

 it('enters the Malaysia journey once, with a real return path and existing local assets',()=>{
  const page=read('landing/malaysia/index.html');
  expect(page).not.toContain('id="lb-company"');
  expect(page).not.toContain('href="#lb-company"');
  expect(page).toContain('href="../"');
  expect(page).toContain('id="signup"');
  expect(page).toContain('contact_consent: true');
  expect(page).not.toContain('<image-slot');
  for(const m of page.matchAll(/(?:src|href)="(\.\.\/[^"?#]+\.(?:js|css|png|jpg|svg))"/g)) {
   expect(existsSync(resolve(root,'landing/malaysia',m[1])),m[1]).toBe(true);
  }
 });

 it('keeps shared deep links and future design promotion on the Malaysia route',()=>{
  expect(read('landing/company-routes.js')).toContain("'./malaysia/'");
  expect(read('scripts/promote-claude-design-homepage.py')).toContain('TARGET = LANDING / "malaysia" / "index.html"');
  expect(read('landing/lastbench-blueprint.js')).toContain("setAttribute('href','/')");
 });
});
