(() => {
  'use strict';
  const stage = document.querySelector('.skeleton-stage');
  if (!stage) return;
  const assembly = stage.querySelector('.skeleton-assembly');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const gradient = (id, gold = false) => `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2=".7"><stop stop-color="${gold ? '#6f4c24' : '#333a39'}"/><stop offset=".18" stop-color="${gold ? '#e5c58d' : '#d2d5ce'}"/><stop offset=".32" stop-color="${gold ? '#fff0c4' : '#fffef0'}"/><stop offset=".5" stop-color="${gold ? '#af8241' : '#616b67'}"/><stop offset=".76" stop-color="${gold ? '#e8c182' : '#c5ccc5'}"/><stop offset="1" stop-color="${gold ? '#634423' : '#323b37'}"/></linearGradient>`;
  function svgLayer(name, content, defs = '') {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 740');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('skeleton-layer', `layer-${name}`);
    svg.innerHTML = `<defs>${defs}</defs>${content}`;
    assembly.append(svg);
  }
  function screw(x, y, r = 5) { return `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#aeb7af" stroke="#242c28" stroke-width="2"/><path d="M${-r+2} 0H${r-2}" stroke="#1b2520" stroke-width="1.5" transform="rotate(-30)"/></g>`; }
  function cog(x, y, r, teeth, seconds, reverse = false) {
    const points=[];
    for(let n=0;n<teeth*4;n++){const angle=n/(teeth*4)*Math.PI*2;const radius=n%4===0||n%4===3?r-4:r;points.push(`${(Math.cos(angle)*radius).toFixed(2)},${(Math.sin(angle)*radius).toFixed(2)}`);}
    const spokes=Array.from({length:5},(_,i)=>`<path d="M-4 -${r*.72}H4L7 -9H-7Z" transform="rotate(${i*72})" fill="url(#movement-gold)"/>`).join('');
    return `<g transform="translate(${x} ${y})"><g class="rotating-cog" style="--duration:${seconds}s;--direction:${reverse?'reverse':'normal'}"><polygon points="${points.join(' ')}" fill="url(#movement-gold)" stroke="#a17c43" stroke-width=".7"/><circle r="${r-7}" fill="#101b16" stroke="#e6c68c" stroke-width="1.2"/><circle r="${r-12}" fill="none" stroke="#9b7a43" stroke-width="1"/>${spokes}<circle r="10" fill="url(#movement-gold)"/><circle r="4" fill="#b7c8bd" stroke="#38493e" stroke-width="2"/></g></g>`;
  }
  svgLayer('back', `<path d="M239 8Q300 -2 361 8L367 225H233Z M233 467H367L359 727Q300 743 241 727Z" fill="url(#back-strap)" stroke="#4a4b3c"/><path d="M250 15L246 207 M350 15L354 207 M246 490L251 724 M354 490L349 724" fill="none" stroke="#8c7a55" stroke-dasharray="3 5" opacity=".5"/><path d="M215 207L232 172H368L385 207V484L366 523H234L215 484Z" fill="url(#back-steel)"/><circle cx="300" cy="345" r="171" fill="url(#back-steel)"/><circle cx="300" cy="345" r="150" fill="#0c1511" stroke="#d1b579" stroke-width="2"/><circle cx="300" cy="345" r="137" fill="url(#back-plate)"/>${Array.from({length:10},(_,i)=>`<path d="M180 ${255+i*20}H420" stroke="#d7c690" stroke-opacity=".07"/>`).join('')}`, gradient('back-steel')+`<linearGradient id="back-strap"><stop stop-color="#080b09"/><stop offset=".5" stop-color="#252b22"/><stop offset="1" stop-color="#090d09"/></linearGradient><radialGradient id="back-plate"><stop stop-color="#344336"/><stop offset="1" stop-color="#111a15"/></radialGradient>`);
  svgLayer('case', `<circle cx="300" cy="345" r="165" fill="none" stroke="url(#case-steel)" stroke-width="24"/><circle cx="300" cy="345" r="153" fill="none" stroke="#101813" stroke-width="4"/><rect x="467" y="321" width="29" height="48" rx="7" fill="url(#case-steel)" stroke="#242d25"/>${Array.from({length:5},(_,i)=>`<path d="M${472+i*4} 325V365" stroke="#353d32"/>`).join('')}`, gradient('case-steel'));
  svgLayer('movement', `<circle cx="300" cy="345" r="139" fill="#101a1399"/><path d="M203 269L250 242L286 277L268 322L214 322Z M322 237L379 262L402 309L349 329L310 286Z M202 367L231 342L281 372L269 441L228 427Z M325 383L382 363L403 397L365 447L318 443Z" fill="#53604a" stroke="#9b9f77" stroke-width="2" opacity=".6"/>${cog(251,288,48,25,30)}${cog(328,271,33,20,20,true)}${cog(364,333,43,24,27)}${cog(296,354,34,20,20,true)}${cog(237,385,39,23,25)}${cog(337,416,39,24,25,true)}<g transform="translate(281 443)"><g class="balance"><circle r="25" fill="#0d1711" stroke="#d7b674" stroke-width="4"/><circle r="19" fill="none" stroke="#b68d4c" stroke-width="2"/><path d="M-25 0H25M0 -25V25" stroke="#e9ce9e" stroke-width="3"/><circle r="5" fill="#a42e4c" stroke="#e7bdac" stroke-width="2"/></g></g>`, gradient('movement-gold', true));
  svgLayer('bridges', `<g fill="url(#bridge-metal)" stroke="#353d2f" stroke-width="1.5"><path d="M182 320L201 294L292 332L388 278L408 298L316 354L372 441L346 452L295 376L209 425L192 403L277 350Z"/><path d="M237 223L259 216L302 292L353 222L376 235L314 320H288Z"/></g><path d="M204 309L294 344L394 291 M296 357L359 443 M294 357L203 413" stroke="#d1cc9e" fill="none" stroke-width="1" opacity=".65"/>${[[202,310],[294,348],[394,292],[358,441],[204,410],[249,228],[362,235]].map(([x,y])=>screw(x,y)).join('')}<circle cx="294" cy="348" r="8" fill="#5e1639" stroke="#d5a2ae" stroke-width="2"/>`, gradient('bridge-metal'));
  const indices=Array.from({length:60},(_,i)=>`<path d="M300 198V${i%5===0?218:204}" transform="rotate(${i*6} 300 345)" stroke="${i%5===0?'#eddbaf':'#b4ad8e'}" stroke-width="${i%5===0?4:1}"/>`).join('');
  svgLayer('dial', `<circle cx="300" cy="345" r="148" fill="none" stroke="#171f18" stroke-width="14"/><circle cx="300" cy="345" r="156" fill="none" stroke="url(#dial-gold)" stroke-width="3"/>${indices}<path d="M262 235H338L327 260H273Z" fill="#111a14" stroke="#71765a"/><text x="300" y="250" text-anchor="middle" fill="#e7d4a5" font-family="Georgia,serif" font-size="12" letter-spacing="3">AUREL</text><text x="300" y="466" text-anchor="middle" fill="#dec99a" font-family="Arial,sans-serif" font-size="7" letter-spacing="2">SQUELETTE</text>`,gradient('dial-gold',true));
  svgLayer('hands', `<g transform="translate(300 345)"><path d="M-4 15L-4 -81L0 -100L4 -81L4 15Z" transform="rotate(-52)" fill="url(#hands-metal)" stroke="#2e382b"/><path d="M-2 19L-2 -119L0 -130L2 -119L2 19Z" transform="rotate(55)" fill="url(#hands-metal)" stroke="#2e382b"/><g class="seconds-hand"><path d="M0 30V-133" stroke="#d69c62" stroke-width="1.4"/><circle cy="19" r="4" fill="none" stroke="#d69c62"/></g><circle r="6" fill="#e4d2a0"/><circle r="2" fill="#293629"/></g>`,gradient('hands-metal',true));
  svgLayer('glass', `<circle cx="300" cy="345" r="158" fill="url(#glass-reflection)" stroke="#d3dfc1" stroke-opacity=".2" stroke-width="1"/><path d="M170 279A146 146 0 0 1 333 202" fill="none" stroke="#fff8df" stroke-width="2" opacity=".4"/>`,`<linearGradient id="glass-reflection" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e7ffdf" stop-opacity=".16"/><stop offset=".37" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".015"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>`);
  stage.classList.add('is-ready');
  let rotation = -22;
  let dragging = false;
  let startX = 0;
  let startRotation = rotation;
  let paused = reducedMotion.matches;
  const range = document.querySelector('#watch-rotation');
  const pause = document.querySelector('[data-skeleton-pause]');
  const explode = document.querySelector('[data-skeleton-explode]');
  function rotate(value) { rotation = Math.max(-50, Math.min(50, value)); stage.style.setProperty('--watch-y', rotation+'deg'); range.value = Math.round(rotation); }
  function pauseAnimation(value) { paused = value; stage.classList.toggle('is-paused', paused); pause.setAttribute('aria-pressed', String(paused)); pause.textContent = paused ? 'Riprendi movimento' : 'Pausa movimento'; }
  pauseAnimation(paused);
  pause.addEventListener('click',()=>pauseAnimation(!paused));
  explode.addEventListener('click',()=>{const expanded=stage.classList.toggle('is-exploded');explode.setAttribute('aria-pressed',String(expanded));explode.textContent=expanded?'Ricomponi orologio':'Esplora l’interno';stage.querySelector('.skeleton-state').textContent=expanded?'VISTA ESPLOSA · CASSA / MOVIMENTO / VETRO':'CALIBRO 01 · MOVIMENTO A VISTA';});
  range.addEventListener('input',()=>rotate(Number(range.value)));
  stage.querySelector('.skeleton-drag').addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;startX=e.clientX;startRotation=rotation;e.currentTarget.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');});
  stage.querySelector('.skeleton-drag').addEventListener('pointermove',e=>{if(dragging)rotate(startRotation+(e.clientX-startX)*.22);});
  function release(){dragging=false;stage.classList.remove('is-dragging');}
  stage.querySelector('.skeleton-drag').addEventListener('pointerup',release);
  stage.querySelector('.skeleton-drag').addEventListener('pointercancel',release);
  reducedMotion.addEventListener('change',e=>pauseAnimation(e.matches));
  const observer = new IntersectionObserver(([entry])=>stage.classList.toggle('offscreen',!entry.isIntersecting),{threshold:.05});
  observer.observe(stage);
})();
