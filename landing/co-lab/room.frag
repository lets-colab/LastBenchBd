precision highp float;
uniform vec2 uR,uPointer;uniform float uT,uStage; 
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float sph(vec3 p,float r){return length(p)-r;}
float cyl(vec3 p,float r,float h){return max(length(p.xz)-r,abs(p.y)-h);}
float capsule(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a;vec3 v=b-a;return length(q-v*clamp(dot(q,v)/dot(v,v),0.,1.))-r;}
vec2 smoothUnion(vec2 a,vec2 b){return a.x<b.x?a:b;}
vec2 model(vec3 p){vec2 d=vec2(200.,0.);
  // Architectural titanium ribs down both sides of the laboratory.
  for(int i=0;i<6;i++){float z=-3.-float(i)*4.4;for(int s=0;s<2;s++){float side=s==0?-4.15:4.15;
    d=smoothUnion(d,vec2(box(p-vec3(side,.65,z),vec3(.10,2.95,.13)),1.));
    d=smoothUnion(d,vec2(box(p-vec3(side*.88,3.33,z),vec3(.24,.06,1.26)),1.));
  }}
  // Entry chamber doors physically separate along rails.
  float entry=floor(uStage+.5);
  if(entry<1.5){float separation=min(1.25,max(.06,uT*.24));for(int j=0;j<2;j++){float dir=j==0?-1.:1.;
    vec3 doorP=p-vec3(dir*(.72+separation),.10,-2.75);
    d=smoothUnion(d,vec2(box(doorP,vec3(.70,1.72,.07)),2.));
    d=smoothUnion(d,vec2(box(doorP+vec3(0.,0.,.08),vec3(.715,1.75,.035)),1.));
  }}
  // Central research plinth and glass containment chamber.
  float shift = uStage*0.37;
  vec3 q=p-vec3(.0,-.15,-8.0-shift);
  d=smoothUnion(d,vec2(box(q-vec3(0.,-1.13,0.),vec3(2.05,.17,1.45)),1.));
  float edge=box(q,vec3(1.76,1.42,1.08));
  float hollow=-box(q,vec3(1.71,1.37,1.03));
  d=smoothUnion(d,vec2(max(edge,hollow),2.));
  d=smoothUnion(d,vec2(box(q-vec3(0.,1.44,0.),vec3(1.92,.08,1.2)),1.));
  // Change physical research instruments as visitor advances through the lab.
  float mode=floor(uStage+.5);
  if(mode<1.5){
   for(int i=0;i<5;i++){float a=float(i)*1.2566+uT*.11;vec3 v=q-vec3(cos(a)*.71,sin(a*1.35)*.38,sin(a)*.5);d=smoothUnion(d,vec2(box(v,vec3(.24)),i==0?3.:2.));}
   d=smoothUnion(d,vec2(cyl(q,0.075,.98),3.));
  }else if(mode<2.5){
   for(int i=0;i<5;i++){float a=float(i)*1.25+uT*.09;vec3 v=q-vec3(cos(a)*.8,sin(a*1.0)*.45,sin(a)*.6);d=smoothUnion(d,vec2(box(v,vec3(.21,.23,.21)),3.));}
  }else if(mode<3.5){
   for(int i=0;i<4;i++){float x=(float(i)-1.5)*.76;d=smoothUnion(d,vec2(box(q-vec3(x,0.,0.),vec3(.23,.32,.28)),i==2?3.:2.));if(i<3)d=smoothUnion(d,vec2(capsule(q,vec3(x+.23,0.,0.),vec3(x+.53,0.,0.),.042),3.));}
  }else if(mode<4.5){
   for(int i=0;i<8;i++){float a=float(i)*.7854;vec3 v=vec3(cos(a)*.9,sin(a*1.6)*.5,sin(a)*.7);d=smoothUnion(d,vec2(sph(q-v,.17),i==0?3.:2.));d=smoothUnion(d,vec2(capsule(q,vec3(0.),v,.021),3.));}
  }else if(mode<5.5){
   for(int i=0;i<4;i++){float x=(float(i)-1.5)*.73;d=smoothUnion(d,vec2(box(q-vec3(x,0.,0.),vec3(.28,.52,.43)),i==0?3.:2.));}
  }else if(mode<6.5){
   for(int i=0;i<2;i++){float x=i==0?-.65:.65;d=smoothUnion(d,vec2(box(q-vec3(x,0.,0.),vec3(.5,.56,.4)),i==0?2.:3.));}
  }else{
   d=smoothUnion(d,vec2(abs(length(q.xy)-.95)-.058,3.));
   d=smoothUnion(d,vec2(sph(q,.38),2.));
  }
  return d;
}
vec3 norm(vec3 p){vec2 e=vec2(.004,0.);return normalize(vec3(model(p+e.xyy).x-model(p-e.xyy).x,model(p+e.yxy).x-model(p-e.yxy).x,model(p+e.yyx).x-model(p-e.yyx).x));}
float line(float x,float thickness){return 1.-smoothstep(0.,thickness,abs(fract(x)-.5));}
vec3 background(vec3 ro,vec3 rd){vec3 c=mix(vec3(.94,.96,.985),vec3(1.,1.,1.),clamp(rd.y*.65+.55,0.,1.));float t=100.;int surface=0;
 if(rd.y<-.001){float d=(-1.48-ro.y)/rd.y;if(d>0.&&d<t){t=d;surface=1;}}
 if(rd.y>.001){float d=(3.72-ro.y)/rd.y;if(d>0.&&d<t){t=d;surface=2;}}
 if(abs(rd.x)>.001){float x=rd.x>0.?4.45:-4.45;float d=(x-ro.x)/rd.x;if(d>0.&&d<t){t=d;surface=3;}}
 if(rd.z<-.001){float d=(-30.-ro.z)/rd.z;if(d>0.&&d<t){t=d;surface=4;}}
 if(surface>0){vec3 hit=ro+rd*t;float grid=0.;
 if(surface==1){grid=max(line(hit.x*1.0,.025),line(hit.z*.5,.03));c=vec3(.91,.94,.97)-.10*grid+vec3(.005,.009,.02)*sin(hit.x*.5);float spine=1.-smoothstep(.01,.065,abs(hit.x));c=mix(c,vec3(.18,.49,.99),spine*.35);}
 if(surface==2){grid=max(line(hit.x*.5,.022),line(hit.z*.5,.022));c=vec3(.975,.986,.99)-.035*grid;}
 if(surface==3){grid=max(line(hit.z*.5,.021),line(hit.y*.7,.028));c=vec3(.965,.981,.99)-.055*grid;float band=1.-smoothstep(.02,.18,abs(hit.y-.12));c=mix(c,vec3(.68,.82,.99),band*.26);}
 if(surface==4){c=vec3(.935,.963,.985);float trim=1.-smoothstep(.02,.07,abs(hit.x));c=mix(c,vec3(.17,.48,.98),trim*.27);}}
 float glow=exp(-7.*abs(rd.x-.15))*exp(-10.*abs(rd.y-.17));c+=vec3(.026,.045,.079)*glow;
 return c;}
