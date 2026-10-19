/* ---------- opening a postcard link (?p=<id>) ----------
   What the person you sent it to sees, in any browser and without the app: who it's from, then
   the card rises in and they can turn it over. A snail card that hasn't arrived shows the snail
   still on its way with a countdown, and opens itself when it's due. */
(function(){
 if(!OPENING)return;
 const id=OPENING,view=$('#v-open'),fromEl=$('#oFrom'),waitTxt=$('#oWaitTxt'),count=$('#oCount'),lostTxt=$('#oLostTxt'),flipEl=$('#oFlip'),hintEl=$('#oHint');
 const state=s=>{view.dataset.state=s};
 const img=src=>new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=rej;i.src=src});
 const canvasOf=i=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);return c};
 const left=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s/60)%60;return h?`${h}h ${m}m to go`:m?`${m}m ${s%60}s to go`:`${s}s to go`};
 let card=null,timer=null;

 async function go(){state('loading');fromEl.textContent='Opening Your Postcard…';
  if(!Net.on){lostTxt.textContent="this copy of Snaily can't reach the post office.";return state('lost')}
  let pc;try{pc=await Net.open(id)}catch(e){console.warn(e);lostTxt.textContent="couldn't reach the post office. check your connection and try again.";return state('lost')}
  if(!pc)return state('lost');
  fromEl.textContent=`A Postcard From ${pc.sender||'Someone'}`;
  if(!pc.arrived){state('wait');
   waitTxt.textContent='the snail is still carrying it. it arrives '+pc.deliverAt.toLocaleString([],{weekday:'long',hour:'numeric',minute:'2-digit'})+'.';
   clearInterval(timer);const t=()=>{const ms=pc.deliverAt-Date.now();count.textContent=left(ms);if(ms<=0){clearInterval(timer);setTimeout(go,1500)}};t();timer=setInterval(t,1000);return}
  let f,b,ps=[];try{[f,b,...ps]=await Promise.all([pc.front,pc.back,...(pc.layout?pc.prints:[])].map(img))}catch(e){lostTxt.textContent="the pictures didn't load. try again in a moment.";return state('lost')}
  const fc=canvasOf(f),bc=canvasOf(b);state('card');
  const onSide=s=>{flipEl.querySelector('span').textContent=s?'see the front':'see the back'};
  if(pc.layout){// the card with its photos, clipped on or spread around it, as it was sent
   const stage=$('#oCmp'),ids=ps.map((_,k)=>'p'+k),canvas={};ids.forEach((id,k)=>{const q=pc.layout.prints[k];if(q)canvas[id]={...q}});
   $('#oStage').hidden=true;stage.hidden=false;hintEl.hidden=!ps.length;card=Compose.make(stage,{label:'Your postcard. Tap it to turn it over.',onPhoto:i=>PhotoView.open(ps.map(src=>({src})),i)});card.onSide=onSide;
   card.set({front:fc,back:bc,prints:ps.map((p,k)=>({id:ids[k],src:p,w:p.naturalWidth,h:p.naturalHeight})),mode:pc.layout.mode==='canvas'?'canvas':'clip',canvas});
   if(!matchMedia('(prefers-reduced-motion:reduce)').matches)stage.animate([{opacity:0,transform:'translateY(24px) scale(.96)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.2,.9,.25,1)'})}
  else{card=Card3D($('#oStage'),$('#ogl'),fc,bc);card.onSide=onSide;card.pop=matchMedia('(prefers-reduced-motion:reduce)').matches?0:1;card.show(true)}
  flipEl.onclick=()=>card.flip();
  // opened here, it's kept in this device's postcards (once; not the sender's own copy, which is already under sent)
  if(!Store.received().some(x=>x.id===id)&&!Store.sent().some(x=>x.id===id)){const t=document.createElement('canvas');t.width=230;t.height=340;t.getContext('2d').drawImage(fc,0,0,230,340);
   Store.addReceived({id,url:Net.link(id),from:pc.sender,openedAt:new Date().toISOString(),thumb:t.toDataURL('image/jpeg',.7)})}}
 go();
})();
