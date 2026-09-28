// Supabase config: paste project URL + anon (public) key. Leave empty to use data/data.json.
const CFG={url:'',key:''};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Date(d).toLocaleDateString('en',{year:'numeric',month:'long',day:'numeric'}):'To be announced';
async function load(t){
  if(CFG.url){try{const r=await fetch(`${CFG.url}/rest/v1/${t}?select=*`,{headers:{apikey:CFG.key,Authorization:'Bearer '+CFG.key}});if(r.ok)return await r.json()}catch(e){}}
  return (await (await fetch('data/data.json')).json())[t]||[];
}
const gameCard=g=>`<a class="card" href="game.html?slug=${esc(g.slug)}">${g.logo?`<img src="${esc(g.logo)}" alt="${esc(g.title)} logo">`:''}<h3>${esc(g.title)}</h3><p>${esc(g.tagline)}</p><span class="tag">${esc(g.status)}</span></a>`;
const memCard=m=>`<a class="card member" href="member.html?slug=${esc(m.slug)}">${m.photo?`<img src="${esc(m.photo)}" alt="${esc(m.name)}">`:`<div class="ph" aria-hidden="true">${esc(m.name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div>`}<h3>${esc(m.name)}</h3><p>${esc(m.role)}</p>${m.former?'<span class="tag">Former member</span>':''}</a>`;
const grid=(a,f,e)=>a.length?`<div class="grid">${a.map(f).join('')}</div>`:`<p class="empty">${e}</p>`;
(async()=>{
  const P=document.body.dataset.page,slug=new URLSearchParams(location.search).get('slug'),A=$('#app');
  document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.p===P||(P==='game'&&a.dataset.p==='games')||(P==='member'&&a.dataset.p==='team'))a.classList.add('on')});
  if(['audio','films','about'].includes(P)&&P!=='audio')return;
  const [G,M]=P==='audio'?[[],[]]:await Promise.all([load('games'),load('members')]);
  if(P==='index')A.innerHTML=`<section class="hero"><h1>Gravewatch Studio</h1><p>TODO: studio tagline. Games, sound and stories from the underground.</p><a class="btn" href="games.html">Browse games</a><a class="btn alt" href="team.html">Meet the team</a></section><h2>Games</h2>${grid(G,gameCard,'No games yet.')}`;
  if(P==='games')A.innerHTML=`<h2>Games</h2>${grid(G,gameCard,'No games yet.')}`;
  if(P==='team')A.innerHTML=`<h2>Team</h2>${grid(M.filter(m=>!m.former),memCard,'No members yet.')}<h2>Former members</h2>${grid(M.filter(m=>m.former),memCard,'None listed.')}`;
  if(P==='game'){
    const g=G.find(x=>x.slug===slug);if(!g){A.innerHTML='<p class="empty">Game not found. <a href="games.html">Back to games</a></p>';return}
    document.title=g.title+' | Gravewatch Studio';
    const cr=(g.credits||[]).map(s=>M.find(m=>m.slug===s)).filter(Boolean);
    A.innerHTML=`<div class="gh">${g.logo?`<img src="${esc(g.logo)}" alt="${esc(g.title)} logo">`:`<h1>${esc(g.title)}</h1>`}<div><span class="tag">${esc(g.status)}</span><p>${esc(g.tagline)}</p>${g.itch_url?`<a class="btn" href="${esc(g.itch_url)}">Play on itch.io</a>`:''}${g.steam_url?`<a class="btn alt" href="${esc(g.steam_url)}">Wishlist on Steam</a>`:'<span class="tag">Steam page coming soon</span>'}</div></div><h2>About</h2><p>${esc(g.description)}</p><dl><dt>Version</dt><dd>${esc(g.version||'In development')}</dd><dt>Release</dt><dd>${fmt(g.release_date)}</dd><dt>Genre</dt><dd>${esc(g.genre)}</dd><dt>Engine</dt><dd>${esc(g.engine)}</dd></dl><h2>Credits</h2>${grid(cr,memCard,'Credits coming soon.')}`;
  }
  if(P==='member'){
    const m=M.find(x=>x.slug===slug);if(!m){A.innerHTML='<p class="empty">Member not found. <a href="team.html">Back to team</a></p>';return}
    document.title=m.name+' | Gravewatch Studio';
    const gs=G.filter(g=>(g.credits||[]).includes(m.slug)),L=m.links||{};
    A.innerHTML=`<div class="gh">${m.photo?`<img src="${esc(m.photo)}" alt="${esc(m.name)}">`:`<div class="ph" style="max-width:240px">${esc(m.name[0])}</div>`}<div><h1>${esc(m.name)}</h1><p>${esc(m.role)} ${m.former?'<span class="tag">Former member</span>':''}</p><p>${esc(m.bio)}</p>${m.cv_url?`<a class="btn" href="${esc(m.cv_url)}">View CV</a>`:''}${Object.entries(L).map(([k,v])=>`<a class="btn alt" href="${esc(v)}">${esc(k)}</a>`).join('')}</div></div><h2>Credited on</h2>${grid(gs,gameCard,'No games yet.')}`;
  }
  if(P==='audio'){
    const T=await load('audio_tracks'),K={song:'Songs',sound:'Sounds',sfx:'Sound effects'};let cur='song';
    const draw=()=>{const l=T.filter(t=>t.kind===cur);A.innerHTML=`<h2>Audio library</h2><div class="tabs" role="tablist">${Object.entries(K).map(([k,v])=>`<button role="tab" aria-selected="${k===cur}" data-k="${k}">${v}</button>`).join('')}</div><br>${l.length?l.map(t=>`<div class="card" style="margin-bottom:.8rem"><h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p><audio controls preload="none" src="${esc(t.file_url)}" style="width:100%"></audio></div>`).join(''):`<p class="empty">No ${K[cur].toLowerCase()} uploaded yet.</p>`}`;
      A.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{cur=b.dataset.k;draw()})};draw();
  }
})();
