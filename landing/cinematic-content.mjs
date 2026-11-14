export const chapters = {
 malaysia:[
  {kicker:'01 / THE STARTING POINT',title:'It starts where you are.',body:'A new place begins with a clear next step. Discover what you want to study, what you can invest and the questions that matter.',visual:'city'},
  {kicker:'02 / A WIDER WORLD',title:'See the possibility.',body:'Explore Kuala Lumpur and the universities around it. Compare your options with credible information, then ask a human when the answer matters.',visual:'city'},
  {kicker:'03 / YOUR NEXT CHAPTER',title:'Study. Settle. Belong.',body:'Discover → Match → Apply → Secure → Prepare → Arrive. Your journey should continue after landing, with an owner and evidence for every meaningful step.',visual:'city'}
 ],
 classa:[
  {kicker:'01 / ENTER THE SKILL LABORATORY',title:'One person.\nA full AI team.',body:'Learn to direct intelligence. Then use it to research, build, create, sell and operate. Your work becomes the proof.',visual:'class'},
  {kicker:'02 / FROM KNOWLEDGE TO CAPABILITY',title:'Build something\nthat works.',body:'Command. Research. Build. Create. Sell. Operate. Twenty hands-on classes connect practical skills to visible outputs.',visual:'class'},
  {kicker:'03 / PROOF OPENS DOORS',title:'Your work.\nYour next opportunity.',body:'A product should show the problem, the people it helps and evidence of what it can do. Explore the program or prepare your work for human review.',visual:'class'}
 ],
 colab:[
  {kicker:'01 / COLLABORATION',title:'Clarity is\nthe first experiment.',body:'Bring the people and the problem into the same room. Align the brand, the business and what needs to change.',visual:'colab'},
  {kicker:'02 / CONNECTION',title:'Ideas become\nliving systems.',body:'Turn direction into products, workflows, creative execution and repeatable operating systems.',visual:'colab'},
  {kicker:'03 / COMMUNITY',title:'Growth belongs\nto the connected.',body:'Ventures. Projects. Services. Community. Build relationships that compound trust, advocacy and opportunity.',visual:'colab'}
 ]
};
export const duties = {
 sayem:['Strategic partnerships','Company direction','Public trust'],
 fahim:['Operations and delivery','Education & Mobility journey','Guidance quality'],
 erfan:['Business innovation','Ecosystem architecture','CLASS[Λ] and co.lab']
};
export const publicWork = [{
 id:'skin-needs', name:'Skin Needs', category:'Beauty & retail', kind:'project', public:true, approved:true,
 status:'Independent design concept', description:'A cinematic storefront demonstration. Not a commissioned merchant storefront or an operational shop.',
 href:'showcase/skin-needs/'
}];
export function guideAnswer(message,founder) {
 const q=String(message).toLowerCase();
 if(founder)return {text:founder.name+' is '+founder.title+'. '+(duties[founder.key]||[]).join(' · ')+'. This answer describes the published LastBench profile; it is not a personal statement from '+founder.name+'.',source:'#company'};
 if(/visa|scholarship|fee|tuition|admission/.test(q))return {text:'Current fees, visa rules, scholarships and admission requirements need confirmation from official sources and a human adviser. I can help you find the Malaysia journey, but cannot promise an outcome.',source:'malaysia/'};
 if(/class|skill|learn|student product/.test(q))return {text:'CLASS[Λ] is the Skill Laboratory: practical AI skills, visible work and a venture-builder pathway. Start with the free masterclass or explore the 20-class program.',source:'class-a/'};
 if(/co.lab|colab|business|grow|project|creator/.test(q))return {text:'co.lab is the Business Laboratory. Enter through Ventures, Projects, Services or Community. Collaboration brings clarity; Connection builds systems; Community compounds relationships.',source:'#world/colab'};
 if(/compass|agent/.test(q))return {text:'Co.MPASS is being designed as a business intelligence workspace guided by cooperating agents and governed evidence. This public experience does not connect to private company records or establish that agents are operating.',source:'#intelligence'};
 if(/founder|erfan|sayem|fahim/.test(q))return {text:'Meet Sayem Ahmed, Fahim Shahbaz Mahmud and Erfan Uddin through their approved LastBench profiles. Dr. X can explain published role information; generated answers do not speak on a founder’s behalf.',source:'#company'};
 return {text:'Tell me whether you want to study and move, learn and build, or build and grow. LastBench connects these paths while keeping each journey focused on you.',source:'#hub'};
}

