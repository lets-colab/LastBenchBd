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
    try { sessionStorage.setItem('classa_intro_seen', '1'); } catch (_) {}

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
      try {
        await film.play();
      } catch (_) {
        completeIntro({ instant: true });
        return;
      }
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
  const capabilityNodes = Array.from(document.querySelectorAll('[data-capability]'));
  let transformTimer = 0;
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
    const mechanics = [
      {yaw:-7,pitch:2,roll:-1,x:-10,y:0},{yaw:8,pitch:-2,roll:1,x:8,y:-8},{yaw:-11,pitch:4,roll:-2,x:-4,y:6},
      {yaw:12,pitch:-3,roll:2,x:10,y:-4},{yaw:-6,pitch:1,roll:-2,x:-8,y:8},{yaw:0,pitch:0,roll:0,x:0,y:-10}
    ][index];
    journey?.setAttribute('data-scene', String(index));
    root.style.setProperty('--rig-yaw', mechanics.yaw + 'deg'); root.style.setProperty('--rig-pitch', mechanics.pitch + 'deg');
    root.style.setProperty('--rig-roll', mechanics.roll + 'deg'); root.style.setProperty('--rig-shift-x', mechanics.x + 'px'); root.style.setProperty('--rig-shift-y', mechanics.y + 'px');
    capabilityNodes.forEach((el,i)=>el.classList.toggle('is-active',i===index));
    if (!reduced.matches && journey) {
      journey.classList.remove('is-transforming'); void journey.offsetWidth; journey.classList.add('is-transforming');
      window.clearTimeout(transformTimer); transformTimer = window.setTimeout(()=>journey.classList.remove('is-transforming'),820);
    }
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
  const sessionStatus = document.querySelector('[data-session-status]');
  const sessionTitle = document.querySelector('[data-session-title]');
  const sessionTime = document.querySelector('[data-session-time]');
  const calendarLink = document.querySelector('[data-calendar-link]');
  const passLink = document.querySelector('[data-pass-link]');
  const whatsappChannel = document.querySelector('[data-whatsapp-channel]');
  const unlockPass = document.querySelector('[data-unlock-pass]');
  const followGate = document.querySelector('[data-follow-gate]');
  const followNote = document.querySelector('[data-follow-note]');
  const passReveal = document.querySelector('[data-pass-reveal]');
  let pendingPass = null;
  let step = 0;

  const SUPABASE_URL = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb8z67SGJP8MABoA3A00';
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
    const checkInUrl = `${location.origin}/class-a/pass.html#code=${encodeURIComponent(code)}`;
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

  function formatSessionTime(startValue, endValue, timezone = 'Asia/Dhaka') {
    if (!startValue) return 'The next live session is being scheduled. Your pass is already reserved.';
    try {
      const start = new Date(startValue);
      const end = endValue ? new Date(endValue) : null;
      const date = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone, weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
      }).format(start);
      const time = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true
      }).format(start);
      const endTime = end ? new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: true
      }).format(end) : null;
      return `${date} · ${time}${endTime ? `–${endTime}` : ''} · Bangladesh time`;
    } catch (_) {
      return 'Live-session schedule confirmed. Open your personal pass for the latest details.';
    }
  }

  async function hydratePublicSession() {
    const chip = document.querySelector('[data-public-session-chip]');
    const meta = document.querySelector('[data-public-session-meta]');
    const finalLine = document.querySelector('[data-public-session-final]');
    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/class_a_public_session', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: '{}'
      });
      if (!response.ok) return;
      const payload = await response.json();
      const session = Array.isArray(payload) ? payload[0] : payload;
      if (!session?.starts_at) return;

      const start = new Date(session.starts_at);
      const end = session.ends_at ? new Date(session.ends_at) : null;
      const zone = session.timezone || 'Asia/Dhaka';
      const day = new Intl.DateTimeFormat('en-GB',{timeZone:zone,day:'2-digit',month:'short'}).format(start).toUpperCase();
      const weekday = new Intl.DateTimeFormat('en-GB',{timeZone:zone,weekday:'short'}).format(start).toUpperCase();
      const startTime = new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'numeric',minute:'2-digit',hour12:true}).format(start);
      const endTime = end ? new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'numeric',minute:'2-digit',hour12:true}).format(end) : '';
      if (chip) chip.innerHTML = '<i></i> ' + day + ' · ' + startTime + ' · LIVE ONLINE';
      if (meta) meta.textContent = weekday + ' ' + day + ' · ' + startTime + (endTime ? '–' + endTime : '') + ' · GOOGLE MEET · FREE REGISTRATION';
      if (finalLine) finalLine.textContent = weekday + ' ' + day + ' · ' + startTime + (endTime ? '–' + endTime : '') + ' · Google Meet · Free registration';
      if (session.registration_open === false) {
        document.querySelectorAll('[data-open-signup]').forEach(el => {
          el.disabled = true;
          el.textContent = 'REGISTRATION CLOSED';
        });
      }
    } catch (_) {}
  }

  hydratePublicSession();

  function compactUtc(value) {
    return new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  }

  function buildGoogleCalendarUrl(result) {
    if (!result.session_starts_at) return '';
    const start = compactUtc(result.session_starts_at);
    const end = compactUtc(result.session_ends_at || new Date(new Date(result.session_starts_at).getTime() + 2 * 60 * 60 * 1000));
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: result.session_title || 'CLASS[Λ] — The 0.01% Builders Masterclass',
      dates: `${start}/${end}`,
      details: 'Your personal CLASS[Λ] masterclass pass contains the latest room and attendance details.',
      location: result.session_join_url || 'Online · Google Meet'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function renderSession(result, code) {
    if (sessionStatus) sessionStatus.textContent = `SESSION · ${String(result.session_status || 'planning').toUpperCase()}`;
    if (sessionTitle) sessionTitle.textContent = result.session_title || 'CLASS[Λ] — The 0.01% Builders Masterclass';
    if (sessionTime) sessionTime.textContent = formatSessionTime(result.session_starts_at, result.session_ends_at, result.session_timezone);
    const personalUrl = `${location.origin}/class-a/pass.html#code=${encodeURIComponent(code)}`;
    if (passLink) passLink.href = personalUrl;
    const calendarUrl = buildGoogleCalendarUrl(result);
    if (calendarLink) {
      if (calendarUrl) {
        calendarLink.href = calendarUrl;
        calendarLink.hidden = false;
      } else {
        calendarLink.hidden = true;
        calendarLink.removeAttribute('href');
      }
    }
  }

  function prepareWhatsappUnlock(result) {
    pendingPass = result && result.unlock_token ? result : null;
    if (whatsappChannel) whatsappChannel.href = WHATSAPP_CHANNEL_URL;
    if (unlockPass) unlockPass.disabled = true;
    if (followNote) followNote.textContent = 'Open the channel first. Your pass has not been released yet.';
    if (followGate) followGate.hidden = false;
    if (passReveal) passReveal.hidden = true;
  }

  whatsappChannel?.addEventListener('click', () => {
    if (!pendingPass?.unlock_token) return;
    if (unlockPass) unlockPass.disabled = false;
    if (followNote) followNote.textContent = 'After following the channel, return here and tap “I’VE FOLLOWED — UNLOCK MY PASS”.';
  });

  unlockPass?.addEventListener('click', async () => {
    if (!pendingPass?.unlock_token || unlockPass.disabled) return;
    unlockPass.disabled = true;
    if (followNote) followNote.textContent = 'Unlocking your personal CLASS[Λ] pass…';

    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/class_a_unlock_online_pass', {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_unlock_token: pendingPass.unlock_token,
          p_follow_confirmed: true
        })
      });
      if (!response.ok) throw new Error('Pass unlock failed (' + response.status + ')');
      const rows = await response.json();
      const result = Array.isArray(rows) ? rows[0] : rows;

      if (!result || result.outcome === 'invalid_or_expired_unlock') {
        if (followNote) followNote.textContent = 'This unlock window expired. Submit the registration again to restart the follow step.';
        unlockPass.disabled = false;
        return;
      }
      if (result.outcome !== 'unlocked' || !result.pass_code) {
        if (followNote) followNote.textContent = 'Your pass could not be released. Please try the follow step again.';
        unlockPass.disabled = false;
        return;
      }

      if (passCode) passCode.textContent = result.pass_code;
      if (confirmedAt) confirmedAt.textContent = 'Confirmed · ' + formatDhakaTime(result.confirmed_at) + ' · Bangladesh time';
      renderSession(result, result.pass_code);
      await drawQR(result.pass_code);
      const personalUrl = location.origin + '/class-a/pass.html#code=' + encodeURIComponent(result.pass_code);
      try { sessionStorage.setItem('class_a_last_pass_url', personalUrl); } catch (_) {}
      if (followGate) followGate.hidden = true;
      if (passReveal) passReveal.hidden = false;
      pendingPass = null;
    } catch (error) {
      console.error(error);
      if (followNote) followNote.textContent = 'Pass unlock failed. Check your connection and try again.';
      unlockPass.disabled = false;
    }
  });
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
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const honeypot = form.querySelector('[name="company"]');
    if (honeypot?.value) return;

    const data = new FormData(form);
    const payload = {
      p_full_name: String(data.get('name') || '').trim(),
      p_phone: String(data.get('phone') || '').trim(),
      p_email: String(data.get('email') || '').trim(),
      p_skill_level: String(data.get('skill') || '').trim() || null,
      p_source: 'class-a-online-masterclass-v2',
      p_recording_consent: data.get('recording_consent') === 'yes'
    };

    status.classList.remove('is-error');
    status.textContent = 'RESERVING YOUR REGISTRATION…';
    const submit = form.querySelector('.signup-submit');
    submit.disabled = true;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/class_a_register_online_gated`, {
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

      if (result.outcome === 'recording_consent_required') {
        status.textContent = 'PLEASE ACCEPT THE RECORDING AND TRANSCRIPTION NOTICE TO JOIN THIS LIVE SESSION.';
        status.classList.add('is-error');
        return;
      }
      if (result.outcome === 'already_unlocked') {
        status.textContent = 'YOU ARE ALREADY ENROLLED AND YOUR PASS HAS ALREADY BEEN UNLOCKED. USE YOUR EXISTING PASS, OR CONTACT THE CLASS[Λ] TEAM IF YOU NEED ACCESS RECOVERED.';
        status.classList.add('is-error');
        return;
      }
      if (result.outcome === 'identity_conflict') {
        status.textContent = 'THIS EMAIL OR WHATSAPP IS ALREADY CONNECTED TO A DIFFERENT REGISTRATION IDENTITY. CONTACT THE CLASS[Λ] TEAM SO WE CAN VERIFY IT WITHOUT OVERWRITING ANYONE’S RECORD.';
        status.classList.add('is-error');
        return;
      }
      if (result.outcome === 'excluded_record') {
        status.textContent = 'THIS RECORD IS NOT ELIGIBLE FOR LIVE ENROLLMENT. CONTACT THE CLASS[Λ] TEAM FOR REVIEW.';
        status.classList.add('is-error');
        return;
      }
      if (result.outcome === 'no_session') {
        status.textContent = 'THE NEXT LIVE SESSION HAS NOT BEEN OPENED FOR ENROLLMENT YET. PLEASE TRY AGAIN AFTER THE CLASS[Λ] TEAM PUBLISHES IT.';
        status.classList.add('is-error');
        return;
      }
      if (result.outcome !== 'follow_required' || !result.unlock_token) throw new Error('Follow gate was not issued');

      steps.forEach(el => el.classList.remove('is-active'));
      form.querySelector('.steps')?.setAttribute('hidden','');
      form.querySelector('.signup-head')?.setAttribute('hidden','');
      status.textContent = '';
      success.hidden = false;
      prepareWhatsappUnlock(result);
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
