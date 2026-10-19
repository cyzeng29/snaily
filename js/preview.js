/* ---------- arrange: the postcard and its photos, then sending it off ----------
   The card from the craft step with the photos from the board, as prints (js/compose.js), one of two ways:
   paper-clipped to the card's corner (reorder them in a carousel) or spread around it on a canvas (drag them).
   Send off opens the send view: the card peeking out of its envelope, who it's from and when it arrives.
   Only once it has really been posted (js/net.js) does the completion screen show; until then the draft stays. */
(function(){
 const view=$('#v-sent'),stage=$('#pStage'),flipEl=$('#pFlip'),modeEl=view.querySelector('.mode'),modeBtns=[...modeEl.querySelectorAll('[data-mode]')],reoB=$('#pReorder'),live=$('#pLive');
 const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches,touch=matchMedia('(hover:none)');
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const cmp=Compose.make(stage,{interactive:true,label:'Your postcard. Tap it to turn it over.',onArrange:()=>save()});
 cmp.onSide=b=>{flipEl.querySelector('span').textContent=b?'see the front':'see the back'};
 flipEl.onclick=()=>cmp.flip();
 let d=null,on=false,job=0;
 const photos=()=>d?d.photos:[];
 const arrange=()=>d.arrange||(d.arrange={mode:'clip',canvas:{}});
 const save=()=>{if(d)Store.save({arrange:d.arrange})};
 const say=t=>{live.textContent='';setTimeout(()=>live.textContent=t,30)};

 /* the card as crafted, and every photo as a print, in the board's order */
 async function load(animate){const n=++job;d=await Store.load();await designsReady;while(!ready)await sleep(50);
  const ps=photos(),cs=await Promise.all(ps.map(p=>Prints.of(p)));if(n!==job||!on)return;
  cmp.set({front:cfs[st.d],back:cb,prints:ps.map((p,i)=>({id:p.id,src:cs[i],w:cs[i].width,h:cs[i].height,label:(p.caption||'').trim()})),mode:arrange().mode,canvas:arrange().canvas,animate});
  save();paintMode()}
 function paintMode(){const m=arrange().mode;modeEl.dataset.on=m;modeBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));
  const can=m==='clip'&&photos().length>1;reoB.classList.toggle('off',!can);reoB.disabled=!can}
 modeBtns.forEach(b=>b.onclick=()=>{if(!d||b.dataset.mode===arrange().mode)return;arrange().mode=b.dataset.mode;save();cmp.setMode(b.dataset.mode);paintMode();
  say(b.dataset.mode==='clip'?'Paper clip: your photos are clipped to the card.':'Canvas: your photos are spread around the card. Drag them, or focus one and use the arrow keys.')});
 addEventListener('snaily:view',e=>{on=e.detail==='sent';if(on)load(false);else{closeReorder(true);closeSend(true)}});
 $('#pBack').onclick=()=>{location.hash='board'};

 /* small helpers for the overlays: Tab stays inside, Escape is theirs */
 function trap(box,e){if(e.key!=='Tab')return;const f=[...box.querySelectorAll('button,input,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
  const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
 const copyCanvas=(src,w)=>{const c=document.createElement('canvas'),k=w/src.width;c.width=w;c.height=Math.round(src.height*k);c.getContext('2d').drawImage(src,0,0,c.width,c.height);return c};

 /* ---------- reorder: a carousel of the photos ----------
    swipe or scroll through them; drag one to a new place (on touch: hold it first), or use its arrows;
    its small red x deletes it, after asking. Every change shows in the stack behind straight away. */
 const reo=$('#reo'),track=$('#reoTrack'),reoLive=$('#reoLive'),confirmEl=$('#reoConfirm');
 let reoFrom=null,doomed=null;
 const sayR=t=>{reoLive.textContent='';setTimeout(()=>reoLive.textContent=t,30)};
 const ARW=d=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
 async function paintTrack(focusId,focusSel){const ps=photos(),cs=await Promise.all(ps.map(p=>Prints.of(p)));const before=rects();track.textContent='';
  ps.forEach((p,i)=>{const li=document.createElement('li');li.className='reo-item';li.dataset.id=p.id;
   const cap=(p.caption||'').trim(),name=`photo ${i+1}${cap?' ('+cap+')':''}`;
   li.innerHTML=`<div class="reo-ph"><button class="reo-del" aria-label="Delete ${name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l8 8M16 8l-8 8"/></svg></button></div>
    <div class="reo-ctl"><button class="reo-mv" data-d="-1" aria-label="Move ${name} earlier" ${i?'':'disabled'}>${ARW(-1)}</button><span class="reo-n">${i+1} of ${ps.length}</span><button class="reo-mv" data-d="1" aria-label="Move ${name} later" ${i<ps.length-1?'':'disabled'}>${ARW(1)}</button></div>`;
   const c=copyCanvas(cs[i],420);c.setAttribute('role','img');c.setAttribute('aria-label',name);li.querySelector('.reo-ph').prepend(c);
   track.append(li);hold(li)});
  glide(before);
  if(focusId){const b=track.querySelector(`[data-id="${focusId}"] ${focusSel||'.reo-mv'}`);const el=b&&!b.disabled?b:track.querySelector(`[data-id="${focusId}"] .reo-mv:not(:disabled)`);if(el){el.focus({preventScroll:true});el.closest('li').scrollIntoView({inline:'center',block:'nearest',behavior:calm()?'auto':'smooth'})}}}
 // the others slide over to their new places
 const rects=()=>new Map([...track.children].map(li=>[li.dataset.id,li.getBoundingClientRect()]));
 function glide(before){if(calm()||!before.size)return;for(const li of track.children){const o=before.get(li.dataset.id);if(!o)continue;const r=li.getBoundingClientRect(),dx=o.left-r.left;if(Math.abs(dx)>1)li.animate([{transform:`translateX(${dx}px)`},{transform:'none'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'})}}
 function commit(ids){const ps=photos(),by=new Map(ps.map(p=>[p.id,p])),next=ids.map(id=>by.get(id)).filter(Boolean);if(next.map(p=>p.id).join()===ps.map(p=>p.id).join())return false;
  d.photos.splice(0,d.photos.length,...next);Store.save({photos:d.photos});load(true);return true}
 track.addEventListener('click',e=>{const mv=e.target.closest('.reo-mv'),del=e.target.closest('.reo-del');
  if(mv){const id=mv.closest('li').dataset.id,ids=photos().map(p=>p.id),i=ids.indexOf(id),j=i+ +mv.dataset.d;if(j<0||j>=ids.length)return;
   ids.splice(i,1);ids.splice(j,0,id);commit(ids);paintTrack(id,`.reo-mv[data-d="${mv.dataset.d}"]`);sayR(`Moved to ${j+1} of ${ids.length}.`)}
  if(del)askDelete(del.closest('li').dataset.id)});
 /* drag to reorder. Mouse: just drag. Touch: hold a moment, then drag (a quick swipe still scrolls the carousel).
    The photo lifts and follows you, a dashed gap shows where it will land, and the row scrolls at its ends */
 let dragging=null;
 track.addEventListener('touchmove',e=>{if(dragging)e.preventDefault()},{passive:false});
 function hold(li){const ph=li.querySelector('.reo-ph');let start=null,timer=0;
  ph.addEventListener('pointerdown',e=>{if(e.button||e.target.closest('button'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId,type:e.pointerType};
   if(e.pointerType!=='mouse')timer=setTimeout(()=>lift(li,e),260)});
  ph.addEventListener('pointermove',e=>{if(dragging||!start)return;const dist=Math.hypot(e.clientX-start.x,e.clientY-start.y);
   if(start.type==='mouse'){if(dist>6)lift(li,e)}else if(dist>8){clearTimeout(timer);start=null}});
  const end=()=>{clearTimeout(timer);start=null};
  ph.addEventListener('pointerup',end);ph.addEventListener('pointercancel',end);ph.addEventListener('contextmenu',e=>{if(dragging||start)e.preventDefault()})}
 function lift(li,e){const ph=li.querySelector('.reo-ph'),r=ph.getBoundingClientRect();try{ph.setPointerCapture(e.pointerId)}catch(x){}
  const ghost=ph.querySelector('canvas').cloneNode();ghost.getContext('2d').drawImage(ph.querySelector('canvas'),0,0);ghost.className='reo-ghost';ghost.removeAttribute('role');
  Object.assign(ghost.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px'});document.body.append(ghost);
  // moving the item in the row drops its pointer capture, so the rest of the drag is followed on the window
  const pid=e.pointerId,mv=ev=>{if(ev.pointerId===pid)move(ev)},up=ev=>{if(ev.pointerId===pid)drop()};addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  dragging={li,ghost,dx:e.clientX-r.left,dy:e.clientY-r.top,x:e.clientX,y:e.clientY,raf:0,off:()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)}};li.classList.add('lifted');reo.classList.add('dragging');
  if(navigator.vibrate)try{navigator.vibrate(8)}catch(x){}
  sayR('Picked up. Move it, then let go.');scroll()}
 function move(e){const g=dragging;g.x=e.clientX;g.y=e.clientY;g.ghost.style.left=g.x-g.dx+'px';g.ghost.style.top=g.y-g.dy+'px';
  // the gap moves to wherever the photo's centre now is
  const items=[...track.children].filter(x=>x!==g.li);let at=items.length;
  for(let k=0;k<items.length;k++){const r=items[k].getBoundingClientRect();if(g.x<r.left+r.width/2){at=k;break}}
  const ref=items[at]||null;if(g.li.nextElementSibling!==ref||(ref===null&&track.lastElementChild!==g.li)){const before=rects();track.insertBefore(g.li,ref);glide(before)}}
 // near either end the row scrolls along under the photo
 function scroll(){const g=dragging;if(!g)return;const r=track.getBoundingClientRect(),edge=70;let v=0;
  if(g.x<r.left+edge)v=-Math.ceil((r.left+edge-g.x)/6);else if(g.x>r.right-edge)v=Math.ceil((g.x-(r.right-edge))/6);
  if(v){track.scrollLeft+=v;move({clientX:g.x,clientY:g.y})}g.raf=requestAnimationFrame(scroll)}
 function drop(){const g=dragging;if(!g)return;dragging=null;g.off();cancelAnimationFrame(g.raf);const to=g.li.querySelector('.reo-ph').getBoundingClientRect();
  const done=()=>{g.ghost.remove();g.li.classList.remove('lifted');reo.classList.remove('dragging');
   const ids=[...track.children].map(li=>li.dataset.id),i=ids.indexOf(g.li.dataset.id);if(commit(ids))sayR(`Dropped at ${i+1} of ${ids.length}.`);paintTrack()};
  if(calm())return done();
  g.ghost.animate([{left:g.ghost.style.left,top:g.ghost.style.top},{left:to.left+'px',top:to.top+'px'}],{duration:200,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}).finished.then(done,done)}

 function openReorder(){if(!d||photos().length<2)return;reoFrom=document.activeElement;reo.hidden=false;
  $('#reoTip').textContent=touch.matches?'Swipe through them. Hold a photo, then drag it to move it.':'Scroll through them. Drag a photo to move it, or use its arrows.';
  paintTrack().then(()=>{const f=track.querySelector('.reo-mv:not(:disabled)');if(f)f.focus({preventScroll:true})});
  if(!calm()){reo.querySelector('.reo-body').animate([{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.25,1)'});$('#reoScrim').animate([{opacity:0},{opacity:1}],{duration:240})}}
 function closeReorder(now){if(reo.hidden)return;if(dragging){dragging.off();cancelAnimationFrame(dragging.raf);dragging.ghost.remove();dragging=null}reo.classList.remove('dragging');hideConfirm();reo.hidden=true;if(!now&&reoFrom&&reoFrom.focus)reoFrom.focus({preventScroll:true})}
 reoB.onclick=openReorder;$('#reoClose').onclick=()=>closeReorder();$('#reoScrim').onclick=()=>closeReorder();
 reo.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!confirmEl.hidden)hideConfirm(true);else closeReorder()}else trap(confirmEl.hidden?reo.querySelector('.reo-body'):confirmEl,e)});

 /* deleting asks first */
 async function askDelete(id){const p=photos().find(x=>x.id===id);if(!p)return;doomed=id;const c=await Prints.of(p),cv=$('#cfPh');cv.width=c.width;cv.height=c.height;cv.getContext('2d').drawImage(c,0,0);
  confirmEl.hidden=false;$('#cfCancel').focus({preventScroll:true});
  if(!calm())confirmEl.querySelector('.confirm-card').animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.3,1.3,.5,1)'})}
 function hideConfirm(back){if(confirmEl.hidden)return;confirmEl.hidden=true;const id=doomed;doomed=null;
  if(back&&id){const b=track.querySelector(`[data-id="${id}"] .reo-del`);if(b)b.focus({preventScroll:true})}}
 $('#cfCancel').onclick=()=>hideConfirm(true);
 confirmEl.addEventListener('click',e=>{if(e.target===confirmEl)hideConfirm(true)});
 $('#cfDelete').onclick=async()=>{const id=doomed;hideConfirm();const ps=photos(),i=ps.findIndex(p=>p.id===id);if(i<0)return;
  const[gone]=ps.splice(i,1);delete arrange().canvas[id];Store.save({photos:ps,arrange:d.arrange});Store.dropBlob(gone.blobId);
  await load(true);sayR(`Photo deleted. ${ps.length} left.`);
  if(ps.length<2){closeReorder();return}
  const near=ps[Math.min(i,ps.length-1)];paintTrack(near.id,'.reo-del')};

 /* ---------- send: the card peeks out of its envelope ---------- */
 const sendv=$('#sendv'),env=$('#env3d'),form=$('#pForm'),from=$('#pFrom'),whenTxt=$('#pWhen'),sendB=$('#pSend'),doneEl=$('#pDone');
 let when='now',busy=false,posted=null,sendFrom=null,peekT=0;
 const nextMorning=()=>{const t=new Date();t.setDate(t.getDate()+1);t.setHours(8,0,0,0);return t};
 try{from.value=localStorage.getItem('snaily-name')||''}catch(e){}
 function paintWhen(){sendv.querySelectorAll('[data-when]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.when===when));
  whenTxt.textContent=when==='snail'?'The snail takes it overnight: it arrives tomorrow at 8:00 am.':'It arrives as soon as they open the link.'}
 sendv.querySelectorAll('[data-when]').forEach(b=>b.onclick=()=>{when=b.dataset.when;paintWhen()});
 function openSend(){if(!d||!ready)return;sendFrom=document.activeElement;closeReorder(true);
  const e=$('#eCard');e.textContent='';e.append(copyCanvas(cfs[st.d],460));
  posted=null;doneEl.hidden=true;sendv.classList.remove('sealing','posted','away');sendv.querySelector('.sendv-body').hidden=false;sendv.hidden=false;paintWhen();
  if(!calm()){sendv.animate([{opacity:0},{opacity:1}],{duration:220});env.animate([{transform:'translateY(-30px) scale(.9)',opacity:0},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.3,1.3,.5,1)'})}
  (from.value?sendB:from).focus({preventScroll:true})}
 function closeSend(now){if(sendv.hidden||busy)return;if(posted&&!now)return;sendv.hidden=true;if(!now&&sendFrom&&sendFrom.focus)sendFrom.focus({preventScroll:true})}
 $('#pNext').onclick=openSend;$('#sendClose').onclick=()=>closeSend();
 sendv.addEventListener('keydown',e=>{if(e.key==='Escape'&&!posted){e.preventDefault();closeSend()}else trap(posted?doneEl:sendv.querySelector('.sendv-body'),e)});
 // on touch the envelope's tilt plays for a moment when it's tapped (sending stays on the button)
 env.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;env.classList.add('peek');clearTimeout(peekT);peekT=setTimeout(()=>env.classList.remove('peek'),1400)});

 const jpg=(c,q=.9)=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('image')),'image/jpeg',q));
 /* everything that goes: the card's front and back, every photo's print in order, and how they go together */
 async function pack(){const ps=photos(),cs=await Promise.all(ps.map(p=>Prints.of(p))),a=arrange(),cv=Compose.spread(ps.map(p=>p.id),a.canvas);
  const front=await jpg(cfs[st.d]),back=await jpg(cb),prints=await Promise.all(cs.map(c=>jpg(c,.88)));
  const layout={v:1,mode:a.mode,prints:ps.map(p=>({x:cv[p.id].x,y:cv[p.id].y,r:cv[p.id].r,z:cv[p.id].z}))};
  return{front,back,prints,layout,cs}}
 /* the archive's little picture: the card with the first photos clipped on */
 function thumb(cs){const t=document.createElement('canvas');t.width=300;t.height=340;const g=t.getContext('2d'),cw=200,ch=cw*1360/920,x0=30,y0=34;
  // a JPEG has no see-through, so it sits on the paper colour its tile uses
  g.fillStyle='#F2EDBD';g.fillRect(0,0,300,340);g.fillStyle='#fbf6e6';g.shadowColor='rgba(43,16,12,.3)';g.shadowBlur=10;g.shadowOffsetY=4;g.fillRect(x0,y0,cw,ch);g.shadowColor='transparent';g.drawImage(cfs[st.d],x0,y0,cw,ch);
  cs.slice(0,3).reverse().forEach((c,k,a)=>{const i=a.length-1-k,w=cw*.44,h=w*c.height/c.width;g.save();g.translate(x0+cw*.92-i*3,y0+cw*.2+i*4);g.rotate((i?(i%2?5:-6):-3)*Math.PI/180);
   g.shadowColor='rgba(43,16,12,.3)';g.shadowBlur=6;g.shadowOffsetY=2;g.drawImage(c,-w/2,-h/2,w,h);g.restore()});
  return t.toDataURL('image/jpeg',.75)}

 form.onsubmit=async e=>{e.preventDefault();if(busy||posted)return;
  if(!Net.on)return Board.toast("Sending isn't set up yet.",null,4000);
  const sender=from.value.trim();if(!sender){from.focus();from.closest('.fld').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:240});return}
  try{localStorage.setItem('snaily-name',sender)}catch(x){}
  busy=true;sendB.disabled=true;sendB.textContent='Sending…';sendv.classList.add('sealing');form.setAttribute('aria-busy','true');
  let sent=null,p=null;const deliverAt=when==='snail'?nextMorning():new Date();
  try{p=await pack();sent=await Net.send({front:p.front,back:p.back,prints:p.prints,layout:p.layout,sender,deliverAt})}
  catch(err){console.warn('send failed',err);sendv.classList.remove('sealing');
   Board.toast(/anonymous/i.test(err&&err.message||'')?"Sending isn't switched on yet (anonymous sign-ins).":"Couldn't send it. Check your connection and try again.",null,5000)}
  // posted: keep a copy for the archive and start a fresh draft (neither can un-send it, so they can't fail it either)
  if(sent){const to=(st.to||'').split('\n')[0].trim();
   try{Store.addSent({id:sent.id,url:sent.url,sentAt:new Date().toISOString(),deliverAt:deliverAt.toISOString(),to,mode:p.layout.mode,photos:p.prints.length,thumb:thumb(p.cs)});
    await Store.finish(sent.id,{front:p.front,back:p.back,prints:p.prints,layout:p.layout,to,sender,deliverAt:deliverAt.toISOString()})}catch(x){console.warn('after send',x)}
   posted={...sent,sender};await showDone()}
  busy=false;sendB.disabled=false;sendB.textContent='Send';form.removeAttribute('aria-busy')};

 /* the completion screen: sealed, stamped, on its way */
 async function showDone(){sendv.classList.add('posted');
  if(!calm()){await sleep(350);sendv.classList.add('away');await sleep(520)}
  sendv.querySelector('.sendv-body').hidden=true;doneEl.hidden=false;
  $('#doneTxt').textContent=when==='snail'?'The snail is on its way. It arrives tomorrow at 8:00 am. Send them the link so they can find it.':'Send them the link and it opens straight away.';
  if(!calm())doneEl.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1)'});
  $('#doneH').focus({preventScroll:true})}
 // sharing needs its own tap: browsers only open the share sheet straight from one
 $('#pShare').onclick=async()=>{if(!posted)return;
  if(navigator.share){try{await navigator.share({title:'A postcard for you',text:`${posted.sender} sent you a postcard`,url:posted.url});return}catch(e){if(e&&e.name==='AbortError')return}}
  copy()};
 $('#pCopy').onclick=()=>copy();
 async function copy(){try{await navigator.clipboard.writeText(posted.url);Board.toast('Link copied')}catch(e){prompt('Copy this link:',posted.url)}}
 /* the draft was already swapped for a fresh one; reload so every screen starts clean */
 const leave=hash=>{location.replace(location.pathname+'#'+hash);location.reload()};
 $('#pView').onclick=()=>{try{sessionStorage.setItem('snaily-show',posted.id)}catch(e){}leave('gallery')};
 $('#pHome').onclick=()=>leave('home');

 if(document.body.dataset.view==='sent'){on=true;load(false)}
})();
