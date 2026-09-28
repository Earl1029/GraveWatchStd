/* Violet particle-field background (vanilla port of the ASMR static background).
   Fixed behind page content; particles gather and swirl around the pointer. */
(function(){
// On the homepage the hero shader sits on top; the particles show below it.
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv=document.createElement('canvas');
cv.id='asmr';cv.setAttribute('aria-hidden','true');
document.body.prepend(cv);
const ctx=cv.getContext('2d');if(!ctx)return;

const RADIUS=280,VORTEX=.07,PULL=.12;
const DEEP='124, 58, 237',LIGHT='167, 139, 250',GLOW='190, 130, 255',TRAIL='rgba(7, 6, 13, 0.18)';
let W=0,H=0,raf=0,P=[];
const mouse={x:-1000,y:-1000};

class Particle{
  constructor(){this.reset()}
  reset(){
    this.x=Math.random()*W;this.y=Math.random()*H;
    this.size=Math.random()*1.5+.5;
    this.vx=(Math.random()-.5)*.2;this.vy=(Math.random()-.5)*.2;
    this.color=Math.random()>.7?LIGHT:DEEP;   // 70% deep violet, 30% light violet
    this.alpha=Math.random()*.4+.1;
    this.rot=Math.random()*Math.PI*2;this.rotSpeed=(Math.random()-.5)*.05;
    this.glow=0;
  }
  update(){
    const dx=mouse.x-this.x,dy=mouse.y-this.y,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<RADIUS){
      const f=(RADIUS-dist)/RADIUS;
      this.vx+=(dx/dist)*f*PULL;this.vy+=(dy/dist)*f*PULL;                 // pull toward pointer
      this.vx+=(dy/dist)*f*VORTEX*10;this.vy-=(dx/dist)*f*VORTEX*10;       // swirl
      this.glow=f*.7;
    }else this.glow*=.92;
    this.x+=this.vx;this.y+=this.vy;
    this.vx*=.95;this.vy*=.95;
    this.vx+=(Math.random()-.5)*.04;this.vy+=(Math.random()-.5)*.04;
    this.rot+=this.rotSpeed+(Math.abs(this.vx)+Math.abs(this.vy))*.05;
    if(this.x<-20)this.x=W+20;if(this.x>W+20)this.x=-20;
    if(this.y<-20)this.y=H+20;if(this.y>H+20)this.y=-20;
  }
  draw(){
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rot);
    ctx.fillStyle=`rgba(${this.color}, ${Math.min(this.alpha+this.glow,.9)})`;
    if(this.glow>.3){ctx.shadowBlur=8*this.glow;ctx.shadowColor=`rgba(${GLOW}, ${this.glow})`}
    const s=this.size;
    ctx.beginPath();ctx.moveTo(0,-s*2.5);ctx.lineTo(s,0);ctx.lineTo(0,s*2.5);ctx.lineTo(-s,0);ctx.closePath();ctx.fill();
    ctx.restore();
  }
}

function size(){
  const dpr=Math.min(devicePixelRatio||1,1.5);
  W=innerWidth;H=innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#07060d';ctx.fillRect(0,0,W,H);
  // Scale density to screen area so phones stay smooth.
  const n=Math.max(250,Math.min(1000,Math.round(W*H/1800)));
  while(P.length<n)P.push(new Particle());
  P.length=n;
}
function frame(){
  ctx.fillStyle=TRAIL;ctx.fillRect(0,0,W,H);
  for(const p of P){p.update();p.draw()}
}
function loop(){frame();raf=requestAnimationFrame(loop)}

size();
addEventListener('resize',size);
if(reduce){for(let i=0;i<40;i++)frame();return}   // one settled still frame, no animation
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
addEventListener('touchmove',e=>{const t=e.touches[0];if(t){mouse.x=t.clientX;mouse.y=t.clientY}},{passive:true});
const away=()=>{mouse.x=mouse.y=-1000};
document.addEventListener('mouseleave',away);addEventListener('touchend',away);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(!raf)loop();
});
loop();
})();
