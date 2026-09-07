(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const scene = document.querySelector('[data-scene]');

  if (scene && !reduceMotion.matches && finePointer.matches) {
    let frame = 0;
    const updateScene = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        root.style.setProperty('--scene-x', `${x * 10}px`);
        root.style.setProperty('--scene-y', `${y * 7}px`);
        root.style.setProperty('--scene-rotate-x', `${-y * 2.4}deg`);
        root.style.setProperty('--scene-rotate-y', `${x * 3.8}deg`);
        frame = 0;
      });
    };
    window.addEventListener('pointermove', updateScene, { passive: true });
  }

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 60}ms`);
      observer.observe(item);
    });
  }

  const form = document.querySelector('[data-signup-form]');
  if (!form) return;

  const success = form.querySelector('[data-success]');
  const errorBox = form.querySelector('[data-error]');
  const submit = form.querySelector('button[type="submit"]');
  const honeypot = form.querySelector('[name="company"]');
  const program = form.dataset.program;
  const source = program === 'course' ? 'class-a-cinematic-course' : 'class-a-cinematic-masterclass';
  const supabaseUrl = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const publishableKey = 'sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_';

  const setStatus = (target) => {
    [success, errorBox].forEach((box) => {
      if (!box) return;
      const active = box === target;
      box.hidden = !active;
      box.classList.toggle('show', active);
    });
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: false });
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (honeypot && honeypot.value) return;

    setStatus(null);
    const originalLabel = submit ? submit.textContent : '';
    if (submit) {
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = form.dataset.loadingLabel || 'SAVING…';
    }

    const data = new FormData(form);
    const payload = {
      program,
      full_name: String(data.get('name') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      email: String(data.get('email') || '').trim(),
      skill_level: String(data.get('skill') || '').trim() || null,
      source,
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/class_a_registrations`, {
        method: 'POST',
        headers: {
          apikey: publishableKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Registration failed with ${response.status}`);
      form.reset();
      setStatus(success);
    } catch (error) {
      console.error('CLASS A registration failed', error);
      setStatus(errorBox);
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submit.textContent = originalLabel;
      }
    }
  });
})();
