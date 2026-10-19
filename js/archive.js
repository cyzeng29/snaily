/* ---------- archive: the postcards sent from and opened on this device ----------
   Sent ones open just as they went: the very front, back and prints that were posted, laid out the way
   they were (kept on the device when it was sent, see Store.finish). Received ones open their link. */
(function(){
 const list=$('#arch'),empty=$('#emptyMsg'),boxBtns=[...document.querySelectorAll('[data-box]')];
 const det=$('#archD'),dStage=$('#archStage'),dH=$('#archH'),dSub=$('#archSub'),dNote=$('#archNote'),dFlip=$('#archFlip'),dCopy=$('#archCopy');
 let box='sent',cmp=null,cur=null,from=null;
 const day=iso=>{const t=new Date(iso);return isNaN(t)?'':t.toLocaleDateString([],{day:'numeric',month:'short',year:t.getFullYear()===new Date().getFullYear()?undefined:'numeric'})};
 const when=iso=>{const t=new Date(iso);return isNaN(t)?'':t.toLocaleString([],{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})};

 function paint(){boxBtns.forEach(b=>b.setAttribute('aria-pressed',b.dataset.box===box));
  const items=box==='sent'?Store.sent():Store.received();list.textContent='';
  empty.hidden=!!items.length;empty.textContent=`no ${box} postcards yet.`;
  for(const it of items){const li=document.createElement('li'),b=document.createElement('button');b.className='arch-item';
   const who=box==='sent'?(it.to?`To ${it.to}`:'A postcard'):`From ${it.from||'someone'}`,date=day(box==='sent'?it.sentAt:it.openedAt);
   b.setAttribute('aria-label',`${who}, ${date}`);
   b.innerHTML='<span class="arch-pic"><img alt=""></span><span class="arch-who"></span><span class="arch-date muted"></span>';
   b.querySelector('img').src=it.thumb||'';b.querySelector('.arch-who').textContent=who;b.querySelector('.arch-date').textContent=date;
   b.onclick=()=>box==='sent'?open(it):(location.href=it.url);li.append(b);list.append(li)}}
 boxBtns.forEach(b=>b.onclick=()=>{box=b.dataset.box;paint()});

 const img=src=>Prints.loadImg(src);
 async function open(it){from=document.activeElement;cur=it;det.hidden=false;dH.textContent=it.to?`To ${it.to}`:'Your Postcard';
  dSub.textContent=`Sent ${when(it.sentAt)}`+(it.deliverAt&&new Date(it.deliverAt)-new Date(it.sentAt)>60000?` · arrives ${when(it.deliverAt)}`:'');
  dNote.hidden=true;dStage.textContent='';cmp=null;dFlip.hidden=false;
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)det.animate([{opacity:0},{opacity:1}],{duration:220});
  $('#archClose').focus({preventScroll:true});
  const kept=await Store.sentCard(it.id);if(cur!==it)return;
  if(!kept){// sent before the archive kept copies: only the little picture is left
   const i=document.createElement('img');i.className='arch-old';i.alt='Your postcard';i.src=it.thumb||'';dStage.append(i);dFlip.hidden=true;
   dNote.textContent='Only this little picture was kept of this one.';dNote.hidden=false;return}
  const[f,b,...ps]=await Promise.all([kept.front,kept.back,...kept.prints].map(id=>Store.url(id).then(img)));if(cur!==it)return;
  const L=kept.layout||{mode:'clip',prints:[]},ids=ps.map((_,k)=>'p'+k),canvas={};
  ids.forEach((id,k)=>{const q=L.prints&&L.prints[k];if(q)canvas[id]={...q}});
  cmp=Compose.make(dStage,{label:'The postcard you sent. Tap it to turn it over.',onPhoto:i=>PhotoView.open(ps.map(src=>({src})),i)});
  cmp.onSide=s=>{dFlip.querySelector('span').textContent=s?'see the front':'see the back'};
  cmp.set({front:f,back:b,prints:ps.map((p,k)=>({id:ids[k],src:p,w:p.naturalWidth,h:p.naturalHeight})),mode:L.mode,canvas})}
 function close(){if(det.hidden)return;det.hidden=true;cur=null;cmp=null;dStage.textContent='';if(from&&from.focus)from.focus({preventScroll:true})}
 $('#archClose').onclick=close;
 dFlip.onclick=()=>{if(cmp)cmp.flip()};
 dCopy.onclick=async()=>{if(!cur)return;try{await navigator.clipboard.writeText(cur.url);Board.toast('Link copied')}catch(e){prompt('Copy this link:',cur.url)}};
 det.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});

 addEventListener('snaily:view',e=>{if(e.detail==='gallery')paint();else close()});
 // straight from sending: open the one that just went
 let show=null;try{show=sessionStorage.getItem('snaily-show');sessionStorage.removeItem('snaily-show')}catch(e){}
 if(document.body.dataset.view==='gallery'){paint();const it=show&&Store.sent().find(x=>x.id===show);if(it)open(it)}
})();
