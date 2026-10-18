(() => {
  const SUPABASE_URL='https://tocxdyqlrvzthpexnmxe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_uLq6k_t3B-dnNJW9d1Kh-Q_3kyoSUa_';
  const form=document.querySelector('[data-form]');
  const status=document.querySelector('[data-status]');
  const result=document.querySelector('[data-result]');
  const codeEl=document.querySelector('[data-code]');
  const sessionEl=document.querySelector('[data-session]');
  const expiryEl=document.querySelector('[data-expiry]');

  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    status.classList.remove('error');
    status.textContent='GENERATING SECURE LIVE CODE…';
    result.hidden=true;
    const data=new FormData(form);
    try{
      const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/class_a_issue_current_live_code`,{
        method:'POST',
        headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          p_staff_key:String(data.get('staff_key')||''),
          p_minutes:Number(data.get('minutes')||20)
        })
      });
      if(!response.ok) throw new Error(`Request failed (${response.status})`);
      const rows=await response.json();
      const out=Array.isArray(rows)?rows[0]:rows;
      if(out?.outcome==='invalid_staff_key'){
        status.textContent='INVALID STAFF KEY.';
        status.classList.add('error');
        return;
      }
      if(out?.outcome==='no_active_session'){
        status.textContent='NO SCHEDULED OR LIVE CLASS[Λ] SESSION IS AVAILABLE. PUBLISH THE SESSION SCHEDULE FIRST.';
        status.classList.add('error');
        return;
      }
      if(out?.outcome!=='issued'||!out.live_code) throw new Error('Live code not issued');
      sessionEl.textContent=out.session_title||'CLASS[Λ] LIVE';
      codeEl.textContent=out.live_code;
      expiryEl.textContent=`Valid until ${new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date(out.closes_at))} · Bangladesh time`;
      status.textContent='LIVE CODE ACTIVE.';
      result.hidden=false;
      form.querySelector('[name="staff_key"]').value='';
    }catch(error){
      console.error(error);
      status.textContent='LIVE CODE COULD NOT BE GENERATED. CHECK THE SESSION STATE AND CONNECTION.';
      status.classList.add('error');
    }
  });
})();