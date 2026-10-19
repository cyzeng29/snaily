/* ---------- photo board: today's photos as a tilted collage or a tidy grid ----------
   Collage: each photo gets its own spot when it's added and keeps it; a new
   photo layers on top wherever it hides the least of the others. Drag nudges. Grid: even cells, no nudging. A tap brings a photo to the front
   as a polaroid, with tools along the bottom edge (the caption is typed on its strip). The pill at the top switches layouts. */
const Board=(()=>{
 const el=$('#board'),file=$('#bFile'),next=$('#bNext'),addB=$('#bAdd'),count=$('#bCount'),toastEl=$('#toast');
 const focusEl=$('#focus'),fPhoto=$('#fPhoto'),fCap=$('#fCap'),fCard=$('#fCard'),fTools=focusEl.querySelector('.tools'),toolBtns=[...focusEl.querySelectorAll('.tool[data-tool]')],fBody=focusEl.querySelector('.f-body'),tMarker=$('#tMarker'),inkUndo=$('#inkUndo');
 const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 /* width of the nth photo added (fraction of the layout unit): the first is the big one */
 const SIZES=[.6,.5,.48,.46,.45,.44];
 const TAPES=['#EB5E3A','#7CA2E0','#D9C47A','#C9A36A'];
 const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
 const jitter=id=>((hash(id)%1000)/1000*2-1)*1.5;
 let layout=[],openIdx=-1,replaceIdx=-1,undo=null,toastT=null,dragEnd=0,edW=0;
 /* a polaroid keeps one set of proportions everywhere: the mat, the caption strip and its type are all fractions of its width,
    so a caption looks the same on the board as in the editor, at any size. One line if it fits, otherwise two smaller ones */
 const MAT=.035,STRIP=.2,measure=document.createElement('canvas').getContext('2d');
 function capFit(text,W){const mat=W*MAT;let fs=W*.08,lines=1;measure.font=`400 ${fs}px "Open Sauce Sans"`;
  if(text&&measure.measureText(text).width>W-2*mat-4){fs=W*.062;lines=2}
  return{mat,strip:W*STRIP,fs,lh:fs*1.18,lines}}
 function capVars(e,c){[['--mat',c.mat],['--strip',c.strip],['--cap',c.fs],['--cap-lh',c.lh]].forEach(([k,v])=>e.style.setProperty(k,v+'px'));e.style.setProperty('--cap-n',c.lines)}
 /* the hint under the board: from the first photo until one has been opened */
 const hintEl=$('#bHint'),touch=matchMedia('(hover:none)');let tipped=false;try{tipped=localStorage.getItem('snaily-photo-tip')==='1'}catch(e){}
 function paintHint(n){const on=n>0&&!tipped;if(on)hintEl.textContent=`${touch.matches?'Tap':'Click on'} ${n>1?'a':'the'} photo to customize.`;hintEl.classList.toggle('on',on)}

 const photos=()=>Store.draft?Store.draft.photos:[];
 const mode=()=>Store.draft&&Store.draft.layout==='grid'?'grid':'collage';
 function toast(msg,action,ms=3200){clearTimeout(toastT);toastEl.textContent=msg;
  if(action){const b=document.createElement('button');b.textContent=action.label;b.onclick=()=>{action.run();hideToast()};toastEl.append(' ',b)}
  toastEl.classList.add('on');toastT=setTimeout(hideToast,ms)}
 function hideToast(){toastEl.classList.remove('on');if(undo){undo.commit();undo=null}}

 /* geometry for each photo, in board pixels */
 function frames(){
  const ps=photos(),n=ps.length,W=el.clientWidth,H=el.clientHeight;if(!n||!W)return[];
  if(mode()==='grid'){
   // two columns (one for a single photo), 4:5 cells, centred; an odd last photo sits in the middle
   const g=12,cols=n>1?2:1,rows=Math.ceil(n/cols),cw=Math.min((W-g*(cols-1))/cols,(H-g*(rows-1))/rows*.8),ch=cw/.8;
   const x0=(W-cols*cw-g*(cols-1))/2,y0=(H-rows*ch-g*(rows-1))/2;
   return ps.map((p,i)=>{const r=Math.floor(i/cols),c=i%cols,lone=r===rows-1&&n%cols===1;
    return{x:lone?(W-cw)/2:x0+c*(cw+g),y:y0+r*(ch+g),w:cw,h:ch,r:0}})}
  return ps.map(p=>cframe(p,p.pos,W,H))}
 /* a collage frame from a stored spot: centre (fraction of the board), width (fraction of the unit), tilt */
 function cframe(p,pos,W,H){const u=Math.min(W,H*.8),ar=Math.max(.75,Math.min(1.34,p.w/p.h));
  let w=pos.s*u,h=w/ar;if(h>H*.62){h=H*.62;w=h*ar}
  const x=Math.max(0,Math.min(W-w,pos.x*W-w/2)),y=Math.max(0,Math.min(H-h,pos.y*H-h/2));
  return{x,y,w,h,r:pos.r+jitter(p.id)}}

 /* give every photo without a spot one, in order. Nothing already placed moves: the new photo goes
    on top, at the spot that leaves the most of each photo under it showing (checked on a grid of
    sample points, worst-covered photo first), drifting toward the middle when it's a tie. */
 function place(ps){
  const W=el.clientWidth||360,H=el.clientHeight||560;let changed=false;
  for(const p of ps){if(p.pos)continue;changed=true;
   const set=ps.filter(q=>q.pos&&q!==p),k=set.length,h=hash(p.id);
   const r=k?(k%2?1:-1)*(3+h%4):-2,s=SIZES[Math.min(k,SIZES.length-1)];
   const box=q=>{const f=cframe(q,q.pos,W,H);return{l:f.x+(q.nudge?.x||0)*W,t:f.y+(q.nudge?.y||0)*H,w:f.w,h:f.h}};
   const inside=(b,x,y)=>x>=b.l&&x<=b.l+b.w&&y>=b.t&&y<=b.t+b.h;
   // sample points of each placed photo still showing now, under whatever already sits above it
   const zs=set.map((q,i)=>q.z||ps.indexOf(q)+1),boxes=set.map(box);
   const vis=set.map((q,i)=>{const b=boxes[i],pts=[];
    for(let a=0;a<8;a++)for(let c=0;c<8;c++){const x=b.l+(a+.5)/8*b.w,y=b.t+(c+.5)/8*b.h;
     if(!boxes.some((o,j)=>zs[j]>zs[i]&&inside(o,x,y)))pts.push([x,y])}
    return pts});
   let best={x:.5,y:.47},top=-Infinity;
   if(k)for(let x=.15;x<=.851;x+=.035)for(let y=.12;y<=.881;y+=.035){
    const nb=box({...p,pos:{x,y,s,r:0}});let min=1,sum=0;
    vis.forEach(pts=>{const v=pts.length?pts.filter(([a,b])=>!inside(nb,a,b)).length/64:0;min=Math.min(min,v);sum+=v});
    const score=min+.5*sum/k-.12*Math.hypot(x-.5,y-.47);
    if(score>top){top=score;best={x,y}}}
   p.pos={...best,s,r};p.z=Math.max(0,...ps.map(q=>q.z||0))+1;p.nudge={x:0,y:0}}
  return changed}

 async function render(){
  const ps=photos(),grid=mode()==='grid';if(place(ps))Store.save({photos:ps});layout=frames();el.textContent='';el.classList.toggle('grid',grid);paintLay();
  count.textContent=ps.length?`${ps.length} of ${Store.MAX_PHOTOS} photos`:'';
  next.disabled=!ps.length;addB.disabled=ps.length>=Store.MAX_PHOTOS;$('#v-board').classList.toggle('empty',!ps.length);paintHint(ps.length);
  if(!ps.length){const e=document.createElement('div');e.className='board-empty';
   e.innerHTML='<button class="big" id="bAddBig"><span>Add Photos</span><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></i></button>';
   el.append(e);e.querySelector('button').onclick=()=>pick(-1);return}
  const W=el.clientWidth,H=el.clientHeight;
  for(const[i,p]of ps.entries()){const f=layout[i],b=document.createElement('button'),nx=grid?0:(p.nudge?.x||0)*W,ny=grid?0:(p.nudge?.y||0)*H;
   b.className='ph';b.dataset.i=i;const hv=hash(p.id);b.style.setProperty('--tape',TAPES[hv%TAPES.length]);b.style.setProperty('--tr',((hv>>4)%9-4)+'deg');b.setAttribute('aria-label',`photo ${i+1}: ${p.caption||'no caption yet'}`);
   Object.assign(b.style,{left:f.x+'px',top:f.y+'px',width:f.w+'px',height:f.h+'px',zIndex:p.z||i+1,
    transform:`translate(${nx}px,${ny}px) rotate(${f.r}deg)`});
   // polaroid strip: a fifth of the width, with the caption written on it
   capVars(b,capFit(p.caption,f.w));
   const img=document.createElement('img');img.alt='';img.draggable=false;Store.url(p.blobId).then(u=>img.src=u);b.append(img);
   const ink=Ink.svg(p);if(ink)b.append(ink);
   if(p.caption){const cap=document.createElement('span');cap.className='ph-cap';cap.setAttribute('aria-hidden','true');cap.textContent=p.caption;b.append(cap)}
   drag(b,i,grid);el.append(b)}
 }

 /* the layout pill: the thumb slides under the pick, and the photos glide from one layout to the other */
 const lay=$('.lay'),layBtns=[...lay.querySelectorAll('[data-lay]')];
 function paintLay(){const m=mode();lay.dataset.on=m;layBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.lay===m))}
 layBtns.forEach(b=>b.onclick=async()=>{if(b.dataset.lay===mode()||!Store.draft)return;
  const before=photos().map((_,i)=>{const e=el.querySelector(`.ph[data-i="${i}"]`);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:layout[i].w,r:layout[i].r}});
  Store.save({layout:b.dataset.lay});await render();if(calm())return;
  before.forEach((o,i)=>{const e=el.querySelector(`.ph[data-i="${i}"]`);if(!o||!e)return;const r=e.getBoundingClientRect();
   e.animate([{translate:`${o.x-r.left-r.width/2}px ${o.y-r.top-r.height/2}px`,rotate:`${o.r-layout[i].r}deg`,scale:`${o.w/layout[i].w}`},{translate:'0px 0px',rotate:'0deg',scale:'1'}],{duration:420,delay:i*25,easing:'cubic-bezier(.2,.9,.25,1.05)',fill:'backwards'})})});

 /* drag to nudge (collage) and drop on the trash to delete (both layouts); a tap opens the photo.
    Opening happens on click, not pointerup, so the tap's own click can't land on the backdrop and close it again.
    While dragging the photo can leave the board to reach the trash; where it lands is clamped back onto the board. */
 const trash=$('#bTrash');
 const overTrash=e=>{const r=trash.getBoundingClientRect();return Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))<56};
 function drag(b,i,grid){
  let sx=0,sy=0,ox=0,oy=0,moved=false,on=false;
  b.addEventListener('pointerdown',e=>{if(e.button)return;on=true;moved=false;sx=e.clientX;sy=e.clientY;const p=photos()[i];ox=(p.nudge?.x||0)*el.clientWidth;oy=(p.nudge?.y||0)*el.clientHeight;b.setPointerCapture(e.pointerId)});
  b.addEventListener('pointermove',e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;
   if(!moved&&Math.hypot(dx,dy)<6)return;
   if(!moved){moved=true;b.classList.add('drag');b.style.zIndex=99;document.body.classList.add('dragging')}
   const f=layout[i],W=el.clientWidth,H=el.clientHeight,nx=ox+dx,ny=oy+dy,hot=overTrash(e);
   trash.classList.toggle('hot',hot);b.classList.toggle('doomed',hot);
   b.style.transform=`translate(${nx}px,${ny}px) rotate(${f.r}deg) scale(${hot?.45:1.04})`;
   b._n=[Math.max(-f.x,Math.min(W-f.x-f.w,nx))/W,Math.max(-f.y,Math.min(H-f.y-f.h,ny))/H]});
  const stop=()=>{document.body.classList.remove('dragging');trash.classList.remove('hot');b.classList.remove('drag','doomed')};
  const end=e=>{if(!on)return;on=false;
   if(!moved)return;
   dragEnd=performance.now();const hot=overTrash(e);stop();
   if(hot)return removeAt(i);
   if(grid)return render();
   const ps=photos(),top=Math.max(0,...ps.map(p=>p.z||0))+1;
   ps[i].nudge={x:b._n[0],y:b._n[1]};ps[i].z=top;Store.save({photos:ps});render()};
  b.addEventListener('pointerup',end);b.addEventListener('pointercancel',()=>{on=false;stop();render()});
  b.addEventListener('click',()=>{if(performance.now()-dragEnd>150)open(i)})
 }

 /* adding / replacing photos */
 function pick(idx){replaceIdx=idx;file.value='';file.click()}
 file.onchange=async()=>{
  const files=[...file.files];if(!files.length)return;
  const big=replaceIdx<0&&!photos().length&&el.querySelector('.board-empty .big i'),from=big&&big.getBoundingClientRect();
  const ps=photos(),room=replaceIdx>=0?1:Store.MAX_PHOTOS-ps.length,use=files.slice(0,room);
  toast(use.length>1?'getting your photos ready…':'getting your photo ready…',null,60000);
  const errs=[];
  for(const f of use){try{const p=await Store.putPhoto(f);
    if(replaceIdx>=0){const old=ps[replaceIdx];p.caption=old.caption;if(old.ink&&Math.abs(p.w/p.h-old.w/old.h)<.02)p.ink=old.ink;p.nudge=old.nudge;p.z=old.z;p.pos=old.pos;ps[replaceIdx]=p;Store.dropBlob(old.blobId)}
    else{ps.push(p);place(ps)}}catch(e){errs.push(e.message)}}
  Store.save({photos:ps});await render();if(from&&ps.length)growPlus(from);
  if(replaceIdx>=0&&openIdx>=0){Store.url(ps[openIdx].blobId).then(u=>fPhoto.src=u);Ink.redraw()}
  if(errs.length)toast(errs[0],null,5000);
  else if(files.length>room)toast(`only ${Store.MAX_PHOTOS} photos fit on a board.`,null,4000);
  else hideToast()};

 /* the empty board's big + doesn't vanish: it shrinks down into the footer, where it stays as the + */
 function growPlus(from){if(calm())return;const to=addB.getBoundingClientRect();if(!to.width)return;
  // it travels over the photo that just arrived, which settles in a beat behind it
  const ph=el.querySelector('.ph');if(ph)ph.animate([{opacity:0,scale:.92},{opacity:1,scale:1}],{duration:380,delay:120,easing:'ease-out',fill:'backwards'});
  addB.style.position='relative';addB.style.zIndex=150;setTimeout(()=>{addB.style.position=addB.style.zIndex=''},700);
  addB.animate([{transform:`translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${from.width/to.width})`},
   {transform:'translateY(-8px) scale(1.08)',offset:.78},{transform:'none'}],{duration:640,easing:'cubic-bezier(.35,.1,.25,1)'})}
 /* focus: the photo lifts to the front as a polaroid; no tool is picked until you tap one */
 function open(i){
  const p=photos()[i],b=el.querySelector(`.ph[data-i="${i}"]`);if(!p||!b)return;
  openIdx=i;Store.url(p.blobId).then(u=>fPhoto.src=u);
  if(!tipped){tipped=true;try{localStorage.setItem('snaily-photo-tip','1')}catch(e){}paintHint(0)}
  fCap.value=p.caption||'';edW=0;setTool(null);Ink.redraw();
  focusEl.hidden=false;focusEl.classList.remove('typing');
  const from=b.getBoundingClientRect(),f=layout[i];b.style.visibility='hidden';
  const go=()=>{sizeCard();const to=fCard.getBoundingClientRect();
   if(calm()){focusEl.animate([{opacity:0},{opacity:1}],{duration:200});return}
   const s=from.width/Math.max(1,to.width);
   fCard.animate([{transform:`translate(${from.left+from.width/2-(to.left+to.width/2)}px,${from.top+from.height/2-(to.top+to.height/2)}px) scale(${s}) rotate(${f.r}deg)`},{transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.9,.25,1.05)'});
   $('#fScrim').animate([{opacity:0},{opacity:1}],{duration:260});
   fTools.animate([{transform:'translateY(70px)',opacity:0},{transform:'none',opacity:1}],{duration:420,delay:160,easing:'cubic-bezier(.3,1.3,.5,1)',fill:'backwards'});
};
  fPhoto.complete&&fPhoto.naturalWidth?requestAnimationFrame(go):(fPhoto.onload=()=>{fPhoto.onload=null;go()},setTimeout(()=>{if(fPhoto.onload){fPhoto.onload=null;go()}},300));
  fBody.focus({preventScroll:true})}
 async function close(){
  if(openIdx<0)return;const i=openIdx;openIdx=-1;
  const ps=photos();if(ps[i]){ps[i].caption=fCap.value.trim();Store.save({photos:ps})}
  focusEl.classList.remove('typing');fCap.blur();setTool(null);
  await render();
  const b=el.querySelector(`.ph[data-i="${i}"]`);
  if(b&&!calm()){b.style.visibility='hidden';const to=b.getBoundingClientRect(),from=fCard.getBoundingClientRect(),f=layout[i];
   fTools.animate([{opacity:1},{opacity:0}],{duration:120,fill:'forwards'});
   $('#fScrim').animate([{opacity:1},{opacity:0}],{duration:300,fill:'forwards'});
   await fCard.animate([{transform:'none'},{transform:`translate(${to.left+to.width/2-(from.left+from.width/2)}px,${to.top+to.height/2-(from.top+from.height/2)}px) scale(${to.width/Math.max(1,from.width)}) rotate(${f.r}deg)`}],{duration:320,easing:'cubic-bezier(.3,.1,.2,1)',fill:'forwards'}).finished.catch(()=>{});
   b.style.visibility=''}
  focusEl.hidden=true;focusEl.getAnimations({subtree:true}).forEach(a=>a.cancel());
  if(b)b.focus({preventScroll:true})}
 /* the editor's polaroid: its width is the photo's plus the mat, and everything else follows from that width */
 function sizeCard(){const P=fPhoto.getBoundingClientRect().width;if(P){edW=P/(1-2*MAT);fitCap()}}
 function fitCap(){if(edW)capVars(fCard,capFit(fCap.value,edW))}
 addEventListener('resize',()=>{if(openIdx>=0)sizeCard()});
 // the X, or tapping anywhere off the photo and tools, closes it
 $('#fScrim').onclick=close;$('#fClose').onclick=close;
 addEventListener('keydown',e=>{if(e.key==='Escape'&&openIdx>=0)close()});
 fCap.oninput=()=>{fCap.value=fCap.value.replace(/\n/g,' ');fitCap();const ps=photos();if(ps[openIdx]){ps[openIdx].caption=fCap.value;Store.save({photos:ps})}};
 // on phones the tools tuck away while typing; bring them back a beat after blur so a tap on "done" lands first
 let typingT=null;
 fCap.onfocus=()=>{clearTimeout(typingT);focusEl.classList.add('typing');setTool('type')};
 /* tools: tap to pick (it rises), tap again to put it down. The typewriter writes on the strip;
    the marker draws on the photo */
 function setTool(t){toolBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===t));fCard.dataset.tool=t||'';
  Ink.enable(t==='marker');focusEl.classList.toggle('marking',t==='marker');paintInk()}
 /* marker: draw on the photo; the pill above it picks ink and thickness, and undoes the last line */
 const inkBtns=[...focusEl.querySelectorAll('.ink-c')],sizeBtns=[...focusEl.querySelectorAll('.ink-s')];
 function paintInk(){inkBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===Ink.color));sizeBtns.forEach(b=>b.setAttribute('aria-pressed',+b.dataset.s===Ink.size));
  tMarker.style.setProperty('--ink',Ink.color);const p=photos()[openIdx];inkUndo.disabled=!(p&&p.ink&&p.ink.length)}
 Ink.attach($('#fInk'),()=>openIdx>=0?photos()[openIdx]:null,()=>{Store.save({photos:photos()});paintInk()});
 inkBtns.forEach(b=>b.onclick=()=>{Ink.color=b.dataset.c;paintInk()});
 sizeBtns.forEach(b=>b.onclick=()=>{Ink.size=+b.dataset.s;paintInk()});
 inkUndo.onclick=()=>Ink.undo();
 toolBtns.forEach(b=>b.onclick=()=>{const t=b.getAttribute('aria-pressed')==='true'?null:b.dataset.tool;setTool(t);
  if(t==='type')fCap.focus({preventScroll:true});else fCap.blur()});
 paintInk();
 fCap.onblur=()=>{clearTimeout(typingT);typingT=setTimeout(()=>focusEl.classList.remove('typing'),300)};
 // swap: a hop, then the photo picker; the new photo takes this one's place, caption and spot
 const tSwap=$('#tSwap');
 tSwap.onclick=()=>{tSwap.classList.remove('hop');void tSwap.offsetWidth;tSwap.classList.add('hop');setTool(null);pick(openIdx)};
 async function removeAt(i){
  const ps=photos(),[gone]=ps.splice(i,1);if(!gone)return;
  Store.save({photos:ps});await render();
  if(undo)undo.commit();
  undo={commit:()=>Store.dropBlob(gone.blobId)};
  toast('photo removed',{label:'undo',run:()=>{undo=null;const ps=photos();ps.splice(i,0,gone);Store.save({photos:ps});render()}},5000)};
 /* the envelope holds the postcard from the craft step: hover to peek, tap to pop it out (front and back, fanned) */
 const bEnv=$('#bEnv'),peek=$('#bPeek'),[pcBack,pcFront]=peek.querySelectorAll('.pc');
 function paintCard(){try{const copy=(src,dst)=>{const g=dst.getContext('2d');g.clearRect(0,0,dst.width,dst.height);g.drawImage(src,0,0,dst.width,dst.height)};
  copy(cfs[st.d],pcFront);copy(cb,pcBack);return true}catch(e){return false}}
 function showCard(on){if(on&&!paintCard())return;peek.classList.toggle('open',on);peek.classList.remove('flip','peek');bEnv.setAttribute('aria-expanded',on);peek.setAttribute('aria-hidden',!on)}
 bEnv.onclick=()=>showCard(!peek.classList.contains('open'));
 bEnv.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!peek.classList.contains('open')&&paintCard())peek.classList.add('peek')});
 bEnv.addEventListener('pointerleave',()=>peek.classList.remove('peek'));
 pcFront.onclick=()=>peek.classList.remove('flip');pcBack.onclick=()=>peek.classList.add('flip');
 // tapping anywhere else tucks it back in
 addEventListener('pointerdown',e=>{if(peek.classList.contains('open')&&!peek.contains(e.target)&&e.target!==bEnv)showCard(false)},true);
 addEventListener('keydown',e=>{if(e.key==='Escape'&&peek.classList.contains('open'))showCard(false)});
 addEventListener('snaily:view',e=>{if(e.detail!=='board')showCard(false)});
 /* next: the envelope grows, the photos drop into it one by one (in order) and slide in behind its front,
    then it settles back down to its small size and on to the review */
 const OPEN_MOUTH=.42;// where the flap meets the body of images/envelope-open.png, as a fraction of its height
 let packing=false;
 next.onclick=async()=>{if(packing)return;Store.flush();
  if(calm()||!photos().length){location.hash='sent';return}
  packing=true;const foot=[addB,trash,$('#bBack'),next,hintEl,lay];
  try{await packUp(foot)}catch(e){}
  location.hash='sent';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{[bEnv,...foot].forEach(e=>e.getAnimations().forEach(a=>a.cancel()));
   el.querySelectorAll('.packing').forEach(c=>c.remove());el.querySelectorAll('.ph').forEach(b=>b.style.visibility='');packing=false}))};
 async function packUp(foot){
  showCard(false);const S=1.8,lifted=`translateY(-6px) scale(${S})`;
  foot.forEach(e=>e.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'}));
  await bEnv.animate([{transform:'none'},{transform:`translateY(-8px) scale(${S*1.06})`,offset:.7},{transform:lifted}],{duration:380,easing:'cubic-bezier(.3,1.3,.5,1)',fill:'forwards'}).finished;
  const er=bEnv.getBoundingClientRect(),br=el.getBoundingClientRect(),mouth=er.top+er.height*OPEN_MOUTH,bodyW=er.width*.94,bodyH=er.bottom-mouth;
  const phs=[...el.querySelectorAll('.ph')].sort((a,b)=>a.dataset.i-b.dataset.i);
  await Promise.all(phs.map((b,k)=>{const f=layout[+b.dataset.i];if(!f)return;
   let w=bodyW*.7,h=w*f.h/f.w;if(h>bodyH*.85){h=bodyH*.85;w=h*f.w/f.h}
   const sc=w/f.w,ox=f.x+f.w/2,oy=f.y+f.h/2,cx=er.left+er.width/2-br.left+(k%2?3:-3),cy=mouth+4-h/2-br.top,tilt=k%2?4:-4;
   const at=(y,r=tilt,s=sc)=>`translate(${cx-ox}px,${y-oy}px) rotate(${r}deg) scale(${s})`;
   const c=b.cloneNode(true);c.classList.add('packing');c.tabIndex=-1;c.setAttribute('aria-hidden','true');c.style.zIndex=200;el.append(c);
   return wait(k*110).then(()=>{b.style.visibility='hidden';
    return c.animate([{transform:b.style.transform},{transform:`translate(${(cx-ox)*.55}px,${Math.min(0,cy-oy)*.55-40}px) rotate(${f.r/2}deg) scale(${(1+sc)/2})`,offset:.5},{transform:at(cy)}],
     {duration:520,easing:'cubic-bezier(.45,.05,.35,1)',fill:'forwards'}).finished})
    // and in it goes, behind the front of the envelope
    .then(()=>{c.style.zIndex=1;return c.animate([{transform:at(cy)},{transform:at(mouth+h/2+6-br.top,0)}],{duration:220,easing:'cubic-bezier(.6,0,.9,.6)',fill:'forwards'}).finished})
    .then(()=>c.remove())}));
  // a little gulp, then back down to size
  await bEnv.animate([{transform:lifted},{transform:`translateY(-6px) scale(${S*1.08},${S*.9})`,offset:.25},{transform:`translateY(-10px) scale(${S*.97},${S*1.04})`,offset:.5},{transform:'none'}],{duration:560,easing:'cubic-bezier(.3,1.1,.5,1)',fill:'forwards'}).finished}
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 addB.onclick=()=>pick(-1);$('#bBack').onclick=()=>{Store.flush();location.hash='write'};

 function show(){
  Store.load().then(d=>{
   render()})}
 new ResizeObserver(()=>{if($('#v-board').classList.contains('on')&&openIdx<0)render()}).observe(el);
 addEventListener('snaily:view',e=>{if(e.detail==='board')show();else if(openIdx>=0){openIdx=-1;focusEl.hidden=true}});
 if(location.hash==='#board')show();
 return{render,toast,hash,TAPES,capFit,MAT,STRIP};
})();
