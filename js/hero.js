(function(){const hero=document.querySelector('.hero'),canvas=document.getElementById('fluid');if(!window.THREE||!canvas)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,R=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),sc=new THREE.Scene();
const fs=`uniform float u_time;uniform vec2 u_resolution;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;uv.x*=u_resolution.x/u_resolution.y;
vec2 st=uv*0.7;st+=vec2(snoise(st+u_time*0.05),snoise(st-u_time*0.05))*0.3;
float beam=smoothstep(0.1,0.8,snoise(vec2(st.x+st.y*1.5-u_time*0.15,u_time*0.02)));
vec3 glow=mix(vec3(0.34,0.14,0.82),vec3(0.62,0.28,0.98),snoise(uv*1.5+u_time*0.1)*0.5+0.5);
gl_FragColor=vec4(vec3(0.012,0.010,0.022)+glow*beam*0.75,1.0);}`;
const U={u_time:{value:8},u_resolution:{value:new THREE.Vector2(1,1)}};
sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(position,1.0);}',fragmentShader:fs,uniforms:U})));
const size=()=>{const w=hero.clientWidth,h=hero.clientHeight;R.setSize(w,h,false);U.u_resolution.value.set(w*R.getPixelRatio(),h*R.getPixelRatio())};
new ResizeObserver(size).observe(hero);size();const ck=new THREE.Clock();let vis=true;
new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(hero);
(function f(){if(vis){U.u_time.value=ck.getElapsedTime();R.render(sc,cam)}if(!reduce)requestAnimationFrame(f)})();R.render(sc,cam);})();
