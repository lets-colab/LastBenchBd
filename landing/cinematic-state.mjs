export const worlds = Object.freeze({
 malaysia: Object.freeze({id:'malaysia', name:'Malaysia', label:'Study & Move', descriptor:'Education & Mobility', href:'malaysia/', outcome:'Your world gets bigger.', number:'01', next:'classa'}),
 classa: Object.freeze({id:'classa', name:'CLASS[Λ]', label:'Learn & Build', descriptor:'Skill Laboratory', href:'class-a/', outcome:'Turn possibility into proof.', number:'02', next:'colab'}),
 colab: Object.freeze({id:'colab', name:'co.lab', label:'Build & Grow', descriptor:'Business Laboratory', href:'https://co-lab-growth-os.lovable.app/', outcome:'Build what comes next.', number:'03', next:'hub'})
});
const views = new Set(['company','people','work','intelligence']);
export function resolveScene(hash='') {
 const value=String(hash).replace(/^#/,'');
 if (value.startsWith('world/') && Object.hasOwn(worlds,value.slice(6))) return {view:'world',world:value.slice(6)};
 return views.has(value)?{view:value}:{view:'hub'};
}
export function nextWorld(id){return worlds[id]?.next || 'hub';}
export function canAnimate(p={}) {return !p.reducedMotion && !p.saveData && !p.paused && !p.hidden;}
// Navigation owns its deadline; a paused or unavailable renderer cannot swallow a click.
export function createEntryTransition(commit){
 let timer=null,pending=null,generation=0;
 function cancel(){clearTimeout(timer);timer=null;pending=null;generation++;}
 function finish(){if(pending===null)return;const destination=pending;cancel();commit(destination);}
 return {cancel,finish,begin(destination,animate){
  cancel();pending=destination;const token=generation;
  const complete=()=>{if(token===generation)finish();};
  timer=setTimeout(complete,650);
  try{animate(complete);}catch{complete();}
 }};
}
export function selectPublicRecords(records=[],kind='all',query='') {
 if(!Array.isArray(records))return [];
 const text=String(query).trim().toLocaleLowerCase();
 return records.filter(r=>r.public===true && r.approved===true && (kind==='all'||r.kind===kind) && (!text||[r.name,r.category,r.description].filter(Boolean).join(' ').toLocaleLowerCase().includes(text)));
}

