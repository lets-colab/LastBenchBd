(() => {
  const root = document.documentElement;
  const scene = document.querySelector('[data-scene]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (scene && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty('--ry', `${x * 5.5}deg`);
      root.style.setProperty('--rx', `${-y * 3.5}deg`);
    }, { passive: true });
  }

  const form = document.querySelector('[data-signup-form]');
  if (!form) return;

  const success = document.querySelector('[data-success]');
  const errorBox = document.querySelector('[data-error]');
  const submit = form.querySelector('button[type="submit"]');
  const honeypot = form.querySelector('[name="company"]');

  const SUPABASE_URL = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvY3hkeXFscnZ6dGhwZXhubXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjUxMTQsImV4cCI6MjA5ODk0MTExNH0.oC6AfVgAAMUht1HDWxlehurMjDVE5praY-WAlSTFMMY';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (honeypot && honeypot.value) return;

    if (success) success.classList.remove('show');
    if (errorBox) errorBox.classList.remove('show');

    const original = submit ? submit.textContent : '';
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'RESERVING…';
    }

    const data = new FormData(form);
    const payload = {
      program: 'masterclass',
      full_name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      email: String(data.get('email') || '').trim(),
      skill_level: String(data.get('skill') || '').trim() || null,
      source: 'class-a-cinematic-masterclass'
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/class_a_registrations`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Registration failed: ${response.status}`);
      form.reset();
      if (success) {
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    } catch (_) {
      if (errorBox) {
        errorBox.classList.add('show');
        errorBox.setAttribute('tabindex', '-1');
        errorBox.focus();
      }
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = original;
      }
    }
  });
})();