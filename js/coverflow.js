/* Coverflow carousel: vanilla port of the React CoverflowCarousel.
   Coverflow(root, slides, options) -> { destroy, goTo }
   slide: { src, alt, ph, fit:'cover'|'contain', tag, title, subtitle, text, meta:[{label,value}], extra(html), href, cta } */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

window.Coverflow=function(root,slides,opt){
  const o=Object.assign({rotate:44,depth:.6,perspective:3,falloff:.56,fade:.1,gap:.05,label:'Cover carousel'},opt||{});
  const count=slides.length;
  if(!count){root.innerHTML='';return{destroy(){},goTo(){}}}
  // Looping folds cards across the ring, which needs enough cards to hide the seam.
  const loop=o.loop!==undefined?o.loop:count>=5;

  root.className='cf';
  root.setAttribute('role','region');
  root.setAttribute('aria-roledescription','carousel');
  root.setAttribute('aria-label',o.label);
  const multi=count>1;
  root.innerHTML=
    `<div class="cf-wrap"><div class="cf-frame" tabindex="0"><div class="cf-stage">`+
    slides.map((s,i)=>`<div class="cf-card${s.fit==='contain'?' contain':''}" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${i+1} of ${count}">`+
      (s.src?`<img src="${esc(s.src)}" alt="${esc(s.alt||s.title)}" draggable="false">`:`<span class="cf-ph" aria-hidden="true">${esc(s.ph||'')}</span>`)+`</div>`).join('')+
    `</div></div>`+
    (multi?`<button type="button" class="cf-nav cf-prev" aria-label="Previous slide">&#8249;</button><button type="button" class="cf-nav cf-next" aria-label="Next slide">&#8250;</button>`:'')+
    `</div><div class="cf-cap" aria-live="polite"></div>`+
    (multi&&count<=12?`<div class="cf-dots">${slides.map((_,i)=>`<button type="button" aria-label="Go to slide ${i+1}" data-d="${i}"></button>`).join('')}</div>`:'');

  const frame=root.querySelector('.cf-frame'),cap=root.querySelector('.cf-cap');
  const cards=[...root.querySelectorAll('.cf-card')],dots=[...root.querySelectorAll('[data-d]')];
  let P=0,T=0,W=0,raf=null,drag=null,sel=-1;

  const idx=p=>((Math.round(p)%count)+count)%count;
  const clampP=p=>loop?p:Math.max(0,Math.min(count-1,p));

  function paint(){
    if(!W)return;
    const pitch=W*(1+o.gap);
    cards.forEach((c,i)=>{
      let off=i-P;
      if(loop){off=((off%count)+count)%count;if(off>count/2)off-=count}
      const d=Math.abs(off),ramp=Math.pow(d,o.falloff);
      const tilt=Math.min(o.rotate*ramp,82)*Math.sign(off);
      c.style.transform=`translateX(calc(-50% + ${off*pitch}px)) translateZ(${-o.depth*W*ramp}px) rotateY(${-tilt}deg)`;
      const edge=loop?Math.min(1,Math.max(0,count/2-d)):1;
      c.style.opacity=String(Math.max(0,1-o.fade*d)*edge);
      c.style.zIndex=String(100-Math.round(d));
    });
  }

  function caption(s){
    cap.innerHTML=`<div class="cf-in">`+
      (s.tag?`<span class="tag">${esc(s.tag)}</span>`:'')+
      `<h3>${esc(s.title)}</h3>`+
      (s.subtitle?`<p class="cf-sub">${esc(s.subtitle)}</p>`:'')+
      (s.text?`<p class="cf-text">${esc(s.text)}</p>`:'')+
      (s.meta&&s.meta.length?`<dl class="cf-meta">${s.meta.map(m=>`<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl>`:'')+
      (s.extra||'')+
      (s.href?`<a class="btn" href="${esc(s.href)}">${esc(s.cta||'Open')}</a>`:'')+
      `</div>`;
  }

  function select(i){
    if(i===sel)return;
    sel=i;
    cards.forEach((c,k)=>c.classList.toggle('on',k===i));
    dots.forEach((d,k)=>{d.classList.toggle('on',k===i);if(k===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')});
    caption(slides[i]);
  }

  function settle(t){
    if(raf!==null)cancelAnimationFrame(raf);
    T=t;select(idx(t));
    if(reduce){P=t;paint();raf=null;return}
    const step=()=>{
      const r=t-P;
      if(Math.abs(r)<.0004){P=t;paint();raf=null;return}
      P+=r*.16;paint();raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
  }
  const goTo=i=>settle(clampP(loop?i+Math.round((T-i)/count)*count:i));
  const nudge=by=>settle(clampP(Math.round(T)+by));
  const open=i=>{const h=slides[i].href;if(h)location.href=h};

  frame.addEventListener('pointerdown',e=>{
    if(e.button>0)return;
    if(raf!==null){cancelAnimationFrame(raf);raf=null}
    frame.setPointerCapture(e.pointerId);
    T=P;
    const c=e.target.closest('.cf-card');
    drag={id:e.pointerId,x:e.clientX,pos:P,v:0,t:performance.now(),moved:false,card:c?+c.dataset.i:null};
  });
  frame.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const pitch=W*(1+o.gap);if(!pitch)return;
    if(Math.abs(e.clientX-drag.x)>5)drag.moved=true;
    const now=performance.now(),prev=P;
    P=clampP(drag.pos-(e.clientX-drag.x)/pitch);
    drag.v=((P-prev)/Math.max(now-drag.t,1))*1000;drag.t=now;
    select(idx(P));paint();
  });
  const end=e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const d=drag;drag=null;
    // A press that never travelled is a click: centre card opens, side card comes forward.
    if(!d.moved&&d.card!==null&&e.type==='pointerup'){
      if(d.card===idx(P))open(d.card);else goTo(d.card);
      return;
    }
    const carried=Math.max(-2,Math.min(2,d.v*.18));
    settle(clampP(Math.round(P+carried)));
  };
  frame.addEventListener('pointerup',end);
  frame.addEventListener('pointercancel',end);
  frame.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();nudge(-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();nudge(1)}
    else if(e.key==='Home'&&!loop){e.preventDefault();goTo(0)}
    else if(e.key==='End'&&!loop){e.preventDefault();goTo(count-1)}
    else if(e.key==='Enter'){open(idx(P))}
  });
  const pv=root.querySelector('.cf-prev'),nx=root.querySelector('.cf-next');
  if(pv)pv.onclick=()=>nudge(-1);
  if(nx)nx.onclick=()=>nudge(1);
  dots.forEach(d=>d.onclick=()=>goTo(+d.dataset.d));

  const measure=()=>{W=cards[0].offsetWidth;paint()};
  const ro=new ResizeObserver(measure);ro.observe(frame);
  select(0);measure();

  return{goTo,destroy(){if(raf!==null)cancelAnimationFrame(raf);ro.disconnect();root.innerHTML=''}};
};
})();
