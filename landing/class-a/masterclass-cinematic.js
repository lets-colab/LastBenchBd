(() => {
  const root = document.documentElement;
  const body = document.body;
  const intro = document.querySelector('[data-intro]');
  const film = document.querySelector('[data-intro-video]');
  const gate = document.querySelector('[data-intro-gate]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer:fine)');
  const INTRO_END_AT = 26.88;
  const LOGO_HOLD_MS = 1050;
  let introTimer = null;
  let introEnding = false;
  let videoFrameToken = null;

  function cancelFrameWatch() {
    if (videoFrameToken !== null && film?.cancelVideoFrameCallback) {
      try { film.cancelVideoFrameCallback(videoFrameToken); } catch (_) {}
    }
    videoFrameToken = null;
  }

  function completeIntro({ instant = false } = {}) {
    clearTimeout(introTimer);
    cancelFrameWatch();
    introEnding = true;
    try { film?.pause(); } catch (_) {}
    body.classList.remove('no-scroll');
    body.classList.add('intro-done');

    if (instant) {
      intro?.classList.add('is-complete');
      return;
    }

    intro?.classList.add('is-exiting');
    introTimer = window.setTimeout(() => intro?.classList.add('is-complete'), 720);
  }

  function holdClassLogo() {
    if (!intro || introEnding) return;
    introEnding = true;
    cancelFrameWatch();
    try { film?.pause(); } catch (_) {}
    intro.classList.add('is-logo-hold');
    introTimer = window.setTimeout(() => completeIntro(), LOGO_HOLD_MS);
  }

  function watchFilmFrame(_now, metadata) {
    if (!film || introEnding || film.paused) return;
    if (metadata?.mediaTime >= INTRO_END_AT) {
      holdClassLogo();
      return;
    }
    if (film.requestVideoFrameCallback) {
      videoFrameToken = film.requestVideoFrameCallback(watchFilmFrame);
    }
  }

  async function playIntro() {
    if (!intro || !film) return;
    clearTimeout(introTimer);
    cancelFrameWatch();
    introEnding = false;
    intro.classList.remove('is-logo-hold', 'is-exiting', 'is-complete');
    intro.classList.add('is-playing');
    film.currentTime = 0;
    film.muted = false;
    film.volume = 1;

    try {
      await film.play();
    } catch (_) {
      film.muted = true;
      await film.play().catch(() => {});
    }

    if (film.requestVideoFrameCallback) {
      videoFrameToken = film.requestVideoFrameCallback(watchFilmFrame);
    }
  }

  document.querySelectorAll('[data-enter]').forEach(btn => btn.addEventListener('click', playIntro));
  document.querySelectorAll('[data-skip]').forEach(btn => btn.addEventListener('click', () => completeIntro({ instant: true })));

  film?.addEventListener('timeupdate', () => {
    if (!introEnding && film.currentTime >= INTRO_END_AT) holdClassLogo();
  });
  film?.addEventListener('ended', holdClassLogo);

  // Allow deterministic screenshots / fast return visits.
  const params = new URLSearchParams(location.search);
  const returnVisit = sessionStorage.getItem('classa_intro_seen') === '1';
  if (reduced.matches || params.get('skip') === '1' || returnVisit) {
    completeIntro({ instant: true });
  } else {
    body.classList.add('no-scroll');
  }

  intro?.addEventListener('transitionend', (event) => {
    if (event.target === intro && intro.classList.contains('is-complete')) {
      sessionStorage.setItem('classa_intro_seen', '1');
    }
  });

  document.querySelectorAll('[data-replay]').forEach(btn => btn.addEventListener('click', () => {
    sessionStorage.removeItem('classa_intro_seen');
    clearTimeout(introTimer);
    cancelFrameWatch();
    introEnding = false;
    intro?.classList.remove('is-complete', 'is-logo-hold', 'is-exiting', 'is-playing');
    body.classList.remove('intro-done');
    body.classList.add('no-scroll');
    gate?.removeAttribute('hidden');
    try { if (film) film.currentTime = 0; } catch (_) {}
  }));

  // Scroll + pointer choreography.
  const journey = document.querySelector('[data-journey]');
  const journeyCopy = document.querySelector('[data-journey-copy]');
  const sceneNumber = document.querySelector('[data-scene-number]');
  const sceneKicker = document.querySelector('[data-scene-kicker]');
  const sceneTitle = document.querySelector('[data-scene-title]');
  const sceneBody = document.querySelector('[data-scene-body]');
  const indices = Array.from(document.querySelectorAll('[data-index]'));
  const scenes = [
    { kicker: 'COMMAND AI', title: 'STOP ASKING.\nSTART DIRECTING.', body: 'AI becomes useful when you stop treating it like a search box and start giving it roles, context, standards and outcomes.' },
    { kicker: 'RESEARCH', title: 'TURN ASSUMPTIONS\nINTO EVIDENCE.', body: 'Use AI to compare markets, pressure-test ideas and surface the evidence that should shape your next decision.' },
    { kicker: 'BUILD', title: 'MOVE FROM IDEA\nTO WORKING MVP.', body: 'Turn direction into a page, workflow, prototype or operating tool you can actually test with real people.' },
    { kicker: 'CREATE', title: 'MAKE THE WORK\nEASY TO UNDERSTAND.', body: 'Translate what you built into clear design, content and a story strong enough for another person to care.' },
    { kicker: 'SELL', title: 'TURN ATTENTION\nINTO ACTION.', body: 'Find the right lead, craft the right message and use AI to support the next commercial move instead of chasing vanity metrics.' },
    { kicker: 'OPERATE', title: 'ONE PERSON.\nA FULL AI TEAM.', body: 'Connect the roles into one operating system: research, build, create, market and sell—with you directing the team.' }
  ];
  let activeScene = -1;
  let raf = 0;

  function renderScene(index) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    if (index === activeScene) return;
    activeScene = index;
    journeyCopy?.classList.add('is-switching');
    window.setTimeout(() => {
      const s = scenes[index];
      if (sceneNumber) sceneNumber.textContent = String(index + 1).padStart(2, '0');
      if (sceneKicker) sceneKicker.textContent = s.kicker;
      if (sceneTitle) sceneTitle.innerHTML = s.title.replace('\n', '<br>');
      if (sceneBody) sceneBody.textContent = s.body;
      indices.forEach((el, i) => el.classList.toggle('is-active', i === index));
      journeyCopy?.classList.remove('is-switching');
    }, 120);
  }

  function updateMotion() {
    raf = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const scrollProgress = Math.min(1, Math.max(0, scrollY / max));
    root.style.setProperty('--scroll-progress', scrollProgress.toFixed(4));
    body.classList.toggle('scrolled', scrollY > 30);

    if (journey) {
      const rect = journey.getBoundingClientRect();
      const travel = Math.max(1, rect.height - innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      root.style.setProperty('--journey-progress', progress.toFixed(4));
      renderScene(Math.min(5, Math.floor(progress * 6)));
    }
  }
  function requestMotion() { if (!raf) raf = requestAnimationFrame(updateMotion); }
  addEventListener('scroll', requestMotion, { passive: true });
  addEventListener('resize', requestMotion, { passive: true });
  updateMotion();

  if (!reduced.matches && finePointer.matches) {
    addEventListener('pointermove', (event) => {
      const x = (event.clientX / innerWidth - .5) * 2;
      const y = (event.clientY / innerHeight - .5) * 2;
      root.style.setProperty('--pointer-x', x.toFixed(3));
      root.style.setProperty('--pointer-y', y.toFixed(3));
    }, { passive: true });
  }

  // Signup portal + existing Supabase table.
  const dialog = document.querySelector('[data-signup]');
  const form = document.querySelector('[data-signup-form]');
  const steps = Array.from(document.querySelectorAll('.signup-step'));
  const stepBars = Array.from(document.querySelectorAll('.steps span'));
  const status = document.querySelector('[data-signup-status]');
  const success = document.querySelector('[data-signup-success]');
  const passCode = document.querySelector('[data-pass-code]');
  const qrCanvas = document.querySelector('[data-qr]');
  let step = 0;

  const SUPABASE_URL = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_';

  function setStep(next) {
    step = Math.max(0, Math.min(steps.length - 1, next));
    steps.forEach((el, i) => el.classList.toggle('is-active', i === step));
    stepBars.forEach((el, i) => el.classList.toggle('is-active', i <= step));
    status.textContent = '';
    status.classList.remove('is-error');
    const focusable = steps[step]?.querySelector('input:not(.honeypot), select');
    window.setTimeout(() => focusable?.focus(), 120);
  }

  function openSignup() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    body.classList.add('no-scroll');
    setStep(0);
  }
  function closeSignup() {
    if (!dialog) return;
    if (dialog.open && typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
    body.classList.remove('no-scroll');
  }
  document.querySelectorAll('[data-open-signup]').forEach(btn => btn.addEventListener('click', openSignup));
  document.querySelectorAll('[data-close-signup]').forEach(btn => btn.addEventListener('click', closeSignup));
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeSignup(); });

  document.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => {
    const field = steps[step]?.querySelector('input:not(.honeypot), select');
    if (!field?.checkValidity()) { field?.reportValidity(); return; }
    setStep(step + 1);
  }));

  const confirmedAt = document.querySelector('[data-confirmed-at]');

  async function drawQR(code) {
    const checkInUrl = `${location.origin}/class-a/checkin.html?code=${encodeURIComponent(code)}`;
    try {
      if (window.QRCode?.toCanvas) {
        await window.QRCode.toCanvas(qrCanvas, checkInUrl, { width: 220, margin: 1, color: { dark: '#050607', light: '#ffffff' } });
        return;
      }
    } catch (_) {}
    const ctx = qrCanvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,220,220);
    ctx.fillStyle = '#050607';
    const seed = [...checkInUrl].reduce((a,c)=>((a*31 + c.charCodeAt(0))>>>0),2166136261);
    for (let y=0;y<21;y++) for (let x=0;x<21;x++) {
      const bit = ((seed ^ (x*73856093) ^ (y*19349663) ^ ((x+y)*83492791)) >>> ((x+y)%16)) & 1;
      if (bit) ctx.fillRect(6+x*10,6+y*10,8,8);
    }
  }

  function formatDhakaTime(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(new Date(value));
    } catch (_) { return ''; }
  }

  document.querySelector('[data-copy-pass]')?.addEventListener('click', async () => {
    const code = passCode?.textContent?.trim();
    if (!code || code === '—') return;
    try {
      await navigator.clipboard.writeText(code);
      status.textContent = 'CODE COPIED.';
    } catch (_) {
      status.textContent = `YOUR CODE: ${code}`;
    }
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const current = steps[step]?.querySelector('select, input:not(.honeypot)');
    if (!current?.checkValidity()) { current?.reportValidity(); return; }
    const honeypot = form.querySelector('[name="company"]');
    if (honeypot?.value) return;

    const data = new FormData(form);
    const payload = {
      p_full_name: String(data.get('name') || '').trim(),
      p_phone: String(data.get('phone') || '').trim(),
      p_email: String(data.get('email') || '').trim(),
      p_skill_level: String(data.get('skill') || '').trim() || null,
      p_source: 'class-a-builders-cinematic-v3'
    };

    status.classList.remove('is-error');
    status.textContent = 'CONFIRMING YOUR SEAT…';
    const submit = form.querySelector('.signup-submit');
    submit.disabled = true;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/class_a_register_confirmed`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Registration failed (${response.status})`);
      const rows = await response.json();
      const result = Array.isArray(rows) ? rows[0] : rows;
      if (!result) throw new Error('No confirmation returned');

      if (result.outcome === 'already_registered') {
        status.textContent = `THIS EMAIL OR WHATSAPP IS ALREADY REGISTERED. YOUR EXISTING PASS ENDS IN ${result.redeem_code_last4 || '••••'}. CONTACT THE CLASS[Λ] TEAM IF YOU NEED THE FULL CODE AGAIN.`;
        status.classList.add('is-error');
        return;
      }
      if (result.outcome !== 'confirmed' || !result.redeem_code) throw new Error('Confirmation was not issued');

      if (passCode) passCode.textContent = result.redeem_code;
      if (confirmedAt) confirmedAt.textContent = `Confirmed · ${formatDhakaTime(result.confirmed_at)} · Bangladesh time`;
      await drawQR(result.redeem_code);
      steps.forEach(el => el.classList.remove('is-active'));
      form.querySelector('.steps')?.setAttribute('hidden','');
      form.querySelector('.signup-head')?.setAttribute('hidden','');
      status.textContent = '';
      success.hidden = false;
      form.reset();
    } catch (error) {
      console.error(error);
      status.textContent = 'REGISTRATION NOT CONFIRMED. CHECK YOUR CONNECTION AND TRY AGAIN.';
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
    }
  });
})();
