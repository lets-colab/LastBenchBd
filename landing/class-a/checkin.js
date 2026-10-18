(() => {
  const form = document.querySelector('[data-checkin-form]');
  const status = document.querySelector('[data-status]');
  const result = document.querySelector('[data-result]');
  const name = document.querySelector('[data-name]');
  const time = document.querySelector('[data-time]');
  const codeInput = document.querySelector('#code');
  const SUPABASE_URL = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_';

  const params = new URLSearchParams(location.search);
  if (params.get('code')) codeInput.value = params.get('code').toUpperCase();

  const dhaka = value => new Intl.DateTimeFormat('en-GB', {
    timeZone:'Asia/Dhaka', day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
  }).format(new Date(value));

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.className = 'status';
    status.textContent = 'VERIFYING…';
    result.hidden = true;
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const data = new FormData(form);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/class_a_redeem_attendance`, {
        method:'POST',
        headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          p_code:String(data.get('code')||'').trim().toUpperCase(),
          p_staff_key:String(data.get('staff_key')||'')
        })
      });
      if (!response.ok) throw new Error(`Check-in failed (${response.status})`);
      const rows = await response.json();
      const r = Array.isArray(rows) ? rows[0] : rows;
      if (!r) throw new Error('No check-in result');
      if (r.outcome === 'invalid_staff_key') throw new Error('INVALID STAFF KEY');
      if (r.outcome === 'invalid_code') throw new Error('INVALID OR EXPIRED ATTENDEE CODE');
      if (r.outcome !== 'attended' && r.outcome !== 'already_attended') throw new Error('ATTENDANCE NOT CONFIRMED');
      name.textContent = r.full_name || `Registration #${r.registration_id}`;
      time.textContent = `${r.outcome === 'already_attended' ? 'Already attended' : 'Attended'} · ${dhaka(r.attended_at)} · Bangladesh time`;
      result.hidden = false;
      status.textContent = r.outcome === 'already_attended' ? 'THIS PASS WAS ALREADY REDEEMED.' : 'ATTENDANCE RECORDED.';
      codeInput.value = '';
    } catch (error) {
      status.textContent = String(error?.message || 'CHECK-IN FAILED.');
      status.classList.add('error');
    } finally { button.disabled = false; }
  });
})();
