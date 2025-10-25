// Theme toggle (auto + manual)
const setTheme=(mode)=>{
  document.documentElement.dataset.theme=mode;
  localStorage.setItem('theme',mode);
};
(() => {
  const saved=localStorage.getItem('theme');
  if(saved) setTheme(saved);
})();

// Keyboard shortcuts & Spotlight
const overlay = document.getElementById('spotlightOverlay');
const q = document.getElementById('spotlightInput');
const results = document.getElementById('results');

const actions = [
  {label:'Go: Home', tag:'nav', run:()=>location.href='/'},
  {label:'Go: About', tag:'nav', run:()=>location.href='/about/'},
  {label:'Toggle theme', tag:'action', run:()=> setTheme(
    (document.documentElement.dataset.theme==='dark'?'light':'dark')
  )},
  {label:'Open Projects', tag:'nav', run:()=>location.href='/projects/'},
  {label:'Open Lab', tag:'nav', run:()=>location.href='/lab/'},
  {label:'Email me', tag:'action', run:()=>location.href='mailto:hello@yourdomain.tld'}
];

let cursor = 0;
function render(list){
  results.innerHTML='';
  list.forEach((a,i)=>{
    const el=document.createElement('div');
    el.className='item';
    el.setAttribute('role','option');
    el.setAttribute('aria-selected', i===cursor ? 'true':'false');
    el.innerHTML=`<span>${a.label}</span><span class="tag">${a.tag}</span>`;
    el.onclick=()=>{a.run(); closeSpotlight();};
    results.appendChild(el);
  });
}
function openSpotlight(){ overlay.style.display='grid'; q.value=''; cursor=0; render(actions); q.focus(); }
function closeSpotlight(){ overlay.style.display='none'; }

document.addEventListener('keydown',(e)=>{
  if((e.key.toLowerCase()==='k' && (e.metaKey||e.ctrlKey))){ e.preventDefault(); openSpotlight(); }
  if(e.key==='Escape' && overlay.style.display==='grid'){ closeSpotlight(); }
  if(e.key==='?' && !overlay.matches(':visible')){ alert('Shortcuts:\n• Cmd/Ctrl+K: Command palette\n• ←/→: Move section\n• T: Toggle theme'); }
  if(e.key==='t'){ setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'); }
});
q?.addEventListener('input',()=>{
  const v=q.value.toLowerCase();
  const filtered=actions.filter(a=>a.label.toLowerCase().includes(v) || a.tag.includes(v));
  cursor=0; render(filtered.length?filtered:actions);
});
document.addEventListener('keydown',(e)=>{
  if(overlay.style.display==='grid'){
    const items=[...results.querySelectorAll('.item')];
    if(['ArrowDown','j'].includes(e.key)){ e.preventDefault(); cursor=Math.min(cursor+1, items.length-1); render(actions); }
    if(['ArrowUp','k'].includes(e.key)){ e.preventDefault(); cursor=Math.max(cursor-1, 0); render(actions); }
    if(e.key==='Enter'){ actions[cursor].run(); closeSpotlight(); }
  }
});

// 3D tilt for cards
document.addEventListener('mousemove',(e)=>{
  document.querySelectorAll('.card[data-tilt]').forEach(card=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX - r.left)/r.width - .5;
    const y=(e.clientY - r.top)/r.height - .5;
    card.style.transform=`rotateY(${x*8}deg) rotateX(${ -y*8 }deg) translateZ(0)`;
  });
});
document.addEventListener('mouseleave',()=> {
  document.querySelectorAll('.card[data-tilt]').forEach(c=> c.style.transform='');
});

// Section navigation (left/right arrows)
(() => {
  const sections=[...document.querySelectorAll('[data-section]')];
  let idx=0;
  function go(i){
    idx=((i%sections.length)+sections.length)%sections.length;
    sections.forEach((s,si)=> s.style.opacity = (si===idx?1:.35));
    sections[idx].scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.addEventListener('keydown',(e)=>{
    if(e.key==='ArrowRight') go(idx+1);
    if(e.key==='ArrowLeft') go(idx-1);
  });
})();

// GitHub activity (Home only)
async function loadActivity(){
  const el=document.getElementById('activity');
  if(!el) return;
  try{
    const res=await fetch('https://api.github.com/users/eoinmctiernan/events/public');
    const data=await res.json();
    const items=(Array.isArray(data)?data:[]).slice(0,6).map(ev=>{
      const repo=ev.repo?.name ?? 'repo';
      const type=ev.type.replace('Event','');
      const when=new Date(ev.created_at).toLocaleString();
      return `<div class="item"><span>${type}</span><span class="tag">${repo} • ${when}</span></div>`;
    }).join('');
    el.innerHTML = items || '<div class="muted">No recent public events.</div>';
  }catch{
    el.innerHTML='<div class="muted">Activity unavailable.</div>';
  }
}
loadActivity();

// About filters
function setupFilters(){
  const wrap=document.getElementById('filters');
  if(!wrap) return;
  const chips=[...wrap.querySelectorAll('.chip')];
  const entries=[...document.querySelectorAll('.entry')];
  chips.forEach(ch=>{
    ch.addEventListener('click',()=>{
      const key=ch.dataset.key;
      const active=ch.dataset.active==='true';
      ch.dataset.active=(!active).toString();
      const activeKeys=chips.filter(c=>c.dataset.active==='true').map(c=>c.dataset.key);
      entries.forEach(e=>{
        const tags=(e.dataset.tags||'').split(',');
        e.style.display = activeKeys.length===0 || activeKeys.some(k=>tags.includes(k)) ? '' : 'none';
      });
    });
  });
}
setupFilters();