void main(){vec2 uv=(gl_FragCoord.xy-uR*.5)/uR.y;
 vec3 ro=vec3(uPointer.x*.23,.38+uPointer.y*.09,5.3-uStage*.27);vec3 target=vec3(0.,.10,-8.8-uStage*.23);vec3 forward=normalize(target-ro);vec3 right=normalize(cross(forward,vec3(0.,1.,0.)));vec3 up=cross(right,forward);
 vec3 rd=normalize(forward*1.78+right*uv.x+up*uv.y);
 vec3 col=background(ro,rd);float t=0.,mat=0.;vec3 pos=vec3(0.);
 for(int i=0;i<70;i++){pos=ro+rd*t;vec2 hit=model(pos);if(hit.x<.015){mat=hit.y;break;}t+=max(hit.x*.78,.055);if(t>48.)break;}
 if(mat>0.&&t<48.){vec3 n=norm(pos);vec3 light=normalize(vec3(-.48,.77,.63));float diffuse=clamp(dot(n,light),0.,1.);float fres=pow(1.-max(0.,dot(-rd,n)),3.);vec3 base=mat<1.5?vec3(.57,.66,.75):mat<2.5?vec3(.86,.94,1.0):vec3(.12,.42,.96);
 vec3 material=base*(.51+.43*diffuse)+vec3(.47,.54,.61)*pow(max(dot(reflect(-light,n),-rd),0.),24.)*.45;
 if(mat>1.5&&mat<2.5){material=mix(background(ro,rd),material,.43)+vec3(.18,.25,.34)*fres;}
 if(mat>2.5){material+=vec3(.16,.24,.31)*fres;}
 col=mix(col,material,1.-exp(-t*.22));}
 float haze=exp(-length(uv-vec2(.25,.05))*2.2)*.032;col+=vec3(.02,.035,.055)*haze;
 col=pow(clamp(col,0.,1.),vec3(.94));gl_FragColor=vec4(col,1.);
}
