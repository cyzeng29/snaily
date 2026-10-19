/* ---------- prints: each photo as a finished polaroid, drawn once ----------
   The same proportions as the photo board (js/board.js): a mat and a caption strip that are fractions of
   the print's width, the photo cropped to fill, its marker ink on top and the caption on one line, or two
   smaller ones. These are what the arrangement shows, what gets sent and what the archive keeps. */
const Prints=(()=>{
 const W=640,cache=new Map();
 const loadImg=src=>new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
 /* the caption's lines at this font: whole words while they fit, the second line ends in … if it runs over */
 function lines(g,text,max,n){const out=[];let line='';
  for(const w of text.split(/\s+/).filter(Boolean)){const t=line?line+' '+w:w;if(g.measureText(t).width<=max||!line){line=t;continue}out.push(line);line=w}
  if(line)out.push(line);
  if(out.length>n){out.length=n;let l=out[n-1];while(l.length>1&&g.measureText(l+'…').width>max)l=l.slice(0,-1);out[n-1]=l+'…'}
  return out.map(l=>{while(l.length>1&&g.measureText(l).width>max)l=l.slice(0,-2)+'…';return l})}
 function draw(img,p){
  const ar=Math.max(.75,Math.min(1.34,p.w/p.h)),w=W,h=Math.round(W/ar),c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d'),cap=(p.caption||'').trim(),f=Board.capFit(cap,w),m=f.mat,ix=m,iy=m,iw=w-2*m,ih=h-m-f.strip;
  const gr=g.createLinearGradient(0,0,w*.2,h);gr.addColorStop(0,'#fffdf4');gr.addColorStop(.55,'#fbf6e6');gr.addColorStop(1,'#f3ecd5');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.save();g.beginPath();g.rect(ix,iy,iw,ih);g.clip();
  if(img&&img.naturalWidth){const s=Math.max(iw/img.naturalWidth,ih/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s,dx=ix+(iw-dw)/2,dy=iy+(ih-dh)/2;
   g.drawImage(img,dx,dy,dw,dh);Ink.paint(g,p,dx,dy,dw,dh)}
  else{g.fillStyle='#e9e1c4';g.fillRect(ix,iy,iw,ih)}
  g.restore();
  // the photo sits slightly into the mat, and the paper has a hairline edge
  g.strokeStyle='rgba(43,16,12,.12)';g.lineWidth=2;g.strokeRect(ix+1,iy+1,iw-2,ih-2);g.strokeStyle='rgba(108,44,37,.16)';g.strokeRect(1,1,w-2,h-2);
  if(cap){g.fillStyle='#6C2C25';g.font=`400 ${f.fs}px "Open Sauce Sans",system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
   const ls=lines(g,cap,w-2*m-4,2),top=h-f.strip+(f.strip-ls.length*f.lh)/2;ls.forEach((l,k)=>g.fillText(l,w/2,top+f.lh*(k+.5)))}
  return c}
 /* the print for a draft photo (cached until its caption or ink changes) */
 async function of(p){const key=[p.blobId,p.caption||'',JSON.stringify(p.ink||[]).length].join('|'),old=cache.get(p.id);if(old&&old.key===key)return old.c;
  await document.fonts.load('400 20px "Open Sauce Sans"').catch(()=>{});
  const c=draw(await loadImg(await Store.url(p.blobId)),p);cache.set(p.id,{key,c});return c}
 return{of,loadImg};
})();

/* ---------- the arrangement: your postcard and its photos, laid out one of two ways ----------
   clip:   the card in the middle and the photos as a loose stack, paper-clipped over its top-right corner, the first on top
   canvas: the card in the middle and the photos spread around it; drag one (or focus it and use the arrow keys) to move it
   Positions are in card widths from the card's centre, so an arrangement looks the same at any size. The canvas is a
   fixed AREA×AREA card widths that always fits the stage, and photos are kept inside it, so none can end up off screen.
   The review step uses it to arrange; the archive and the postcard link use it just to look (and turn the card over). */
const Compose=(()=>{
 const AR=920/1360,AREA=2.3,CLIP_W=.5,CANVAS_W=.42;
 // canvas mode, before anything is moved: around the card, a little crooked, some overlapping its edges
 const SLOTS=[[-.8,-.55,-7],[.82,-.42,6],[-.84,.42,5],[.8,.6,-6],[-.02,-.9,3],[.04,.9,-4]];
 const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
 const wob=(id,k)=>(hash(id+':'+k)%1000)/1000*2-1;
 const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 // an antique brass bookmark clip: thin aged wire with a round pad soldered to its top
 const CLIP='<svg viewBox="0 0 24 62"><defs><radialGradient id="cmpPad" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#a8955f"/><stop offset=".55" stop-color="#75653c"/><stop offset="1" stop-color="#463a20"/></radialGradient></defs><path d="M9 40V14a4 4 0 0 1 8 0v38a7 7 0 0 1-14 0V10a9 9 0 0 1 18 0v34" fill="none" stroke="#4f4326" stroke-width="1.9" stroke-linecap="round"/><path d="M9 40V14a4 4 0 0 1 8 0v38a7 7 0 0 1-14 0V10a9 9 0 0 1 18 0v34" fill="none" stroke="#c7b583" stroke-opacity=".55" stroke-width=".6" stroke-linecap="round" transform="translate(-.35 -.3)"/><circle cx="8" cy="6.5" r="6.2" fill="url(#cmpPad)" stroke="#3d331c" stroke-width=".6"/><circle cx="8" cy="6.5" r="5.2" fill="none" stroke="#c2b07c" stroke-opacity=".35" stroke-width=".45"/><path d="M4.6 4.4a4.4 4.4 0 0 1 3.6-2.3" fill="none" stroke="#e0d2a4" stroke-opacity=".5" stroke-width=".7" stroke-linecap="round"/><g fill="#3d331c" fill-opacity=".35"><circle cx="10.2" cy="8.6" r=".5"/><circle cx="6.1" cy="9.3" r=".35"/><circle cx="9.4" cy="4.2" r=".3"/></g></svg>';
 /* where each photo starts on the canvas (in order); keeps any spot that's already set */
 function spread(ids,arr={}){ids.forEach((id,i)=>{if(arr[id])return;const s=SLOTS[i%SLOTS.length];
  arr[id]={x:s[0]+wob(id,'x')*.04,y:s[1]+wob(id,'y')*.04,r:s[2]+wob(id,'r')*2,z:ids.length-i}});
  for(const id in arr)if(!ids.includes(id))delete arr[id];return arr}

 function make(stage,{interactive=false,onArrange=null,label=''}={}){
  stage.classList.add('cmp');if(interactive)stage.classList.add('live');
  const card=document.createElement('div');card.className='cmp-card';card.setAttribute('role','img');
  card.innerHTML='<div class="cmp-flip"><div class="cmp-face cmp-front"></div><div class="cmp-face cmp-back"></div></div>';
  const clip=document.createElement('div');clip.className='cmp-clip';clip.setAttribute('aria-hidden','true');clip.innerHTML=CLIP;
  stage.append(card,clip);
  let prints=[],mode='clip',arr={},back=false,geo=null;const els=new Map();
  const api={get mode(){return mode},get back(){return back},onSide:null,
   /* front/back: canvases or images; prints: [{id,src (canvas or image),w,h,label}] in order */
   set(d){if(d.front)face('.cmp-front',d.front);if(d.back)face('.cmp-back',d.back);
    if(d.prints){prints=d.prints;sync()}
    if(d.canvas)arr=d.canvas;spread(prints.map(p=>p.id),arr);
    if(d.mode)mode=d.mode;stage.dataset.mode=mode;paintFocus();layout(!!d.animate)},
   setMode(m){if(m===mode)return;mode=m;stage.dataset.mode=m;layout(true);paintFocus()},
   flip(){back=!back;card.classList.toggle('flipped',back);stage.classList.toggle('flipped',back);layout('flip');if(api.onSide)api.onSide(back)},
   canvas:()=>arr,layout:()=>layout(false)};
  function face(sel,src){const f=card.querySelector(sel);f.textContent='';const el=src.tagName==='CANVAS'?copy(src):src.cloneNode();el.alt='';f.append(el)}
  const copy=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c};
  card.setAttribute('aria-label',label||'your postcard');
  card.addEventListener('click',()=>api.flip());

  /* one element per print, kept across updates so the stack and canvas can glide between orders and modes */
  function sync(){const ids=new Set(prints.map(p=>p.id));
   for(const[id,e]of els)if(!ids.has(id)){e.remove();els.delete(id)}
   prints.forEach((p,i)=>{let e=els.get(p.id);
    if(!e){e=document.createElement('div');e.className='cmp-print';stage.insertBefore(e,clip);els.set(p.id,e);if(interactive)drag(e,p.id)}
    if(e._src!==p.src){e.textContent='';const el=p.src.tagName==='CANVAS'?copy(p.src):p.src.cloneNode();el.alt='';el.draggable=false;e.append(el);e._src=p.src}
    e._ar=p.w/p.h;e.setAttribute('role','img');e.setAttribute('aria-label',`photo ${i+1} of ${prints.length}${p.label?': '+p.label:''}`)});
   paintFocus()}
  // in canvas mode each photo can be focused and moved with the arrow keys
  function paintFocus(){for(const[,e]of els){const on=interactive&&mode==='canvas';e.tabIndex=on?0:-1;on?e.setAttribute('aria-roledescription','movable photo'):e.removeAttribute('aria-roledescription')}}

  // animate 'flip' turns with the card (same length and curve as .cmp-flip); any other truthy value glides
  function place(e,t,animate){if(animate&&e._t&&e._t!==t&&!calm())e.animate([{transform:e._t},{transform:t}],animate==='flip'?{duration:750,easing:'cubic-bezier(.3,1.15,.4,1)'}:{duration:480,easing:'cubic-bezier(.2,.85,.25,1.05)'});e.style.transform=t;e._t=t}
  const lim=(v,half)=>Math.max(-AREA/2+half+.02,Math.min(AREA/2-half-.02,v));
  function layout(animate){const W=stage.clientWidth,H=stage.clientHeight;if(!W||!H)return;
   let cw,cx=W/2,cy=H/2;
   if(mode==='clip'){cw=Math.min(W*.6,H*.8*AR);cy=H/2+cw*.07}else cw=Math.min(W,H)/AREA;
   const ch=cw/AR,old=geo;geo={cx,cy,cw};
   const box={l:cx-cw/2,t:cy-ch/2,w:cw,h:ch};
   if(animate===true&&card._box&&!calm()){const o=card._box,k=o.w/box.w;card.animate([{transformOrigin:'0 0',transform:`translate(${o.l-box.l}px,${o.t-box.t}px) scale(${k})`},{transformOrigin:'0 0',transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.85,.25,1.05)'})}
   Object.assign(card.style,{left:box.l+'px',top:box.t+'px',width:cw+'px',height:ch+'px'});card._box=box;
   const n=prints.length;
   // clipped on, the stack and clip turn over with the card, about its vertical centre line (d: that line, from the element's centre)
   const f=mode==='clip'&&back?180:0,turn=d=>`translateX(${d}px) rotateY(${f}deg) translateX(${-d}px) `;
   prints.forEach((p,i)=>{const e=els.get(p.id);if(!e)return;const pw=(mode==='clip'?CLIP_W:CANVAS_W)*cw,ph=pw/e._ar;let x,y,r,z;
    if(mode==='clip'){// a fan held at the top by the clip: the lower ones swing out alternately, more to the left, so several show
     const k=Math.min(Math.ceil(i/2),2),side=i%2?1:-1,h=ph/cw/2;
     r=i?-side*((side>0?10:13)*k+wob(p.id,'cr')*2):-2;const a=r*Math.PI/180;
     const px=.3+(i?side*(side>0?.05:.09)*k:0)+wob(p.id,'cx')*.015,top=-.62+k*.012+wob(p.id,'cy')*.01;
     x=px-h*Math.sin(a);y=top+h*Math.cos(a);z=20+n-i;
     if(back)z=1}
    else{const a=arr[p.id];a.x=lim(a.x,pw/cw/2);a.y=lim(a.y,ph/cw/2);x=a.x;y=a.y;r=a.r;z=10+(a.z||0)}
    e.style.width=pw+'px';e.style.height=ph+'px';e.style.zIndex=z;
    place(e,turn(cx-pw/2)+`translate(${cx+x*cw-pw/2}px,${cy+y*cw-ph/2}px) rotate(${r}deg)`,animate)});
   // the clip grips the stack and the card's top edge together
   clip.hidden=mode!=='clip'||!n;
   if(!clip.hidden){const L=cw*.34;Object.assign(clip.style,{width:L*24/62+'px',height:L+'px',zIndex:back?2:40});
    place(clip,turn(cx-L*12/62)+`translate(${cx+.3*cw-L*12/62}px,${cy-ch/2-L*.42}px) rotate(4deg)`,animate)}}
  new ResizeObserver(()=>layout(false)).observe(stage);

  /* canvas mode: drag a photo around; it comes to the front and stays inside the canvas */
  function drag(e,id){let st=null;
   const top=()=>{const a=arr[id];a.z=Math.max(0,...Object.values(arr).map(q=>q.z||0))+1};
   e.addEventListener('pointerdown',ev=>{if(mode!=='canvas'||ev.button)return;ev.preventDefault();e.setPointerCapture(ev.pointerId);const a=arr[id];st={x:ev.clientX,y:ev.clientY,ax:a.x,ay:a.y,moved:false};top();layout(false);e.focus({preventScroll:true})});
   e.addEventListener('pointermove',ev=>{if(!st)return;const dx=ev.clientX-st.x,dy=ev.clientY-st.y;if(!st.moved&&Math.hypot(dx,dy)<4)return;st.moved=true;e.classList.add('drag');
    const a=arr[id];a.x=st.ax+dx/geo.cw;a.y=st.ay+dy/geo.cw;layout(false)});
   const end=()=>{if(!st)return;st=null;e.classList.remove('drag');layout(false);onArrange&&onArrange(arr)};
   e.addEventListener('pointerup',end);e.addEventListener('pointercancel',end);
   e.addEventListener('keydown',ev=>{if(mode!=='canvas')return;const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];if(!k)return;ev.preventDefault();
    const a=arr[id],s=ev.shiftKey?.12:.04;a.x+=k[0]*s;a.y+=k[1]*s;top();layout(false);onArrange&&onArrange(arr)})}
  return api}
 return{make,spread,AREA};
})();
