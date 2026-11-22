// Public navigation only. No model, founder memory, recording or network calls.
(() => {
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
