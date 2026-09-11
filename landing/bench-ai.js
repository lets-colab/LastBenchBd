(() => {
  'use strict';

  const CONTACT_PRIMARY = '01300 801785';
  const CONTACT_SECONDARY = '01726 494917';
  const CONTACT_EMAIL = 'info@lastbenchbd.com';

  // Keep the business/blueprint layer separate from the Claude Design runtime.
  // The homepage already loads Bench AI, so this is the smallest safe integration
  // point that preserves the verified design export while adding current product logic.
  if (!document.querySelector('script[data-lb-blueprint]')) {
    const blueprint = document.createElement('script');
    blueprint.src = './lastbench-blueprint.js';
    blueprint.dataset.lbBlueprint = 'true';
    blueprint.async = false;
    document.head.appendChild(blueprint);
  }

  const css = `
    .lb-ai-launcher{position:fixed;right:18px;bottom:18px;z-index:90;width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;background:#00C853;color:#04140b;box-shadow:0 12px 38px rgba(0,200,83,.42);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;background-color .2s ease}
    .lb-ai-launcher:hover{transform:translateY(-2px);box-shadow:0 16px 44px rgba(0,200,83,.56);background:#00E676}
    .lb-ai-launcher:focus-visible,.lb-ai-panel button:focus-visible,.lb-ai-panel input:focus-visible{outline:2px solid #fff;outline-offset:3px}
    .lb-ai-panel{position:fixed;right:16px;bottom:88px;z-index:90;width:min(390px,calc(100vw - 24px));max-height:min(620px,calc(100dvh - 108px));display:none;flex-direction:column;overflow:hidden;border:1px solid rgba(0,200,83,.34);border-radius:20px;background:rgba(3,12,7,.965);backdrop-filter:blur(18px);box-shadow:0 28px 90px rgba(0,0,0,.62);color:#F2F7F3;font-family:var(--lb-font-body,'Sora','Hind Siliguri',system-ui,sans-serif)}
    .lb-ai-panel[data-open="true"]{display:flex}
    .lb-ai-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.09)}
    .lb-ai-title{display:flex;align-items:center;gap:9px;min-width:0}.lb-ai-dot{width:8px;height:8px;border-radius:50%;background:#00E676;box-shadow:0 0 10px #00E676;flex:none}
    .lb-ai-name{font-family:var(--lb-font-display,'Sora',sans-serif);font-weight:700;font-size:14px;letter-spacing:.08em}.lb-ai-status{font-size:9px;letter-spacing:.12em;color:rgba(242,247,243,.48);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .lb-ai-close{border:0;background:transparent;color:rgba(255,255,255,.68);font-size:22px;line-height:1;padding:4px 6px;cursor:pointer}
    .lb-ai-log{min-height:220px;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
    .lb-ai-msg{max-width:86%;padding:11px 13px;border-radius:14px;font-size:13px;line-height:1.55;white-space:pre-wrap}.lb-ai-msg.ai{align-self:flex-start;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);color:rgba(242,247,243,.9)}.lb-ai-msg.user{align-self:flex-end;background:#00C853;color:#04140b;font-weight:600}
    .lb-ai-chips{display:flex;gap:7px;flex-wrap:wrap;padding:0 16px 12px}.lb-ai-chip{border:1px solid rgba(0,200,83,.28);background:rgba(0,200,83,.07);color:#00E676;border-radius:999px;padding:8px 10px;font:600 11px/1 var(--lb-font-body,'Sora',sans-serif);cursor:pointer}
    .lb-ai-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.14)}
    .lb-ai-input{min-width:0;flex:1;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(0,0,0,.34);color:#fff;padding:12px 13px;font:500 13px/1.4 var(--lb-font-body,'Sora',sans-serif)}.lb-ai-input::placeholder{color:rgba(242,247,243,.42)}
    .lb-ai-send{border:0;border-radius:12px;background:#00C853;color:#04140b;min-width:48px;padding:0 14px;font-weight:800;cursor:pointer}
    .lb-ai-note{padding:0 16px 13px;color:rgba(242,247,243,.42);font-size:9px;line-height:1.45;letter-spacing:.05em}
    @media(max-width:600px){.lb-ai-launcher{right:12px;bottom:12px;width:52px;height:52px}.lb-ai-panel{right:8px;bottom:72px;width:calc(100vw - 16px);max-height:calc(100dvh - 84px)}}
    @media(prefers-reduced-motion:reduce){.lb-ai-launcher,.lb-ai-log{transition:none;scroll-behavior:auto}}
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.className = 'lb-ai-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Chat with Bench AI');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 19V8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4z" fill="currentColor"/><circle cx="10" cy="11.5" r="1.5" fill="#00E676"/><circle cx="15.5" cy="11.5" r="1.5" fill="#00E676"/></svg>';

  const panel = document.createElement('section');
  panel.className = 'lb-ai-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Bench AI study guidance');
  panel.setAttribute('data-open', 'false');
  panel.innerHTML = `
    <div class="lb-ai-head">
      <div class="lb-ai-title"><span class="lb-ai-dot"></span><div><div class="lb-ai-name">BENCH AI</div><div class="lb-ai-status">GUIDANCE · VERIFY BEFORE APPLYING</div></div></div>
      <button class="lb-ai-close" type="button" aria-label="Close Bench AI">×</button>
    </div>
    <div class="lb-ai-log" aria-live="polite"></div>
    <div class="lb-ai-chips"></div>
    <form class="lb-ai-form">
      <label style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)" for="lb-ai-input">Ask Bench AI</label>
      <input id="lb-ai-input" class="lb-ai-input" autocomplete="off" maxlength="700" placeholder="Ask about your journey, universities, visa…">
      <button class="lb-ai-send" type="submit" aria-label="Send message">→</button>
    </form>
    <div class="lb-ai-note">Bench AI gives orientation, not guarantees. Verify current fees, entry requirements, scholarships, partner offers and visa rules with official sources before acting.</div>`;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const close = panel.querySelector('.lb-ai-close');
  const log = panel.querySelector('.lb-ai-log');
  const chips = panel.querySelector('.lb-ai-chips');
  const form = panel.querySelector('.lb-ai-form');
  const input = panel.querySelector('.lb-ai-input');
  const history = [];
  let seeded = false;

  const addMessage = (role, text) => {
    const el = document.createElement('div');
    el.className = `lb-ai-msg ${role}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  };

  const setChips = (items) => {
    chips.replaceChildren();
    items.forEach((label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb-ai-chip';
      b.textContent = label;
      b.addEventListener('click', () => send(label));
      chips.appendChild(b);
    });
  };

  const fallback = (text) => {
    const t = text.toLowerCase();
    if (/journey|how.*work|process|next step|milestone/.test(t)) return 'The Last Bench mobility journey is: Discover → Match → Apply → Secure → Prepare → Arrive. The goal is that you always know your current stage, next milestone and what evidence is still needed. If you are already registered, open the Journey OS at /app/.';
    if (/status|track|tracking|application progress/.test(t)) return 'If you already joined Last Bench, use the Journey OS at /app/ to track your application. Important status changes should show a next step and evidence rather than leaving you inside a WhatsApp-only process.';
    if (/settle|settlement|arrival|arrive|housing|sim|bank|community|belong/.test(t)) return 'Last Bench is designed to continue after admission and arrival. The current promise includes pre-departure preparation, practical settlement guidance and community support in Malaysia — not only university application processing.';
    if (/partner|tutor|coaching|ielts center|agent|recruiter|counsellor|counselor/.test(t)) return `Last Bench has a partner pathway for tutors, coaching/IELTS centers, counsellors and education partners. Ask the team for current onboarding and commercial terms on WhatsApp: ${CONTACT_PRIMARY} or email ${CONTACT_EMAIL}. Terms should be confirmed before anyone represents an offer to students.`;
    if (/class.?a|class\[|class lambda|co\.lab|colab/.test(t)) return 'CLASS[Λ] and co.lab are progression wings in the wider Last Bench blueprint. The public mobility promise comes first: study, settle and succeed in Malaysia. Capability or venture pathways should only be introduced when they are active and relevant to the person.';
    if (/visa|emgs/.test(t)) return 'Visa outcomes cannot be promised. They depend on your documents, EMGS processing and the relevant authorities. A Last Bench mentor can help you identify missing documents and verify the current process.';
    if (/scholar|discount|rebate/.test(t)) return 'Scholarships, rebates and discounts change by intake, programme and eligibility. I will not promise a percentage without a current official source. Share your results and intended intake and a mentor can help verify available offers.';
    if (/fee|cost|tuition|budget/.test(t)) return 'Fees vary by university, programme and intake, and can change. Tell me your field, qualification, budget range and preferred intake; I can help you structure a shortlist, then the team should verify the current official fee.';
    if (/ielts|english/.test(t)) return 'English requirements vary by university and programme. Check the current programme requirement or offer conditions; a mentor can help you interpret them.';
    if (/which|best|fit|match|recommend|university|uni\b/.test(t)) return 'A useful Malaysia shortlist starts with four things: intended field, academic results, budget and intake. Send those four and I can help structure the comparison without inventing current requirements. A university shown on this website is a research option, not automatically a claim of a current Last Bench partnership.';
    if (/human|mentor|call|whatsapp|contact|talk/.test(t)) return `A human mentor can review your profile. WhatsApp Last Bench at ${CONTACT_PRIMARY} or ${CONTACT_SECONDARY}, email ${CONTACT_EMAIL}, or use the “Take Your Seat” form on this page.`;
    return 'I can help you understand your next step in the Bangladesh → Malaysia journey, structure university research and prepare better questions. I will not invent current fees, visa odds, scholarship percentages, partner offers or entry requirements. What stage are you at now?';
  };

  const send = async (raw) => {
    const message = String(raw || '').trim();
    if (!message) return;
    input.value = '';
    addMessage('user', message);
    setChips([]);

    const cfg = window.LB_AI || {};
    if (cfg.endpoint) {
      history.push({ role: 'user', content: message });
      try {
        const res = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message, history: history.slice(-12) })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reply = data.reply || data.message || fallback(message);
        history.push({ role: 'assistant', content: reply });
        addMessage('ai', reply);
      } catch (_) {
        addMessage('ai', `I couldn’t reach the live advisor right now. You can WhatsApp the mentor team at ${CONTACT_PRIMARY}.`);
      }
      return;
    }

    window.setTimeout(() => addMessage('ai', fallback(message)), 220);
  };

  const openPanel = () => {
    panel.setAttribute('data-open', 'true');
    launcher.setAttribute('aria-expanded', 'true');
    if (!seeded) {
      seeded = true;
      addMessage('ai', 'Hi — I’m Bench AI. I can help you understand your next step from Discover to Arrive, explore Malaysia study options and prepare the right questions. I’ll flag what needs current verification instead of guessing.');
      setChips(['How the journey works', 'Find my university fit', 'Visa / EMGS', 'Talk to a mentor']);
    }
    window.setTimeout(() => input.focus(), 0);
  };

  const closePanel = () => {
    panel.setAttribute('data-open', 'false');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };

  launcher.addEventListener('click', () => panel.getAttribute('data-open') === 'true' ? closePanel() : openPanel());
  close.addEventListener('click', closePanel);
  form.addEventListener('submit', (event) => { event.preventDefault(); send(input.value); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && panel.getAttribute('data-open') === 'true') closePanel(); });
})();