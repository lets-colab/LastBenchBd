#!/usr/bin/env node
// Static invariants only. Browser and API checks are separate release gates.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const css = fs.readFileSync(path.join(__dirname,'experience.css'),'utf8');
for (const token of ['href="#signup"','href="#universities"','id="signup"','id="universities"','href="../"','../assets/logo-icon.png','{{ travelTo }}','{{ travelToKey }}','{{ openFounder }}','{{ cycleLang }}','{{ toggleRadio }}','{{ signUp }}','{{ openForm }}','{{ t.dataNote }}','for="my-seat-name"','for="my-seat-contact"','name="company"','{{ seatDisplay }}','{{ hasSeatErr }}','../app/','../vendor/three.min.js','hint-placeholder-count="6"']) assert.ok(html.includes(token),token);
for (const token of ['.my-hero-copy','.my-campus','.my-seat','prefers-reduced-motion','#00c853']) assert.ok(css.includes(token),token);
assert.equal((html.match(/id="my-seat-name"/g)||[]).length,1);
assert.equal((html.match(/id="my-seat-contact"/g)||[]).length,1);
console.log('Malaysia static contract passed; runtime not established.');
