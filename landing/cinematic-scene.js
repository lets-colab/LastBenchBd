let threePromise;
function loadThree(){
 if(window.THREE)return Promise.resolve(window.THREE);
 if(!threePromise)threePromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/three.min.js';s.onload=()=>resolve(window.THREE);s.onerror=reject;document.head.append(s);});
 return threePromise;
}
export async function createCinematicScene(mount,src,onFailure){
 const THREE=await loadThree();
 const renderer=new THREE.WebGLRenderer({alpha:false,antialias:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<600?1:1.5));
 renderer.setClearColor(0x111111);mount.replaceChildren(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(48,1,.1,50);camera.position.z=5;
 const stage=new THREE.Scene();let stopped=true,disposed=false,raf=0,texture,mesh,entering=null,last=0;
 const pointer={x:0,y:0},focus={x:0,y:0,z:5};
 try{
  await new Promise((resolve,reject)=>new THREE.TextureLoader().load(src,t=>{texture=t;texture.colorSpace=THREE.SRGBColorSpace;resolve();},undefined,reject));
 }catch(error){renderer.dispose();renderer.domElement.remove();throw error;}
 const material=new THREE.MeshBasicMaterial({map:texture});
 mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);stage.add(mesh);
 const resize=()=>{const r=mount.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();const viewH=2*5*Math.tan(24*Math.PI/180)*1.12;const ratio=texture.image.width/texture.image.height;let h=viewH,w=h*ratio;if(w<viewH*camera.aspect){w=viewH*camera.aspect;h=w/ratio;}mesh.scale.set(w,h,1);};
 const move=e=>{pointer.x=(e.clientX/innerWidth-.5)*.12;pointer.y=-(e.clientY/innerHeight-.5)*.08;};
 const lost=e=>{e.preventDefault();pause();onFailure();};
 renderer.domElement.addEventListener('webglcontextlost',lost);
 window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});resize();
 function tick(t){
  if(stopped||disposed)return;const dt=Math.min((t-last)/1000,.06);last=t;
  if(entering){const p=Math.min((t-entering.start)/650,1),ease=1-Math.pow(1-p,3);focus.z=5-ease*.7;if(p===1){const cb=entering.cb;entering=null;pause();cb();return;}}
  const k=1-Math.exp(-Math.max(dt,.016)*3);
  camera.position.x+=(focus.x+pointer.x-camera.position.x)*k;camera.position.y+=(pointer.y-camera.position.y)*k;camera.position.z+=(focus.z-camera.position.z)*k;
  camera.lookAt(focus.x*.4,0,0);renderer.render(stage,camera);raf=requestAnimationFrame(tick);
 }
 function pause(){stopped=true;entering=null;cancelAnimationFrame(raf);}
 function resume(){if(disposed)return;stopped=false;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
 function dispose(){disposed=true;pause();window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);mesh.geometry.dispose();material.dispose();texture.dispose();renderer.dispose();renderer.domElement.remove();}
 return {pause,resume,dispose,select(id){focus.x=id==='malaysia'?-.06:id==='colab'?.06:0;},enter(cb){entering={start:performance.now(),cb};}};
}

