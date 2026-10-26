import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = (name: string) => resolve(root, name);
const html = readFileSync(file('landing/co-lab/index.html'), 'utf8');

describe('canonical co.lab release mirror', () => {
  it('ships the white-gallery source as a real internal route, not a retired Lovable link', () => {
    const entry = readFileSync(file('landing/index.html'), 'utf8');
    expect(entry).toContain('class="gate gate-colab" href="co-lab/"');
    expect(entry).not.toContain('co-lab-growth-os.lovable.app');
    expect(html).toContain('co.lab — The Growth Operating System for Modern Brands');
    expect(html).toContain('id="root"');
    expect(html).toContain('Collaboration.');
    expect(existsSync(file('landing/co-lab/creators/index.html'))).toBe(true);
  });

  it('keeps the exact official co.lab logo bytes and all built entry assets', () => {
    const logo = readFileSync(file('landing/co-lab/assets/logo-black-trim-BpRXKfAO.png'));
    expect(createHash('sha256').update(logo).digest('hex')).toBe('5db60a3d919b6d5a72ef18f8df20ff45159764ae3e2a9be97461c867925770af');
    const refs = [...html.matchAll(/(?:src|href)="(\/co-lab\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
    expect(refs.length).toBeGreaterThanOrEqual(2);
    for (const ref of refs) expect(existsSync(file('landing' + ref)), `Missing co.lab asset: ${ref}`).toBe(true);
  });
});
