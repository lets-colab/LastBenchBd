(() => {
  'use strict';

  const ALIGNMENT_VERSION = '2026-09-10';
  const PARTNER_WHATSAPP = 'https://wa.me/8801300801785?text=I%20want%20to%20learn%20about%20the%20Last%20Bench%20partner%20pathway.';
  let enforcing = false;

  const COPY = {
    en: {
      kicker: 'THE LAST BENCH JOURNEY',
      titleA: 'STUDY. SETTLE.', titleB: 'SUCCEED.',
      lede: 'Last Bench is a student accelerator and technology-enabled journey platform — not a traditional consultancy. Malaysia is the first corridor. We help Bangladeshi students move from confusion to a clear, trackable next step and continue supporting them after arrival.',
      steps: [
        ['DISCOVER', 'Goals, profile, budget and intake.'],
        ['MATCH', 'Realistic courses and institutions.'],
        ['APPLY', 'Documents, application and offer.'],
        ['SECURE', 'Visa, payments and readiness.'],
        ['PREPARE', 'Travel and pre-departure support.'],
        ['ARRIVE', 'Settlement, community and first steps.'],
      ],
      services: ['University selection','Malaysia admissions','Visa guidance','Scholarship verification','Pre-departure','Settlement + community'],
      start: 'START MY JOURNEY', track: 'TRACK MY JOURNEY', partner: 'TUTOR / COACHING / EDUCATION PARTNER →',
      trust: 'TRANSPARENCY RULE — No visa guarantees. No fixed scholarship or admission promises. Fees, intakes, eligibility and partner offers can change and must be verified before a student acts. Every operational promise should have an owner, status and evidence.',
      university: 'UNIVERSITY EXPLORER — These are research options, not a claim that every listed institution is a current Last Bench partner. Programme availability, fees, English requirements, intakes, scholarships and eligibility must be verified against current official information before application.',
      beyondKicker: 'BEYOND ARRIVAL', beyondA: 'THE RELATIONSHIP', beyondB: 'CONTINUES.',
      beyondLede: 'Admission is not the finish line. Last Bench is designed to keep the same relationship and context after the flight lands — from settling in Malaysia to belonging, progressing and eventually helping the next person move forward.',
      beyond: [
        ['SETTLE','Practical first steps and local orientation.'],
        ['BELONG','Peer support, events and trusted community.'],
        ['PROGRESS','Modern capability pathways when active and relevant.'],
        ['RETURN','Stories, referrals, mentoring and opportunity.'],
      ],
      portal: 'SEE HOW LAST BENCH WORKS →', portalAria: 'See how the Last Bench student journey works',
    },
    bn: {
      kicker: 'লাস্ট বেঞ্চ শিক্ষার্থী যাত্রা',
      titleA: 'পড়ুন। থিতু হোন।', titleB: 'সফল হোন।',
      lede: 'লাস্ট বেঞ্চ একটি স্টুডেন্ট অ্যাক্সেলারেটর ও প্রযুক্তি-সমর্থিত জার্নি প্ল্যাটফর্ম — প্রচলিত কনসালটেন্সি নয়। প্রথম করিডর বাংলাদেশ থেকে মালয়েশিয়া। আমরা বিভ্রান্তি থেকে একটি পরিষ্কার, ট্র্যাকযোগ্য পরবর্তী ধাপে যেতে সাহায্য করি এবং পৌঁছানোর পরেও পাশে থাকি।',
      steps: [
        ['DISCOVER','লক্ষ্য, প্রোফাইল, বাজেট ও ইনটেক বুঝুন।'],
        ['MATCH','বাস্তবসম্মত কোর্স ও প্রতিষ্ঠান মিলিয়ে নিন।'],
        ['APPLY','ডকুমেন্ট, আবেদন ও অফার এগিয়ে নিন।'],
        ['SECURE','ভিসা, পেমেন্ট ও প্রস্তুতি নিশ্চিত করুন।'],
        ['PREPARE','ভ্রমণ ও প্রি-ডিপারচার প্রস্তুতি নিন।'],
        ['ARRIVE','সেটেলমেন্ট, কমিউনিটি ও প্রথম পদক্ষেপ।'],
      ],
      services: ['ইউনিভার্সিটি নির্বাচন','মালয়েশিয়া অ্যাডমিশন','ভিসা গাইডেন্স','স্কলারশিপ যাচাই','প্রি-ডিপারচার','সেটেলমেন্ট + কমিউনিটি'],
      start: 'আমার যাত্রা শুরু করুন', track: 'আমার যাত্রা ট্র্যাক করুন', partner: 'টিউটর / কোচিং / এডুকেশন পার্টনার →',
      trust: 'স্বচ্ছতার নিয়ম — ভিসার গ্যারান্টি নেই। নির্দিষ্ট স্কলারশিপ বা অ্যাডমিশনের প্রতিশ্রুতি নেই। ফি, ইনটেক, যোগ্যতা ও পার্টনার অফার বদলাতে পারে; সিদ্ধান্তের আগে বর্তমান তথ্য যাচাই করতে হবে। প্রতিটি অপারেশনাল প্রতিশ্রুতির মালিক, স্ট্যাটাস ও প্রমাণ থাকা উচিত।',
      university: 'ইউনিভার্সিটি এক্সপ্লোরার — এগুলো গবেষণার অপশন; তালিকায় থাকা মানেই প্রতিষ্ঠানটি বর্তমানে লাস্ট বেঞ্চের পার্টনার নয়। প্রোগ্রাম, ফি, ইংরেজি শর্ত, ইনটেক, স্কলারশিপ ও যোগ্যতা আবেদনের আগে বর্তমান অফিসিয়াল সূত্র থেকে যাচাই করুন।',
      beyondKicker: 'পৌঁছানোর পরেও', beyondA: 'সম্পর্কটি', beyondB: 'চলতে থাকে।',
      beyondLede: 'অ্যাডমিশন শেষ ধাপ নয়। মালয়েশিয়ায় পৌঁছানোর পর সেটেল হওয়া, কমিউনিটিতে যুক্ত হওয়া, এগিয়ে যাওয়া এবং পরে অন্য কাউকে পথ দেখানো পর্যন্ত একই সম্পর্ক ও প্রেক্ষাপট ধরে রাখাই লাস্ট বেঞ্চের লক্ষ্য।',
      beyond: [
        ['SETTLE','বাস্তব প্রথম পদক্ষেপ ও স্থানীয় ওরিয়েন্টেশন।'],
        ['BELONG','পিয়ার সাপোর্ট, ইভেন্ট ও বিশ্বস্ত কমিউনিটি।'],
        ['PROGRESS','সক্রিয় ও প্রাসঙ্গিক হলে আধুনিক স্কিল পথ।'],
        ['RETURN','গল্প, রেফারেল, মেন্টরিং ও সুযোগ।'],
      ],
      portal: 'লাস্ট বেঞ্চ কীভাবে কাজ করে →', portalAria: 'লাস্ট বেঞ্চ শিক্ষার্থী যাত্রা কীভাবে কাজ করে দেখুন',
    }
  };

  const css = `
    .lbp-shell{position:relative;z-index:2;width:min(1180px,calc(100% - 36px));margin:0 auto;color:#F2F7F3;font-family:var(--lb-font-body,'Sora','Hind Siliguri',system-ui,sans-serif)}
    .lbp-panel{position:relative;overflow:hidden;border:1px solid rgba(0,200,83,.28);border-radius:28px;background:linear-gradient(145deg,rgba(4,20,11,.94),rgba(6,17,11,.78));box-shadow:0 28px 90px rgba(0,0,0,.38);backdrop-filter:blur(18px);padding:clamp(24px,5vw,58px)}
    .lbp-panel:before{content:'';position:absolute;inset:-40% auto auto 58%;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,rgba(0,200,83,.16),transparent 68%);pointer-events:none}
    .lbp-kicker{font-size:11px;font-weight:700;letter-spacing:.21em;color:#00E676;text-transform:uppercase;margin-bottom:14px}
    .lbp-title{font-family:var(--lb-font-display,'Sora','Hind Siliguri',sans-serif);font-size:clamp(30px,5vw,64px);line-height:1.02;letter-spacing:-.025em;margin:0;max-width:13ch;color:#fff}.lbp-title span{color:#00C853}
    .lbp-lede{max-width:760px;margin:18px 0 0;font-size:clamp(14px,1.5vw,17px);line-height:1.72;color:rgba(242,247,243,.82)}
    .lbp-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:32px 0 0}.lbp-step{min-height:132px;padding:16px 14px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035);display:flex;flex-direction:column;justify-content:space-between}.lbp-num{font:700 10px/1 var(--lb-font-body,'Sora',sans-serif);letter-spacing:.18em;color:rgba(242,247,243,.38)}.lbp-step strong{font-family:var(--lb-font-display,'Sora','Hind Siliguri',sans-serif);font-size:17px;letter-spacing:.02em;color:#fff}.lbp-step span{font-size:11.5px;line-height:1.45;color:rgba(242,247,243,.58)}
    .lbp-services{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0}.lbp-services span{border:1px solid rgba(0,200,83,.24);border-radius:999px;padding:9px 12px;background:rgba(0,200,83,.06);font-size:11px;font-weight:600;letter-spacing:.03em;color:rgba(242,247,243,.82)}
    .lbp-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px;align-items:center}.lbp-btn{min-height:48px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:0 20px;text-decoration:none;font-size:11.5px;font-weight:800;letter-spacing:.07em}.lbp-btn-primary{background:#00C853;color:#04140b;box-shadow:0 10px 30px rgba(0,200,83,.28)}.lbp-btn-secondary{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);color:#fff}.lbp-partner{color:#00E676;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.05em;padding:12px 2px}
    .lbp-trust{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);font-size:11px;line-height:1.65;color:rgba(242,247,243,.48)}
    .lbp-university-note{position:relative;z-index:3;width:min(1180px,calc(100% - 44px));margin:0 auto 26px;padding:14px 16px;border-left:2px solid #00C853;background:rgba(4,20,11,.68);backdrop-filter:blur(10px);font:500 11.5px/1.65 var(--lb-font-body,'Sora','Hind Siliguri',sans-serif);color:rgba(242,247,243,.67)}
    .lbp-beyond{position:relative;z-index:2;padding:12vh 0 4vh}.lbp-beyond .lbp-panel{background:linear-gradient(145deg,rgba(6,16,10,.9),rgba(11,22,16,.76))}.lbp-beyond-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:28px}.lbp-beyond-card{padding:17px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035)}.lbp-beyond-card strong{display:block;font-family:var(--lb-font-display,'Sora','Hind Siliguri',sans-serif);font-size:18px;color:#fff;margin-bottom:6px}.lbp-beyond-card span{font-size:11.5px;line-height:1.5;color:rgba(242,247,243,.6)}
    @media(max-width:900px){.lbp-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lbp-beyond-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:600px){.lbp-shell{width:min(100% - 22px,1180px)}.lbp-panel{border-radius:22px;padding:24px 18px}.lbp-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.lbp-step{min-height:118px;padding:14px 12px}.lbp-beyond-grid{grid-template-columns:1fr 1fr;gap:8px}.lbp-actions{align-items:stretch}.lbp-btn{width:100%;box-sizing:border-box}.lbp-partner{text-align:center;width:100%}.lbp-university-note{width:calc(100% - 28px);box-sizing:border-box}}
    @media(prefers-reduced-motion:reduce){.lbp-panel{backdrop-filter:none}}
  `;

  function currentLanguage() {
    const visible = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return /[\u0980-\u09FF]/.test(visible) ? 'bn' : 'en';
  }

  function addStyles() {
    if (document.getElementById('lbp-styles')) return;
    const style = document.createElement('style'); style.id = 'lbp-styles'; style.textContent = css; document.head.appendChild(style);
  }

  function journeyMarkup(lang) {
    const c = COPY[lang];
    const steps = c.steps.map((step, i) => `<div class="lbp-step"><div class="lbp-num">${String(i + 1).padStart(2,'0')}</div><strong>${step[0]}</strong><span>${step[1]}</span></div>`).join('');
    const services = c.services.map((s) => `<span>${s}</span>`).join('');
    return `<div class="lbp-panel"><div class="lbp-kicker">${c.kicker}</div><h2 class="lbp-title" id="lbp-journey-title">${c.titleA} <span>${c.titleB}</span></h2><p class="lbp-lede">${c.lede}</p><div class="lbp-grid" aria-label="Six Last Bench journey milestones">${steps}</div><div class="lbp-services">${services}</div><div class="lbp-actions"><a class="lbp-btn lbp-btn-primary" href="#signup">${c.start}</a><a class="lbp-btn lbp-btn-secondary" href="/app/">${c.track}</a><a class="lbp-partner" href="${PARTNER_WHATSAPP}" target="_blank" rel="noopener">${c.partner}</a></div><div class="lbp-trust">${c.trust}</div></div>`;
  }

  function beyondMarkup(lang) {
    const c = COPY[lang];
    const cards = c.beyond.map((item) => `<div class="lbp-beyond-card"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('');
    return `<div class="lbp-shell"><div class="lbp-panel"><div class="lbp-kicker">${c.beyondKicker}</div><h2 class="lbp-title" id="lbp-beyond-title">${c.beyondA} <span>${c.beyondB}</span></h2><p class="lbp-lede">${c.beyondLede}</p><div class="lbp-beyond-grid">${cards}</div></div></div>`;
  }

  function newJourney(lang) {
    const section = document.createElement('section'); section.id = 'lb-journey-os'; section.className = 'lbp-shell'; section.dataset.lang = lang; section.setAttribute('aria-labelledby','lbp-journey-title'); section.style.padding = '10vh 0 12vh'; section.innerHTML = journeyMarkup(lang); return section;
  }

  function newBeyond(lang) {
    const section = document.createElement('section'); section.id = 'lb-beyond-arrival'; section.className = 'lbp-beyond'; section.dataset.lang = lang; section.setAttribute('aria-labelledby','lbp-beyond-title'); section.innerHTML = beyondMarkup(lang); return section;
  }

  function getScreens() { return Array.from(document.querySelectorAll('[data-screen-label]')); }
  function findCampusSection() { return getScreens().find((el) => /universit|campus/i.test(el.getAttribute('data-screen-label') || '')) || null; }

  function alignPrimaryCTA(lang) {
    const el = document.querySelector('.lb-class-portal'); if (!el) return;
    const c = COPY[lang];
    if (el.getAttribute('href') !== '#lb-journey-os') el.setAttribute('href','#lb-journey-os');
    if (el.getAttribute('aria-label') !== c.portalAria) el.setAttribute('aria-label',c.portalAria);
    if (el.textContent !== c.portal) el.textContent = c.portal;
  }

  function sanitizeUniversityClaims(campusSection) {
    if (!campusSection) return;
    const replacements = [
      ['You’re flying between the Petronas Towers. Below you: the fifteen campuses Last Bench works with, with what they cost and what they ask. Tap any card to walk its campus in 360°.','You’re flying between the Petronas Towers. Below you: fifteen Malaysian campuses to research, with Last Bench planning estimates to help you compare. Tap any card to explore the campus in 360°.'],
      ["You're flying between the Petronas Towers. Below you: the fifteen campuses Last Bench works with, with what they cost and what they ask. Tap any card to walk its campus in 360°.","You're flying between the Petronas Towers. Below you: fifteen Malaysian campuses to research, with Last Bench planning estimates to help you compare. Tap any card to explore the campus in 360°."],
      ['আপনি পেট্রোনাস টাওয়ারের মাঝ দিয়ে উড়ছেন। নিচে: লাস্ট বেঞ্চ যে পনেরোটি ক্যাম্পাসে কাজ করে — খরচ ও শর্তসহ। যেকোনো কার্ডে ট্যাপ করে ৩৬০° ঘুরে দেখুন।','আপনি পেট্রোনাস টাওয়ারের মাঝ দিয়ে উড়ছেন। নিচে: গবেষণা ও তুলনার জন্য মালয়েশিয়ার পনেরোটি ক্যাম্পাস। দেখানো খরচ ও শর্ত পরিকল্পনা-তথ্য; আবেদন করার আগে বর্তমান অফিসিয়াল তথ্য যাচাই করুন।'],
      ['ONE HONEST LIST.','ONE RESEARCH LIST.'],['একটি সৎ তালিকা।','গবেষণার একটি তালিকা।']
    ];
    const walker = document.createTreeWalker(campusSection,NodeFilter.SHOW_TEXT); const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    for(const node of nodes){let next=node.nodeValue||''; for(const [from,to] of replacements) next=next.replace(from,to); if(next!==node.nodeValue) node.nodeValue=next;}
  }

  function ensureUniversityDisclosure(campusSection, lang) {
    if (!campusSection) return;
    let note = document.querySelector('.lbp-university-note');
    if (!note) { note=document.createElement('aside'); note.className='lbp-university-note'; note.setAttribute('aria-label','University data verification notice'); campusSection.parentNode.insertBefore(note,campusSection); }
    if (note.dataset.lang !== lang) { note.dataset.lang=lang; note.textContent=COPY[lang].university; }
  }

  function updateMetadata() {
    document.documentElement.dataset.businessBlueprintAligned=ALIGNMENT_VERSION;
    window.__LB_BLUEPRINT_ALIGNMENT__={version:ALIGNMENT_VERSION,currentEngine:'mobility',corridor:'Bangladesh-Malaysia'};
    const meta=document.querySelector('meta[name="description"]');
    if(meta) meta.setAttribute('content','Last Bench helps Bangladeshi students study, settle and succeed in Malaysia with transparent university selection, admissions, visa guidance, pre-departure support, journey tracking and community after arrival.');
  }

  function ensureBusinessLayer() {
    if (enforcing) return; enforcing=true;
    try {
      addStyles(); updateMetadata();
      const lang=currentLanguage(); const campusSection=findCampusSection(); const signup=document.getElementById('signup');
      alignPrimaryCTA(lang); sanitizeUniversityClaims(campusSection);

      let journey=document.getElementById('lb-journey-os');
      if(!journey){journey=newJourney(lang); if(campusSection?.parentNode) campusSection.parentNode.insertBefore(journey,campusSection); else if(signup?.parentNode) signup.parentNode.insertBefore(journey,signup); else document.body.appendChild(journey);}
      else if(journey.dataset.lang!==lang){journey.dataset.lang=lang; journey.innerHTML=journeyMarkup(lang);}

      ensureUniversityDisclosure(campusSection,lang);

      let beyond=document.getElementById('lb-beyond-arrival');
      if(!beyond && signup?.parentNode){beyond=newBeyond(lang); signup.parentNode.insertBefore(beyond,signup);}
      else if(beyond && beyond.dataset.lang!==lang){beyond.dataset.lang=lang; beyond.innerHTML=beyondMarkup(lang);}
    } finally { enforcing=false; }
  }

  function mount() {
    ensureBusinessLayer();
    const root=document.getElementById('dc-root')||document.body;
    const observer=new MutationObserver(()=>queueMicrotask(ensureBusinessLayer));
    observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['href','aria-label']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();