import {worlds,resolveScene,nextWorld,canAnimate,selectPublicRecords,createEntryTransition} from './cinematic-state.mjs';
import {chapters,duties,publicWork,guideAnswer} from './cinematic-content.mjs';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let selected='classa', chapter=0, founderIndex=0, activeFounder=null, scene=null, depthOn=false, loadingScene=false, routeEpoch=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const profiles=Object.values(window.LB_FOUNDER_PROFILES||{});
const image=$('#environment-image');
const sources={hub:'assets/cinematic/hub-atrium.webp',malaysia:'assets/cinematic/malaysia-city.webp',classa:'class-a/assets/class-a-20-orbit.jpg',colab:'assets/cinematic/colab-laboratory.webp'};
const content=$('#content-view');
const entry=createEntryTransition(id=>{location.hash='world/'+id;});
$('.skip-link').addEventListener('click',e=>{e.preventDefault();$('#main-content').focus();$('#main-content').scrollIntoView({block:'start'});});
function preferences(){return {reducedMotion:reduced.matches,saveData:navigator.connection?.saveData,paused:!depthOn,hidden:document.hidden};}
function select(id){
 if(!worlds[id])return;selected=id;document.body.dataset.world=id;
 $$('[data-portal]').forEach(b=>{b.classList.toggle('selected',b.dataset.portal===id);b.setAttribute('aria-pressed',String(b.dataset.portal===id));});
 $('#enter-world').href='#world/'+id;$('#selected-outcome').textContent=worlds[id].outcome;
 if(innerWidth<=600)image.style.objectPosition=id==='malaysia'?'9% center':id==='colab'?'95% center':'50% center';
 else image.style.objectPosition='';
 scene?.select(id);
}
$$('[data-portal]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.portal)));
$('#enter-world').addEventListener('click',e=>{
 if(scene&&canAnimate(preferences())){e.preventDefault();entry.begin(selected,complete=>scene.enter(complete));}
});
$('#menu-toggle').addEventListener('click',()=>{
 const open=$('#main-nav').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));
});
function world(){
 const w=worlds[selected],row=chapters[selected][chapter];
 $('#world-kicker').textContent=row.kicker;$('#world-title').textContent=row.title;$('#world-body').textContent=row.body;
 $('#world-identity').textContent=w.name+' · '+w.descriptor.toUpperCase();
 $('#world-primary').href=w.href;$('#world-primary').textContent=selected==='malaysia'?'Enter the city journey →':selected==='classa'?'Explore the program →':'Explore co.lab →';
 $('#world-primary').target=selected==='colab'?'_blank':'_self';$('#world-primary').rel='noopener noreferrer';
 $('#chapter-count').textContent=String(chapter+1).padStart(2,'0')+' / 03';
 $('#next-chapter').hidden=chapter===2;
 const next=nextWorld(selected);$('#continue-path').hidden=chapter!==2;$('#continue-path').href=next==='hub'?'#hub':'#world/'+next;
 $('#continue-path').textContent=next==='hub'?'Return to the hub →':'Continue to '+worlds[next].name+' →';
 const steps=$('#chapter-steps');steps.replaceChildren();
 chapters[selected].forEach((_,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.className=i===chapter?'active':'';b.setAttribute('aria-label','Chapter '+(i+1));b.setAttribute('aria-pressed',String(i===chapter));b.addEventListener('click',()=>{chapter=i;world();});steps.append(b);});
 image.src=sources[selected];
}
$('#next-chapter').addEventListener('click',()=>{chapter=Math.min(2,chapter+1);world();});
const intro=(k,t,b)=>'<p class="eyebrow">'+k+'</p><h1 tabindex="-1">'+t+'</h1><p class="lead">'+b+'</p>';
function company(){
 content.innerHTML=intro('THE COMPANY / OUR PEOPLE','A starting point.<br>A lasting benchmark.','Last Bench is the company. CLASS[Λ] builds practical capability. co.lab helps businesses build and grow. Opportunity should compound, not reset.')+
 '<div class="founder-stage"><div class="founder-portrait"><img id="founder-photo" alt=""><span class="portrait-note">Real people. Shared direction.</span></div><div class="founder-copy"><p class="eyebrow" id="founder-index"></p><h2 id="founder-name"></h2><p id="founder-role"></p><p id="founder-alias"></p><ul id="founder-duties"></ul><button id="ask-founder" class="primary">Ask about this founder</button><p class="fine">AI-assisted profile information is not a personal statement from the founder.</p><div class="founder-controls"><button id="founder-prev" class="quiet" aria-label="Previous founder">← Previous</button><button id="founder-next" class="quiet" aria-label="Next founder">Next →</button></div></div></div>'+
 '<div class="company-architecture"><div><p class="eyebrow">LEARN TO BUILD</p><h3>CLASS[Λ] Skill Laboratory</h3><p>Build skill through execution and visible proof.</p><a href="#world/classa">Enter the Skill Laboratory →</a></div><div><p class="eyebrow">BUILD &amp; GET ACCELERATED</p><h3>co.lab Business Laboratory</h3><p>Ventures · Projects · Services · Community.</p><a href="#world/colab">Enter the Business Laboratory →</a></div></div>';
 renderFounder();
 $('#founder-prev').onclick=()=>{founderIndex=(founderIndex+profiles.length-1)%profiles.length;renderFounder();};
 $('#founder-next').onclick=()=>{founderIndex=(founderIndex+1)%profiles.length;renderFounder();};
 $('.founder-stage').addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('#founder-next').click();if(e.key==='ArrowLeft')$('#founder-prev').click();});
 let startX=null;$('.founder-portrait').addEventListener('pointerdown',e=>{startX=e.clientX;});$('.founder-portrait').addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>50)(e.clientX<startX?$('#founder-next'):$('#founder-prev')).click();startX=null;});
 $('#ask-founder').onclick=()=>openChat(profiles[founderIndex]);
}
function renderFounder(){
 const f=profiles[founderIndex];if(!f){content.innerHTML+=empty('Profiles unavailable','Please try again later.');return;}
 $('#founder-photo').src=f.portrait;$('#founder-photo').alt=f.name;$('#founder-name').textContent=f.name;$('#founder-role').textContent=f.title;$('#founder-alias').textContent=f.alias||'';
 $('#founder-index').textContent=String(founderIndex+1).padStart(2,'0')+' / 03 — THE FOUNDERS';
 const list=$('#founder-duties');list.replaceChildren();(duties[f.key]||[]).forEach(d=>{const li=document.createElement('li');li.textContent=d;list.append(li);});
}
function empty(title,body){return '<div class="empty-state"><h2>'+title+'</h2><p>'+body+'</p></div>';}
function people(){
 content.innerHTML=intro('PEOPLE / POTENTIAL / CONNECTION','People make<br>possibility real.','Meet the people behind the work. Explore approved public profiles, or tell us how you would like to contribute.')+
 '<div class="directory-controls"><label>Find a person<input id="people-search" type="search" placeholder="Search by name or role"></label><label>Explore<select id="people-kind"><option value="all">Everyone</option><option value="founder">Founders</option><option value="creator">Creators &amp; influencers</option><option value="ambassador">Campus ambassadors &amp; presidents</option><option value="student">Student builders</option></select></label></div><p id="people-count" class="fine" role="status"></p><div id="people-results" class="directory-results"></div><div class="invitation"><h2>Bring your perspective.</h2><p>Creators, campus leaders and student builders can express interest in joining the community.</p><a class="primary" href="mailto:info@lastbenchbd.com?subject=Last%20Bench%20Community">Start a conversation →</a></div>';
 $('#people-search').oninput=renderPeople;$('#people-kind').onchange=renderPeople;renderPeople();
}
function renderPeople(){
 const records=profiles.map(f=>({...f,kind:'founder',public:true,approved:true,description:f.title}));
 const rows=selectPublicRecords(records,$('#people-kind').value,$('#people-search').value);
 $('#people-count').textContent=rows.length+' public '+(rows.length===1?'profile':'profiles');
 const results=$('#people-results');results.replaceChildren();
 if(!rows.length){results.innerHTML=empty('No published profiles here yet.','Only approved public profiles appear here. Private student records and unverified community rosters stay private.');return;}
 rows.forEach(f=>{
  const card=document.createElement('article');card.className='person-tile';
  const img=document.createElement('img');img.src=f.portrait;img.alt=f.name;img.loading='lazy';
  const h=document.createElement('h2');h.textContent=f.name;const p=document.createElement('p');p.textContent=f.title;
  const a=document.createElement('a');a.href='#company';a.textContent='Explore profile →';a.onclick=()=>{founderIndex=profiles.findIndex(x=>x.key===f.key);};
  card.append(img,h,p,a);results.append(card);
 });
}
function work(){
 content.innerHTML=intro('WORK / PROOF / POSSIBILITY','Ideas deserve<br>to become real.','Explore products and project work by industry and delivery state. A concept is a beginning; proven work carries evidence.')+
 '<div class="work-tabs" role="group" aria-label="Work categories"><button class="quiet active" data-work="projects" aria-pressed="true">ProjectX websites</button><button class="quiet" data-work="products" aria-pressed="false">Student products</button><button class="quiet" data-work="events" aria-pressed="false">Events &amp; experiences</button></div><div id="work-results"></div><div class="invitation"><h2>What are you building?</h2><p>Bring a problem, a product or a business ready for its next chapter.</p><a href="mailto:info@lastbenchbd.com?subject=co.lab%20Project" class="primary">Build with co.lab →</a></div>';
 $$('[data-work]').forEach(b=>b.onclick=()=>{ $$('[data-work]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderWork(b.dataset.work);});renderWork('projects');
}
function renderWork(kind){
 const target=$('#work-results');
 if(kind==='products'){target.innerHTML=empty('The next generation is building.','Student products will appear here when their builders approve a public showcase. A product’s stage and evidence will travel with it.');return;}
 if(kind==='events'){target.innerHTML=empty('Every experience has a story.','Our event archive is being prepared with original media, accurate credits and the role behind each project. Ask us about the work you have in mind.');return;}
 target.replaceChildren();
 const rows=selectPublicRecords(publicWork,'all','');
 if(!rows.length){target.innerHTML=empty('New work is taking shape.','Approved public projects will appear here with their industry, delivery stage and supporting evidence.');return;}
 rows.forEach(r=>{
  const a=document.createElement('article');a.className='work-item';
  const left=document.createElement('div');const k=document.createElement('p');k.className='eyebrow';k.textContent=r.category;const h=document.createElement('h2');h.textContent=r.name;left.append(k,h);
  const right=document.createElement('div');const status=document.createElement('p');status.className='status-tag';status.textContent=r.status;const p=document.createElement('p');p.textContent=r.description;const link=document.createElement('a');link.href=r.href;link.className='quiet';link.textContent='View design concept →';right.append(status,p,link);a.append(left,right);target.append(a);
 });
}
function intelligence(){
 content.innerHTML=intro('INTELLIGENCE / CLARITY / DIRECTION','A clearer next move.','Dr. X is your personal AI assistant. Co.MPASS is the business intelligence workspace designed to coordinate evidence, specialist agents and human decisions.')+
 '<div class="company-architecture"><div><p class="eyebrow">PERSONAL ASSISTANCE</p><h2>Dr. X</h2><p>Start with published LastBench information. Personal records stay behind their existing sign-in and permissions.</p><button class="primary" data-open-chat>Ask Dr. X →</button></div><div><p class="eyebrow">BUSINESS INTELLIGENCE</p><h2>Co.MPASS</h2><p>One priority. Clear evidence. Accountable next actions.</p><p class="fine">Private workspace access is not connected through this public experience. No agent operation is implied.</p><a href="mailto:info@lastbenchbd.com?subject=Co.MPASS%20Workspace%20Access" class="quiet">Request workspace access →</a></div></div>';
}
function render(){
 routeEpoch++;entry.cancel();
 const route=resolveScene(location.hash);document.body.dataset.view=route.view;$('#main-nav').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');
 $('#hub-view').hidden=route.view!=='hub';$('#world-view').hidden=route.view!=='world';content.hidden=!['company','people','work','intelligence'].includes(route.view);
 if(route.view==='world'){selected=route.world;document.body.dataset.world=selected;chapter=0;world();}
 else if(route.view==='hub'){image.src=sources.hub;select(selected);}
 else{({company,people,work,intelligence}[route.view]||(()=>{}))();}
 $$('[data-nav]').forEach(a=>{if(a.dataset.nav===route.view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(scene){scene.dispose();scene=null;depthOn=false;$('.environment').classList.remove('hidden-bg');$('#motion-toggle').textContent='Enable depth';$('#motion-toggle').setAttribute('aria-pressed','false');}
 $('#motion-toggle').hidden=!['hub','world'].includes(route.view);$('#scene-status').textContent='';
 if(location.hash!=='#paths'){window.scrollTo({top:0,behavior:'instant'});if(route.view==='world')$('#world-title').focus({preventScroll:true});else if(route.view!=='hub')content.focus({preventScroll:true});}
 document.title=(route.view==='hub'?'Last Bench — Choose Your Path':route.view==='world'?worlds[selected].name+' — Last Bench':route.view[0].toUpperCase()+route.view.slice(1)+' — Last Bench');
}
window.addEventListener('hashchange',render);render();document.body.classList.add('is-enhanced');
async function toggleDepth(){
 if(loadingScene)return;
 if(depthOn){depthOn=false;scene?.pause();$('.environment').classList.remove('hidden-bg');$('#motion-toggle').textContent='Enable depth';$('#motion-toggle').setAttribute('aria-pressed','false');entry.finish();return;}
 if(reduced.matches||navigator.connection?.saveData){$('#scene-status').textContent='Static mode respects your device preferences.';return;}
 loadingScene=true;$('#motion-toggle').disabled=true;const epoch=routeEpoch,source=image.src;
 try{
  const {createCinematicScene}=await import('./cinematic-scene.js');
  if(epoch!==routeEpoch)return;
  if(!scene){
   const candidate=await createCinematicScene($('#scene-mount'),source,()=>{scene?.dispose();scene=null;depthOn=false;$('.environment').classList.remove('hidden-bg');$('#scene-status').textContent='Static view active.';$('#motion-toggle').textContent='Enable depth';$('#motion-toggle').setAttribute('aria-pressed','false');});
   if(epoch!==routeEpoch||reduced.matches||navigator.connection?.saveData){candidate.dispose();return;}
   scene=candidate;
  }
  depthOn=true;scene.select(selected);if(canAnimate(preferences()))scene.resume();$('.environment').classList.add('hidden-bg');$('#motion-toggle').textContent='Pause depth';$('#motion-toggle').setAttribute('aria-pressed','true');$('#scene-status').textContent='Move your pointer to look around.';
 }catch{depthOn=false;$('#scene-status').textContent='Static view active. All paths are available.';}finally{loadingScene=false;$('#motion-toggle').disabled=false;}
}
$('#motion-toggle').onclick=toggleDepth;
reduced.addEventListener('change',()=>{if(reduced.matches&&depthOn)toggleDepth();});
document.addEventListener('visibilitychange',()=>{if(scene){if(canAnimate(preferences()))scene.resume();else scene.pause();}if(document.hidden)entry.finish();});
document.addEventListener('click',e=>{if(e.target.closest('[data-open-chat]'))openChat(null);});
function addMessage(text,user=false,source){
 const node=document.createElement('div');node.className='chat-message'+(user?' user':'');node.textContent=text;
 if(source){const a=document.createElement('a');a.href=source;a.textContent='Explore this path →';a.addEventListener('click',()=>$('#chat-dialog').close());node.append(a);}
 $('#chat-messages').append(node);node.scrollIntoView({block:'nearest'});
}
function openChat(founder){
 activeFounder=founder;$('#chat-title').textContent=founder?'Ask about '+founder.name:'Ask Dr. X';
 $('#chat-messages').replaceChildren();addMessage(founder?'Explore the approved profile of '+founder.name+'. Answers describe published information; they do not speak on the founder’s behalf.':'What would you like to study, build or grow? I can help you explore published LastBench information.');
 $('#chat-dialog').showModal();$('#chat-input').focus();
}
$('#chat-close').onclick=()=>$('#chat-dialog').close();
$('#chat-form').onsubmit=e=>{e.preventDefault();const value=$('#chat-input').value.trim();if(!value)return;$('#chat-input').value='';addMessage(value,true);const reply=guideAnswer(value,activeFounder);addMessage(reply.text,false,reply.source);};

