(() => {
  const SUPABASE_URL = 'https://tocxdyqlrvzthpexnmxe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_';
  const form = document.querySelector('[data-pass-form]');
  const codeInput = document.querySelector('#pass-code');
  const status = document.querySelector('[data-status]');
  const pass = document.querySelector('[data-pass]');
  const attendanceForm = document.querySelector('[data-attendance-form]');
  const attendanceStatus = document.querySelector('[data-attendance-status]');
  let activeCode = '';

  function setMessage(el, message, kind='') {
    el.textContent = message;
    el.classList.remove('error','ok');
    if (kind) el.classList.add(kind);
  }

  function formatTime(startValue, endValue, timezone='Asia/Dhaka') {
    if (!startValue) return 'The next live session is being scheduled. Your pass is reserved and will update automatically.';
    try {
      const start = new Date(startValue);
      const end = endValue ? new Date(endValue) : null;
      const date = new Intl.DateTimeFormat('en-GB',{timeZone:timezone,weekday:'long',day:'2-digit',month:'short',year:'numeric'}).format(start);
      const a = new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:true}).format(start);
      const b = end ? new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:true}).format(end) : '';
      return `${date} · ${a}${b ? '–'+b : ''} · Bangladesh time`;
    } catch (_) { return 'Open this pass again for the latest live-session schedule.'; }
  }

  const compactUtc = value => new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  function calendarUrl(data) {
    if (!data.session_starts_at) return '';
    const end = data.session_ends_at || new Date(new Date(data.session_starts_at).getTime()+2*60*60*1000).toISOString();
    const q = new URLSearchParams({
      action:'TEMPLATE',
      text:data.session_title || 'CLASS[Λ] — The 0.01% Builders Masterclass',
      dates:`${compactUtc(data.session_starts_at)}/${compactUtc(end)}`,
      details:'CLASS[Λ] live online masterclass. Keep your personal pass for attendance verification.',
      location:data.session_join_url || 'Online · Google Meet'
    });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
  }

  async function rpc(name, payload) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method:'POST',
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`${name} failed (${response.status})`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function openPass(code) {
    activeCode = String(code || '').trim().toUpperCase();
    if (!activeCode) return;
    codeInput.value = activeCode;
    setMessage(status,'OPENING YOUR PASS…');
    try {
      const data = await rpc('class_a_get_session_pass',{p_code:activeCode});
      if (!data || data.outcome !== 'ok') {
        pass.hidden = true;
        setMessage(status,'PASS NOT FOUND. CHECK THE CODE AND TRY AGAIN.','error');
        return;
      }
      document.querySelector('[data-name]').textContent = data.full_name || 'Builder';
      document.querySelector('[data-session-state]').textContent = `SESSION · ${String(data.session_status || 'planning').toUpperCase()}`;
      document.querySelector('[data-session-title]').textContent = data.session_title || 'CLASS[Λ] — The 0.01% Builders Masterclass';
      document.querySelector('[data-session-time]').textContent = formatTime(data.session_starts_at,data.session_ends_at,data.session_timezone);
      document.querySelector('[data-enrollment-status]').textContent = String(data.enrollment_status || 'confirmed').toUpperCase();

      const cal = document.querySelector('[data-calendar]');
      const calUrl = calendarUrl(data);
      if (calUrl) { cal.href=calUrl; cal.hidden=false; } else { cal.hidden=true; cal.removeAttribute('href'); }

      const join = document.querySelector('[data-join]');
      if (data.session_join_url && ['scheduled','live'].includes(data.session_status)) {
        join.href=data.session_join_url; join.hidden=false;
      } else {
        join.hidden=true; join.removeAttribute('href');
      }

      pass.hidden=false;
      setMessage(status,'PASS VERIFIED.','ok');
      rpc('class_a_record_session_signal',{p_code:activeCode,p_signal:'portal_open'}).catch(()=>{});
      if (data.enrollment_status === 'attended') {
        setMessage(attendanceStatus,'ATTENDANCE ALREADY VERIFIED.','ok');
      }
    } catch (error) {
      console.error(error);
      pass.hidden=true;
      setMessage(status,'PASS COULD NOT BE OPENED. CHECK YOUR CONNECTION AND TRY AGAIN.','error');
    }
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    openPass(codeInput.value);
  });

  document.querySelector('[data-copy]')?.addEventListener('click', async () => {
    if (!activeCode) return;
    try { await navigator.clipboard.writeText(activeCode); setMessage(status,'PASS CODE COPIED.','ok'); }
    catch (_) { setMessage(status,`PASS CODE: ${activeCode}`); }
  });

  document.querySelector('[data-join]')?.addEventListener('click', () => {
    if (activeCode) rpc('class_a_record_session_signal',{p_code:activeCode,p_signal:'join_click'}).catch(()=>{});
  });

  attendanceForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!activeCode) { setMessage(attendanceStatus,'OPEN YOUR PERSONAL PASS FIRST.','error'); return; }
    if (!attendanceForm.checkValidity()) { attendanceForm.reportValidity(); return; }
    const liveCode = String(new FormData(attendanceForm).get('live_code') || '').trim().toUpperCase();
    setMessage(attendanceStatus,'VERIFYING LIVE ATTENDANCE…');
    try {
      const data = await rpc('class_a_verify_live_attendance',{p_pass_code:activeCode,p_live_code:liveCode});
      if (data?.outcome === 'attended' || data?.outcome === 'already_attended') {
        setMessage(attendanceStatus,'ATTENDANCE VERIFIED. YOU ARE CHECKED IN.','ok');
        document.querySelector('[data-enrollment-status]').textContent='ATTENDED';
        attendanceForm.reset();
      } else if (data?.outcome === 'invalid_or_expired_live_code') {
        setMessage(attendanceStatus,'THAT LIVE CODE IS INVALID OR EXPIRED. USE THE CURRENT CODE SHOWN IN CLASS.','error');
      } else {
        setMessage(attendanceStatus,'ATTENDANCE COULD NOT BE VERIFIED. CHECK YOUR PERSONAL PASS AND LIVE CODE.','error');
      }
    } catch (error) {
      console.error(error);
      setMessage(attendanceStatus,'ATTENDANCE VERIFICATION FAILED. CHECK YOUR CONNECTION AND TRY AGAIN.','error');
    }
  });

  const hash = new URLSearchParams(location.hash.replace(/^#/,''));
  const initial = hash.get('code');
  if (initial) openPass(initial);
})();