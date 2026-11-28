// Public navigation only. No model, founder memory, recording or network calls.
// Small screens: collapse the primary navigation behind one Menu button.
// Without JavaScript the navigation stays fully visible.
(() => {
  document.querySelectorAll('.lb-nav').forEach((nav, index) => {
    if (nav.previousElementSibling?.classList.contains('lb-menu')) return;
    nav.id ||= `lb-nav-${index}`;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lb-menu';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', nav.id);
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Menu</span>';
    const set = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.lastChild.textContent = open ? 'Close' : 'Menu';
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) set(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) { set(false); toggle.focus(); }
    });
    nav.before(toggle);
  });
  document.documentElement.classList.add('lb-menu-ready');
})();
(() => {
  const sound = document.querySelector('[data-route-sound]');
  if (sound && window.AudioContext) {
    let audio;
    let enabled = false;
    const chime = (frequency) => {
      if (!enabled || audio.state !== 'running') return;
      const tone = audio.createOscillator();
      const volume = audio.createGain();
      tone.frequency.value = frequency;
      volume.gain.setValueAtTime(0.045, audio.currentTime);
      volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.14);
      tone.connect(volume).connect(audio.destination);
      tone.onended = () => { tone.disconnect(); volume.disconnect(); };
      tone.start();
      tone.stop(audio.currentTime + 0.15);
    };
    sound.hidden = false;
    sound.addEventListener('click', async () => {
      enabled = !enabled;
      sound.setAttribute('aria-pressed', String(enabled));
      if (!enabled) return;
      try {
        audio ??= new AudioContext();
        await audio.resume();
        chime(330);
      } catch {
        enabled = false;
        sound.setAttribute('aria-pressed', 'false');
      }
    });
    document.querySelectorAll('.gates > a').forEach((route, i) => {
      route.addEventListener('focus', () => chime([330, 440, 550][i]));
    });
  }
  let guide;
  let opener;
  const close = () => { guide.close(); opener?.focus(); };
  document.querySelectorAll('[data-site-guide]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (typeof HTMLDialogElement === 'undefined') return;
      event.preventDefault();
      opener = link;
      if (!guide) {
        guide = document.createElement('dialog');
        guide.className = 'lb-guide';
        guide.setAttribute('aria-labelledby', 'lb-guide-title');
        guide.innerHTML = `<button type="button" class="lb-guide-close" aria-label="Close Dr. X site guide">Close</button>
          <div class="lb-guide-kicker">Dr. X · Public site guide</div><h2 id="lb-guide-title">Find your starting point.</h2>
          <p>Choose what you want to do next. These links use public Last Bench information.</p>
          <nav aria-label="Dr. X recommended routes"><a href="/malaysia/">Study &amp; Move — Malaysia journey</a>
          <a href="/class-a/">CLASS[Λ] — build AI skills</a><a href="/co-lab/">co.lab — build a business</a>
          <a href="/explore/">Cortex Atlas — explore public sources</a><a href="/app/auth/">Sign in — existing student journey</a></nav>
          <p class="lb-guide-note">This guide helps you navigate the public site. It does not access private memory or provide live voice or avatar chat.</p>`;
        document.body.append(guide);
        guide.querySelector('button').addEventListener('click', close);
        guide.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
      }
      guide.showModal();
    });
  });
  document.querySelectorAll('[data-skip-motion]').forEach((button) => {
    button.addEventListener('click', () => {
      document.documentElement.dataset.motion = 'off';
      button.setAttribute('aria-pressed', 'true');
      const paths = document.getElementById('paths');
      if (paths) { paths.scrollIntoView({ behavior: 'instant', block: 'center' }); paths.focus({ preventScroll: true }); }
      if (!document.querySelector('.lb-motion-status')) {
        const status = document.createElement('div');
        status.className = 'lb-motion-status'; status.setAttribute('role', 'status'); status.textContent = 'Motion is off.';
        document.body.append(status); setTimeout(() => status.remove(), 4000);
      }
    });
  });
})();
