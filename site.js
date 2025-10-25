// Theme toggle (persist)
const setTheme = (mode) => {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem('theme', mode);
};
(() => {
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
})();

// Spotlight / command palette
const overlay = document.getElementById('spotlightOverlay');
const q = document.getElementById('spotlightInput');
const results = document.getElementById('results');

const actions = [
  {label:'Go: Home', tag:'nav', run:()=>location.href='/'},
  {label:'Go: About', tag:'nav', run:()=>location.href='/about/'},
  {label:'Go: Projects', tag:'nav', run:()=>location.href='/projects/'},
  {label:'Toggle theme', tag:'action', run:()=> setTheme((document.documentElement.dataset.theme==='dark'?'light':'dark'))},
  {label:'Email me', tag:'action', run:()=>location.href='mailto:hello@yourdomain.tld'}
];

let cursor = 0;
function render(list=actions){
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
function openSpotlight(){ overlay.style.display='grid'; q.value=''; cursor=0; render(); q.focus(); }
function closeSpotlight(){ overlay.style.display='none'; }

document.addEventListener('keydown',(e)=>{
  if((e.key.toLowerCase()==='k' && (e.metaKey||e.ctrlKey))){ e.preventDefault(); openSpotlight(); }
  if(e.key==='Escape' && overlay.style.display==='grid'){ closeSpotlight(); }
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
    if(['ArrowDown','j'].includes(e.key)){ e.preventDefault(); cursor=Math.min(cursor+1, items.length-1); render(); }
    if(['ArrowUp','k'].includes(e.key)){ e.preventDefault(); cursor=Math.max(cursor-1, 0); render(); }
    if(e.key==='Enter'){ actions[cursor].run(); closeSpotlight(); }
  }
});

// Subtle 3D tilt
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

// Section fade focus (←/→)
(() => {
  const sections=[...document.querySelectorAll('[data-section]')];
  if(!sections.length) return;
  let idx=0;
  function go(i){
    idx=((i%sections.length)+sections.length)%sections.length;
    sections.forEach((s,si)=> s.style.opacity = (si===idx?1:.38));
    sections[idx].scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.addEventListener('keydown',(e)=>{
    if(e.key==='ArrowRight') go(idx+1);
    if(e.key==='ArrowLeft') go(idx-1);
  });
})();

// About filters
function setupFilters(){
  const wrap=document.getElementById('filters');
  if(!wrap) return;
  const chips=[...wrap.querySelectorAll('.chip')];
  const entries=[...document.querySelectorAll('.entry')];
  chips.forEach(ch=>{
    ch.addEventListener('click',()=>{
      const isActive=ch.dataset.active==='true';
      ch.dataset.active = (!isActive).toString();
      const active = chips.filter(c=>c.dataset.active==='true').map(c=>c.dataset.key);
      entries.forEach(e=>{
        const tags=(e.dataset.tags||'').split(',');
        e.style.display = active.length===0 || active.some(k=>tags.includes(k)) ? '' : 'none';
      });
    });
  });
}
setupFilters();
