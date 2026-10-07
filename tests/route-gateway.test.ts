import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(p:string)=>readFileSync(resolve(root,p),'utf8');

describe('Company gateway and journey separation',()=>{
 it('keeps the parent lightweight while exposing the five approved gates',()=>{
  const page=read('landing/index.html');
  expect(page).toContain('href="malaysia/"');
  expect(page).toContain('href="class-a/"');
  expect(page).toContain('href="colab/"');
  expect(page).toContain('href="compass/"');
  expect(page).toContain('https://drx.lastbenchbd.com/');
  expect(page).toContain('EDUCATION & MOBILITY');
  expect(page).toContain('CLASS[Λ] · HUMAN LAB');
  expect(page).toContain('co.lab · BUSINESS LAB');
  expect(page).toContain('Co.MPASS · DASHBOARD');
  expect(page).toContain('DR. X · FOUNDER INTELLIGENCE');
  expect(page).not.toMatch(/<canvas|<x-dc|three\.min|bench-ai|claude-design-support/);
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
 it('keeps co.lab and Co.MPASS route contracts explicit',()=>{
  expect(read('landing/colab/index.html')).toContain('WHITE GALLERY');
  const compass=read('landing/compass/index.html');
  expect(compass).toContain('BUSINESS DASHBOARD');
  expect(compass).toContain('CONTROLLED ACCESS');
  expect(compass).not.toContain('LIVE DASHBOARD');
 });
 it('keeps shared deep links and future design promotion on the Malaysia route',()=>{
  expect(read('landing/company-routes.js')).toContain("'./malaysia/'");
  expect(read('scripts/promote-claude-design-homepage.py')).toContain('TARGET = LANDING / "malaysia" / "index.html"');
  expect(read('landing/lastbench-blueprint.js')).toContain("setAttribute('href','/')");
 });
});