/* ---------- photo viewer: a postcard's photos side by side, to look at up close and save ----------
   Opened by tapping a photo on a sent postcard (the archive) or a received one (its link). Swipe or use
   the arrows to go between them; save keeps the one in view, save all keeps every one. On a phone they go
   through the share sheet (so they land in Photos); elsewhere they download as files. */
const PhotoView=(()=>{
 let el=null,track=null,count=null,items=[],from=null;
 const calm=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
 const SAVE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';

 function build(){el=document.createElement('div');el.className='reo pv';el.hidden=true;
  el.innerHTML=`<div class="reo-scrim"></div><div class="reo-body" role="dialog" aria-modal="true" aria-labelledby="pvH">
   <button class="close-x" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button>
   <h3 id="pvH">The Photos</h3><p class="reo-tip" aria-live="polite"></p>
   <div class="pv-row"><button class="pv-arrow pv-prev" aria-label="Previous photo">${ARROW}</button><ul class="reo-track pv-track"></ul><button class="pv-arrow pv-next" aria-label="Next photo">${ARROW}</button></div>
   <div class="pv-acts"><button class="pv-save" data-save="one">${SAVE}<span>save this photo</span></button><button class="pv-save" data-save="all">${SAVE}<span>save all</span></button></div></div>`;
  document.body.append(el);track=el.querySelector('.pv-track');count=el.querySelector('.reo-tip');
  el.querySelector('.close-x').onclick=close;el.querySelector('.reo-scrim').onclick=close;
  el.querySelector('.pv-prev').onclick=()=>go(cur()-1);el.querySelector('.pv-next').onclick=()=>go(cur()+1);
  el.querySelector('[data-save="one"]').onclick=()=>save([cur()]);el.querySelector('[data-save="all"]').onclick=()=>save(items.map((_,i)=>i));
  let t=0;track.addEventListener('scroll',()=>{cancelAnimationFrame(t);t=requestAnimationFrame(()=>paint())},{passive:true});
  el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}
   else if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1)}
   else if(e.key==='Tab'){const f=[...el.querySelectorAll('button')].filter(x=>!x.disabled&&x.offsetParent!==null),a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}})}

 // which photo is nearest the middle of the track
 function cur(){const kids=[...track.children];if(!kids.length)return 0;const mid=track.scrollLeft+track.clientWidth/2;
  let best=0,d=1e9;kids.forEach((k,i)=>{const c=k.offsetLeft+k.offsetWidth/2,x=Math.abs(c-mid);if(x<d){d=x;best=i}});return best}
 function go(i,smooth=true){i=Math.max(0,Math.min(items.length-1,i));const k=track.children[i];if(!k)return;
  track.scrollTo({left:k.offsetLeft+k.offsetWidth/2-track.clientWidth/2,behavior:smooth&&!calm()?'smooth':'auto'});paint(i)}
 function paint(i=cur()){const n=items.length;[...track.children].forEach((k,j)=>k.classList.toggle('on',j===i));count.textContent=n>1?`${i+1} of ${n}`:'';
  el.querySelector('.pv-prev').disabled=i<=0;el.querySelector('.pv-next').disabled=i>=n-1;
  el.querySelector('[data-save="all"]').hidden=n<2;el.querySelector('.pv-row').classList.toggle('one',n<2)}

 /* items: [{src: a canvas or a loaded image}], in order; start: which to show first */
 function open(list,start=0){if(!list.length)return;if(!el)build();items=list;from=document.activeElement;track.textContent='';
  items.forEach((it,i)=>{const li=document.createElement('li');li.className='reo-item';
   const c=document.createElement('canvas'),w=it.src.naturalWidth||it.src.width,h=it.src.naturalHeight||it.src.height;c.width=w;c.height=h;c.getContext('2d').drawImage(it.src,0,0);
   c.setAttribute('role','img');c.setAttribute('aria-label',`photo ${i+1} of ${items.length}`);
   const ph=document.createElement('div');ph.className='reo-ph pv-ph';ph.append(c);li.append(ph);track.append(li)});
  el.hidden=false;go(start,false);
  if(!calm())el.animate([{opacity:0},{opacity:1}],{duration:220});
  el.querySelector('.close-x').focus({preventScroll:true})}
 function close(){if(!el||el.hidden)return;el.hidden=true;track.textContent='';items=[];if(from&&from.focus)from.focus({preventScroll:true})}

 const blob=i=>new Promise((res,rej)=>{const it=items[i],c=document.createElement('canvas');c.width=it.src.naturalWidth||it.src.width;c.height=it.src.naturalHeight||it.src.height;
  c.getContext('2d').drawImage(it.src,0,0);c.toBlob(b=>b?res(b):rej(new Error('photo')),'image/jpeg',.92)});
 const name=i=>`snaily-photo-${i+1}.jpg`;
 async function save(ix){let files;try{files=await Promise.all(ix.map(async i=>new File([await blob(i)],name(i),{type:'image/jpeg'})))}
  catch(e){console.warn('save failed',e);return Board.toast("Couldn't save that photo.",null,4000)}
  // a phone: the share sheet, which can put them straight into Photos
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files})){
   try{await navigator.share({files});return}catch(e){if(e&&e.name==='AbortError')return}}
  for(const f of files){const a=document.createElement('a'),u=URL.createObjectURL(f);a.href=u;a.download=f.name;document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(u),4000);if(files.length>1)await new Promise(r=>setTimeout(r,250))}
  Board.toast(files.length>1?`Saved ${files.length} photos`:'Photo saved')}
 return{open,close};
})();
