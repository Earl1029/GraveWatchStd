// Supabase config: paste project URL + anon (public) key. Leave empty to use data/data.json.
const CFG={url:'',key:''};
const $=s=>document.querySelector(s);
// Mobile nav: hamburger dropdown (the button is only visible on narrow screens via CSS)
(()=>{const h=document.querySelector('body>header:not(.hero)'),n=h&&h.querySelector('nav');if(!n)return;
  n.id='site-nav';
  const b=document.createElement('button');b.type='button';b.className='nav-toggle';
  b.setAttribute('aria-label','Menu');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','site-nav');
  b.innerHTML='<span class="nav-bars" aria-hidden="true"></span>';h.insertBefore(b,n);
  const set=o=>{n.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))};
  b.onclick=()=>set(!n.classList.contains('open'));
  n.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&n.classList.contains('open')){set(false);b.focus()}});
  document.addEventListener('click',e=>{if(!h.contains(e.target))set(false)});
})();
const nf=document.getElementById('news');
if(nf)nf.addEventListener('submit',e=>{e.preventDefault();$('#newsmsg').textContent='Email updates are not open yet. Follow us on itch.io for now.';nf.reset()});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Date(d).toLocaleDateString('en',{year:'numeric',month:'long',day:'numeric'}):'To be announced';
async function load(t){
  if(CFG.url){try{const r=await fetch(`${CFG.url}/rest/v1/${t}?select=*`,{headers:{apikey:CFG.key,Authorization:'Bearer '+CFG.key}});if(r.ok)return await r.json()}catch(e){}}
  return (await (await fetch('data/data.json')).json())[t]||[];
}
const gameCard=g=>`<a class="card" href="game.html?slug=${esc(g.slug)}">${g.logo?`<img src="${esc(g.logo)}" alt="${esc(g.title)} logo">`:''}<h3>${esc(g.title)}</h3><p>${esc(g.tagline)}</p><span class="tag">${esc(g.status)}</span></a>`;
const memCard=m=>`<a class="card member" href="member.html?slug=${esc(m.slug)}">${m.photo?`<img src="${esc(m.photo)}" alt="${esc(m.name)}">`:`<div class="ph" aria-hidden="true">${esc(m.name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div>`}<h3>${esc(m.name)}</h3><p>${esc(m.role)}</p>${m.former?'<span class="tag">Former member</span>':''}</a>`;
const ini=n=>n.split(' ').map(w=>w[0]).slice(0,2).join('');
const accItem=m=>`<a class="acc-item" href="member.html?slug=${esc(m.slug)}">${m.photo?`<img src="${esc(m.photo)}" alt="">`:`<span class="acc-ph" aria-hidden="true">${esc(ini(m.name))}</span>`}<span class="acc-cap"><strong>${esc(m.name)}</strong><span>${esc(m.role)}</span></span></a>`;
const acc=a=>a.length?`<div class="acc">${a.map(accItem).join('')}</div>`:'<p class="empty">No members yet.</p>';
const grid=(a,f,e)=>a.length?`<div class="grid">${a.map(f).join('')}</div>`:`<p class="empty">${e}</p>`;
const ini2=n=>String(n||'').split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const phSlides=(label,n=5)=>Array.from({length:n},(_,i)=>({ph:String(i+1).padStart(2,'0'),tag:'Coming soon',title:`${label} ${i+1}`,subtitle:'Placeholder. Nothing added here yet.'}));
const gameSlide=g=>({src:g.logo,fit:'contain',alt:g.title+' logo',ph:ini2(g.title),tag:g.status,title:g.title,subtitle:g.tagline,meta:[{label:'Genre',value:g.genre},{label:'Engine',value:g.engine},{label:'Release',value:fmt(g.release_date)}],href:'game.html?slug='+encodeURIComponent(g.slug),cta:'View game'});
let CF;
const cf=(slides,label)=>{if(CF)CF.destroy();CF=Coverflow($('#cf'),slides,{label})};
const gamesView=G=>{const A=$('#app');A.innerHTML=`<h2>Games</h2><div id="cf"></div>`;G.length?cf(G.map(gameSlide),'Games'):A.innerHTML='<h2>Games</h2><p class="empty">No games yet.</p>'};
const homeView=async(G,M)=>{
  const A=$('#app'),S=(await load('posts')).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  const f=G.find(g=>g.featured)||G.find(g=>/production/i.test(g.status))||G[0];
  const feat=f?`<section class="feat" aria-label="Featured game"><div class="feat-art">${f.banner?`<img src="${esc(f.banner)}" alt="${esc(f.title)} key art">`:`<span aria-hidden="true">${esc(f.title)}</span>`}</div><div class="feat-body"><span class="tag">${esc(f.status)}</span><h2>${esc(f.title)}</h2><p>${esc(f.tagline)}</p><a class="btn" href="game.html?slug=${encodeURIComponent(f.slug)}">View game</a>${f.itch_url?`<a class="btn alt" href="${esc(f.itch_url)}">Play on itch.io</a>`:''}</div></section>`:'';
  const posts=S.length?`<section class="sec"><div class="sec-h"><h2>Latest from the devlog</h2><a class="more" href="devlog.html">All posts</a></div><div class="home-posts">${S.map(p=>`<a class="post" href="devlog.html"><div class="meta"><span class="tag">${esc(p.tag)}</span>${fmt(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></a>`).join('')}</div></section>`:'';
  const crew=M.filter(m=>!m.former);
  const team=crew.length?`<section class="sec"><div class="sec-h"><h2>The team</h2><a class="more" href="team.html">Meet the team</a></div><div class="crew">${crew.map(m=>`<a class="crew-m" href="member.html?slug=${encodeURIComponent(m.slug)}">${m.photo?`<img src="${esc(m.photo)}" alt="">`:`<span class="crew-ph" aria-hidden="true">${esc(ini2(m.name))}</span>`}<strong>${esc(m.name)}</strong><span>${esc(m.role)}</span></a>`).join('')}</div></section>`:'';
  const cta=`<section class="sec cta"><h2>Follow the build</h2><p>Playable builds are on itch.io. Devlogs and press material live here.</p><a class="btn" href="https://gravewatch-studio.itch.io">Play on itch.io</a><a class="btn alt" href="devlog.html">Read the devlog</a><a class="btn alt" href="press.html">Press kit</a></section>`;
  A.innerHTML=`${feat}<section class="sec"><h2>Games</h2><div id="cf"></div></section>${posts}${team}${cta}`;
  G.length?cf(G.map(gameSlide),'Games'):$('#cf').outerHTML='<p class="empty">No games yet.</p>';
};
(async()=>{
  const P=document.body.dataset.page,slug=new URLSearchParams(location.search).get('slug'),A=$('#app');
  document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.p===P||(P==='game'&&a.dataset.p==='games')||(P==='member'&&a.dataset.p==='team'))a.classList.add('on')});
  if(['about','press'].includes(P))return;
  const [G,M]=['audio','devlog','films','arts'].includes(P)?[[],[]]:await Promise.all([load('games'),load('members')]);
  if(P==='index')await homeView(G,M);
  if(P==='games')gamesView(G);
  if(P==='team')A.innerHTML=`<h2>Team</h2>${acc(M.filter(m=>!m.former))}<h2>Former members</h2>${grid(M.filter(m=>m.former),memCard,'None listed.')}`;
  if(P==='game'){
    const g=G.find(x=>x.slug===slug);if(!g){A.innerHTML='<p class="empty">Game not found. <a href="games.html">Back to games</a></p>';return}
    document.title=g.title+' | Gravewatch Studio';
    const cr=(g.credits||[]).map(s=>M.find(m=>m.slug===s)).filter(Boolean);
    const shots=g.screenshots||[];
    A.innerHTML=`<div class="gbanner">${g.banner?`<img src="${esc(g.banner)}" alt="${esc(g.title)} key art">`:`<span aria-hidden="true">${esc(g.title)}</span>`}</div><div class="gh">${g.logo?`<img src="${esc(g.logo)}" alt="${esc(g.title)} logo">`:`<h1>${esc(g.title)}</h1>`}<div><span class="tag">${esc(g.status)}</span><p>${esc(g.tagline)}</p>${g.itch_url?`<a class="btn" href="${esc(g.itch_url)}">Play on itch.io</a>`:''}${g.steam_url?`<a class="btn alt" href="${esc(g.steam_url)}">Wishlist on Steam</a>`:''}</div></div><h2>About</h2><p>${esc(g.description)}</p><dl><dt>Version</dt><dd>${esc(g.version||'In development')}</dd><dt>Release</dt><dd>${fmt(g.release_date)}</dd><dt>Genre</dt><dd>${esc(g.genre)}</dd><dt>Engine</dt><dd>${esc(g.engine)}</dd></dl><h2>Screenshots</h2><div class="shots">${shots.length?shots.map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(u)}" alt="${esc(g.title)} screenshot ${i+1}"></a>`).join(''):[1,2,3].map(()=>'<div class="shot-ph">Screenshot coming soon</div>').join('')}</div><h2>Credits</h2>${grid(cr,memCard,'Credits coming soon.')}`;
  }
  if(P==='member'){
    const m=M.find(x=>x.slug===slug);if(!m){A.innerHTML='<p class="empty">Member not found. <a href="team.html">Back to team</a></p>';return}
    document.title=m.name+' | Gravewatch Studio';
    const gs=G.filter(g=>(g.credits||[]).includes(m.slug)),L=m.links||{};
    A.innerHTML=`<div class="gh">${m.photo?`<img src="${esc(m.photo)}" alt="${esc(m.name)}">`:`<div class="ph" style="max-width:240px">${esc(m.name[0])}</div>`}<div><h1>${esc(m.name)}</h1><p>${esc(m.role)} ${m.former?'<span class="tag">Former member</span>':''}</p><p>${esc(m.bio)}</p>${m.cv_url?`<a class="btn" href="${esc(m.cv_url)}">View CV</a>`:''}${Object.entries(L).map(([k,v])=>`<a class="btn alt" href="${esc(v)}">${esc(k)}</a>`).join('')}</div></div><h2>Credited on</h2>${grid(gs,gameCard,'No games yet.')}`;
  }
  if(P==='devlog'){
    const S=await load('posts');S.sort((a,b)=>b.date.localeCompare(a.date));const tg=['All',...new Set(S.map(p=>p.tag))];let cur='All';
    const draw=()=>{A.innerHTML=`<h2>Devlog</h2><div class="filters">${tg.map(t=>`<button class="${t===cur?'on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>${S.filter(p=>cur==='All'||p.tag===cur).map(p=>`<article class="post"><div class="meta"><span class="tag">${esc(p.tag)}</span>${fmt(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></article>`).join('')||'<p class="empty">No posts yet.</p>'}`;
      A.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{cur=b.dataset.t;draw()})};draw();
  }
  if(P==='audio'){
    const T=await load('audio_tracks'),K={song:'Songs',sound:'Sounds',sfx:'Sound effects'},L={song:'Song',sound:'Sound',sfx:'Sound effect'};let cur='song';
    const draw=()=>{const l=T.filter(t=>t.kind===cur);
      A.innerHTML=`<h2>Audio library</h2><div class="tabs" role="tablist">${Object.entries(K).map(([k,v])=>`<button role="tab" aria-selected="${k===cur}" data-k="${k}">${v}</button>`).join('')}</div><div id="cf"></div>`;
      cf(l.length?l.map(t=>({src:t.cover_url,alt:t.title+' cover',ph:ini2(t.title),tag:L[t.kind],title:t.title,subtitle:t.artist,extra:t.file_url?`<audio controls preload="none" src="${esc(t.file_url)}"></audio>`:''})):phSlides(L[cur]),K[cur]);
      A.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{cur=b.dataset.k;draw()})};draw();
  }
  if(P==='films'){
    const F=await load('films');
    A.innerHTML='<h2>Films</h2><div id="cf"></div>';
    cf(F.length?F.map(f=>({src:f.poster_url,fit:'cover',alt:f.title+' poster',ph:ini2(f.title),title:f.title,subtitle:f.runtime,text:f.description,meta:f.year?[{label:'Year',value:String(f.year)}]:[],href:f.watch_url,cta:'Watch'})):phSlides('Film'),'Films');
  }
  if(P==='arts'){
    const R=await load('arts'),tg=['All',...new Set(R.map(a=>a.category).filter(Boolean))];let cur='All';
    const draw=()=>{const l=R.filter(a=>cur==='All'||a.category===cur);
      A.innerHTML=`<h2>Arts</h2>${tg.length>2?`<div class="filters">${tg.map(t=>`<button class="${t===cur?'on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}<div id="cf"></div>`;
      cf(R.length?l.map(a=>({src:a.image_url,fit:'cover',alt:a.title,ph:ini2(a.title),tag:a.category,title:a.title,subtitle:a.artist,text:a.description})):phSlides('Artwork'),'Arts');
      A.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{cur=b.dataset.t;draw()})};draw();
  }
})();
