/* ---------- app shell: routing, nav, settings ---------- */
const VIEWS=['home','write','board','sent','gallery','settings','open'],PARENT={write:'home',board:'write',sent:'board'},body=document.body;
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
// the home tab remembers where you were in the postcard flow (home, write, board, sent), like Instagram tabs keep their place
let lastHome='home';
// a postcard link (?p=<id>) opens just that postcard (js/open.js): no tabs, no intro
const OPENING=new URLSearchParams(location.search).get('p');if(OPENING)body.classList.add('viewing');
function route(){const v=OPENING?'open':VIEWS.includes(location.hash.slice(1))&&location.hash!=='#open'?location.hash.slice(1):'home';
 if(v==='home'||PARENT[v])lastHome=v;
 $$('.view').forEach(el=>el.classList.toggle('on',el.id==='v-'+v));
 $$('.tab').forEach(t=>{const cur=t.dataset.go===(PARENT[v]?'home':v);cur?t.setAttribute('aria-current','page'):t.removeAttribute('aria-current')});
 body.dataset.view=v;setWrite(v==='write');dispatchEvent(new CustomEvent('snaily:view',{detail:v}))}
addEventListener('hashchange',route);
// tapping home while already in the flow pops back to the home screen; from another tab it returns to the saved spot
$$('.tab').forEach(t=>t.onclick=()=>{const g=t.dataset.go;location.hash=g==='home'&&t.getAttribute('aria-current')!=='page'?lastHome:g});
// the write view has its own back, down by the colours
const wBack=$('#wBack');if(wBack)wBack.onclick=()=>{location.hash='home'};
const h=new Date().getHours(),part=h<12?'morning':h<18?'afternoon':'evening';
$('#greet').textContent='Good '+part[0].toUpperCase()+part.slice(1);
/* tap the greeting: the time of day pops up over it, a sun, a sun behind a cloud, or a moon, with a little burst of rays or stars */
(function sky(){
 const btn=$('#greet'),calm=matchMedia('(prefers-reduced-motion:reduce)');
 const SUN='<circle cx="24" cy="24" r="9" fill="var(--red)"/><g stroke="var(--red)" stroke-width="3" stroke-linecap="round"><path d="M24 5v5M24 38v5M5 24h5M38 24h5M10.6 10.6l3.5 3.5M33.9 33.9l3.5 3.5M10.6 37.4l3.5-3.5M33.9 14.1l3.5-3.5"/></g>';
 const ART={morning:SUN,
  afternoon:'<g transform="translate(-4 -5)">'+SUN+'</g><path d="M17 40h20a6 6 0 0 0 0-12 8.5 8.5 0 0 0-16.4 1A5.5 5.5 0 0 0 17 40z" fill="var(--pill)" stroke="var(--tx)" stroke-width="2.6" stroke-linejoin="round"/>',
  evening:'<path d="M29.5 8.5a15.5 15.5 0 1 0 10 25.5A13 13 0 0 1 29.5 8.5z" fill="var(--blue)" stroke="var(--tx)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="25" cy="22" r="1.8" fill="var(--tx)" opacity=".35"/><circle cx="18" cy="30" r="2.6" fill="var(--tx)" opacity=".25"/>'};
 const STAR='<path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6z" fill="var(--c)"/>',DOT='<circle cx="6" cy="6" r="3.2" fill="var(--c)"/>';
 let fx=null;
 btn.onclick=()=>{
  if(fx)fx.remove();
  fx=document.createElement('span');fx.className='sky';fx.setAttribute('aria-hidden','true');
  const art=document.createElement('span');art.className='sky-art';art.innerHTML=`<svg viewBox="0 0 48 48">${ART[part]}</svg>`;fx.append(art);
  btn.parentNode.append(fx);const me=fx,end=()=>{me.remove();if(fx===me)fx=null};
  if(calm.matches){art.animate([{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}],{duration:1600,fill:'forwards'}).finished.then(end,end);return}
  art.animate([{transform:'translateY(14px) scale(.2) rotate(-25deg)',opacity:0},{transform:'translateY(-6px) scale(1.12) rotate(6deg)',opacity:1,offset:.22},
   {transform:'translateY(0) scale(1) rotate(0)',opacity:1,offset:.34},{transform:'translateY(-4px) scale(1) rotate(0)',opacity:1,offset:.78},{transform:'translateY(-14px) scale(.9)',opacity:0}],
   {duration:1700,easing:'ease-out',fill:'forwards'}).finished.then(end,end);
  // the burst: stars at night, warm dots by day, flung out from behind it
  const n=7;for(let i=0;i<n;i++){const b=document.createElement('span');b.className='sky-bit';
   b.style.setProperty('--c',i%2?'var(--red)':part==='evening'?'var(--blue)':'var(--tx)');
   b.innerHTML=`<svg viewBox="0 0 12 12">${part==='evening'?STAR:DOT}</svg>`;fx.append(b);
   const a=-Math.PI*(.08+.84*i/(n-1))+(Math.random()-.5)*.25,d=46+Math.random()*22,x=Math.cos(a)*d,y=Math.sin(a)*d,s=.6+Math.random()*.6;
   b.animate([{transform:'translate(0,0) scale(0)',opacity:1},{transform:`translate(${x*.8}px,${y*.8}px) scale(${s})`,opacity:1,offset:.45},{transform:`translate(${x}px,${y+8}px) scale(${s*.6}) rotate(${a>-1.57?90:-90}deg)`,opacity:0}],
    {duration:900+Math.random()*250,delay:120,easing:'cubic-bezier(.2,.8,.3,1)',fill:'both'})}};
})();
$$('[data-box]').forEach(b=>b.onclick=()=>{$$('[data-box]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#emptyMsg').textContent=`no ${b.dataset.box} postcards yet.`});
function setTheme(v,save){const r=document.documentElement;v==='system'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',v);
 $$('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.themeSet===v));if(save)try{localStorage.setItem('snaily-theme',v)}catch(e){}}
$$('[data-theme-set]').forEach(b=>b.onclick=()=>setTheme(b.dataset.themeSet,true));
setTheme(document.documentElement.getAttribute('data-theme')||'system');
route();

/* ---------- intro: stamp thump, snail hops into the logo ---------- */
(function intro(){
 if(OPENING){$('#intro').remove();$('#fly').remove();body.classList.remove('intro');return}
 const ov=$('#intro'),shake=$('#shake'),wrap=$('#stampWrap'),full=$('.stamp.full'),empty=$('.stamp.empty'),ink=$('.ink'),fly=$('#fly'),logo=$('#logo');
 const [fx,fy,fs,fq,fr]=['.fx','.fy','.fs','.fq','.fr'].map(c=>fly.querySelector(c));
 const SNAIL_BOX=[.1953,.2017,.8375,.792],SNAIL_AR=480/334,TILT=-3;
 const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const cta=$('#v-home .primary');
 let done=false,mo=null;
 const play=(el,kf,o)=>el.animate(kf,{fill:'forwards',...o}).finished.catch(()=>{});
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 function finish(){if(done)return;done=true;removeEventListener('keydown',finish);
  document.getAnimations().forEach(a=>{const t=a.effect&&a.effect.target;if(t&&(ov.contains(t)||fly.contains(t)))a.cancel()});
  ov.remove();fly.remove();logo.style.visibility='';
  // the morph already put the button in place, so it skips the reveal's rise
  if(mo){mo.el.remove();cta.style.visibility='';cta.style.animation='none';setTimeout(()=>cta.style.animation='',900)}body.classList.remove('intro');body.classList.add('reveal');setTimeout(()=>body.classList.remove('reveal'),900)}
 // a tap that skips the intro must not also click whatever is underneath
 ov.addEventListener('pointerdown',()=>{const t=performance.now(),eat=e=>{if(performance.now()-t<500){e.stopPropagation();e.preventDefault()}removeEventListener('click',eat,true)};addEventListener('click',eat,true);finish()});
 addEventListener('keydown',finish);
 const load=src=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=src});
 const bg=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim().replace(/^url\(["']?|["']?\)$/g,'');
 Promise.race([Promise.all(['--stamp','--stamp-empty','--snail'].map(v=>load(bg(v)))),wait(1500)]).then(go);

 async function go(){if(done)return;
  if(calm){await play(wrap,[{opacity:0},{opacity:1}],{duration:300});await wait(500);if(done)return;
   await play(ov,[{opacity:1},{opacity:0}],{duration:400});return finish()}
  // 1. stamp thump
  const thump=play(wrap,[
   {transform:'scale(2.2) rotate(-10deg)',opacity:0,easing:'cubic-bezier(.55,0,.9,.45)'},
   {transform:`scale(1) rotate(${TILT}deg)`,opacity:.85,offset:.72},
   {transform:`scale(1.035,.955) rotate(${TILT}deg)`,opacity:.92,offset:.86},
   {transform:`scale(1) rotate(${TILT}deg)`,opacity:1}],{duration:460});
  await wait(330);if(done)return;
  play(shake,[{transform:'translate(0,0)'},{transform:'translate(-3px,2px)'},{transform:'translate(3px,-1px)'},{transform:'translate(-2px,0)'},{transform:'translate(0,0)'}],{duration:140});
  play(ink,[{transform:'scale(.7)',opacity:.22},{transform:'scale(1.7)',opacity:0}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});
  await thump;await wait(420);if(done)return;
  // 2. the snail leaves the stamp
  const sw=shake.offsetWidth,sh=shake.offsetHeight,sr=shake.getBoundingClientRect();
  const bw=(SNAIL_BOX[2]-SNAIL_BOX[0])*sw*1.06,bh=bw/SNAIL_AR;
  let cx=(SNAIL_BOX[0]+SNAIL_BOX[2])/2*sw-sw/2,cy=SNAIL_BOX[3]*sh-bh*.47-sh/2;
  const a=TILT*Math.PI/180;[cx,cy]=[cx*Math.cos(a)-cy*Math.sin(a),cx*Math.sin(a)+cy*Math.cos(a)];
  const x0=sr.left+sr.width/2+cx-bw/2,y0=sr.top+sr.height/2+cy-bh/2;
  Object.assign(fly.style,{display:'block',left:x0+'px',top:y0+'px',width:bw+'px',height:bh+'px'});
  fr.style.transform=`rotate(${TILT}deg)`;
  play(empty,[{opacity:0},{opacity:1}],{duration:80});play(full,[{opacity:1},{opacity:0}],{duration:80,delay:40});
  // crouch, then pop up toward the viewer
  const P=1.15,px=-(P-1)/2*bw,py=-56-(P-1)/2*bh;
  await play(fq,[{transform:'scale(1,1)'},{transform:'scale(1.08,.8)'}],{duration:130,easing:'ease-out'});if(done)return;
  fr.animate([{transform:`rotate(${TILT}deg)`},{transform:'rotate(0deg)'}],{duration:260,fill:'forwards'});
  play(fq,[{transform:'scale(1.08,.8)'},{transform:'scale(.92,1.12)',offset:.4},{transform:'scale(1,1)'}],{duration:300});
  play(fs,[{transform:'scale(1)',filter:'drop-shadow(0 0 0 rgba(60,20,15,0))'},{transform:`scale(${P})`,filter:'drop-shadow(0 14px 10px rgba(60,20,15,.25))'}],{duration:300,easing:'cubic-bezier(.2,.8,.3,1)'});
  play(fx,[{transform:'translateX(0)'},{transform:`translateX(${px}px)`}],{duration:300,easing:'cubic-bezier(.2,.8,.3,1)'});
  await play(fy,[{transform:'translateY(0)'},{transform:`translateY(${py}px)`}],{duration:300,easing:'cubic-bezier(.2,.8,.3,1)'});
  if(done)return;
  // 3. hop left into the header logo (it only exists on home; elsewhere the snail just fades away)
  if(!logo.getClientRects().length){play(fly,[{opacity:1},{opacity:0}],{duration:250});await play(ov,[{opacity:1},{opacity:0}],{duration:350});return finish()}
  const lr=logo.getBoundingClientRect(),dx=lr.left-x0,dy=lr.top-y0,sT=lr.width/bw;
  const hops=[{f:.62,g:.06,peak:90,d:360},{f:.96,g:.16,peak:60,d:320},{f:1,g:1,peak:46,d:440}];
  let pxs=px,pys=py,ps=P;
  // meanwhile the empty stamp morphs into the write button (or just fades if the button isn't showing)
  if(cta&&cta.getClientRects().length)setTimeout(morph,160);
  else play(wrap,[{transform:`scale(1) rotate(${TILT}deg)`,opacity:1},{transform:`scale(.9) rotate(${TILT}deg)`,opacity:0}],{duration:320,delay:hops[0].d-60,easing:'ease-in'});
  for(const [i,hp] of hops.entries()){if(done)return;
   const nx=px+(dx-px)*hp.f,ny=py+(dy-py)*hp.g,ns=P+(sT-P)*hp.f,top=Math.max(Math.min(pys,ny)-hp.peak,6-y0);
   if(i===2)play(ov,[{backgroundColor:getComputedStyle(ov).backgroundColor},{backgroundColor:'transparent'}],{duration:hp.d+60})
   if(i===2){body.classList.replace('intro','reveal');logo.style.visibility='hidden'}
   play(fx,[{transform:`translateX(${pxs}px)`},{transform:`translateX(${nx}px)`}],{duration:hp.d,easing:'linear'});
   play(fs,[{transform:`scale(${ps})`},{transform:`scale(${ns})`}],{duration:hp.d,easing:'linear'});
   play(fq,[{transform:'scale(.9,1.12)'},{transform:'scale(1,1)',offset:.35},{transform:'scale(1,1)',offset:.85},{transform:'scale(1.14,.84)'}],{duration:hp.d});
   await play(fy,[{transform:`translateY(${pys}px)`,easing:'cubic-bezier(.3,.7,.5,1)'},{transform:`translateY(${top}px)`,offset:.45,easing:'cubic-bezier(.5,0,.75,.35)'},{transform:`translateY(${ny}px)`}],{duration:hp.d});
   pxs=nx;pys=ny;ps=ns}
  if(done)return;
  await play(fq,[{transform:'scale(1.14,.84)'},{transform:'scale(.97,1.04)',offset:.5},{transform:'scale(1,1)'}],{duration:180});
  logo.style.visibility='';if(mo)await mo.done;finish()}

 // swaps the stamp for a look-alike #morph and flows it into the button's spot, squashing as it lands
 function morph(){if(done)return;
  const sr=shake.getBoundingClientRect(),br=cta.getBoundingClientRect();
  const el=document.createElement('div');el.id='morph';el.setAttribute('aria-hidden','true');
  el.innerHTML='<i class="mb"></i><i class="ms"></i><span class="ml"></span>';el.querySelector('.ml').textContent=cta.textContent;
  Object.assign(el.style,{left:sr.left+'px',top:sr.top+'px',width:sr.width+'px',height:sr.height+'px',transform:`rotate(${TILT}deg)`});
  body.append(el);wrap.style.visibility='hidden';cta.style.visibility='hidden';
  const box=(r,sx=1,sy=1)=>({left:r.left+r.width*(1-sx)/2+'px',top:r.top+r.height*(1-sy)/2+'px',width:r.width*sx+'px',height:r.height*sy+'px'});
  const D=820,o={duration:D,fill:'forwards'};
  el.animate([{...box(sr),transform:`rotate(${TILT}deg)`,easing:'cubic-bezier(.5,0,.2,1)'},
   {...box(br,1.06,.86),transform:'rotate(0deg)',offset:.8,easing:'ease-out'},{...box(br),transform:'rotate(0deg)'}],o);
  el.querySelector('.ms').animate([{opacity:1},{opacity:1,offset:.15},{opacity:0,offset:.55},{opacity:0}],o);
  el.querySelector('.mb').animate([{opacity:0},{opacity:0,offset:.1},{opacity:1,offset:.5},{opacity:1}],o);
  mo={el,done:el.querySelector('.ml').animate([{opacity:0},{opacity:0,offset:.6},{opacity:1}],o).finished.catch(()=>{})}}
})();
