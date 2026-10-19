/* ---------- next: the snail brings its envelope, the postcard drops in, then on to the photo board ----------
   The 3D card is swapped for a flat DOM copy of the side that's showing
   (from its 2D texture canvas). The controls step aside, the snail pops up
   with its envelope where they were, the card turns sideways and falls
   through the slot, and the envelope drops down between back and next on the board,
   where the snail ducks inside and it opens up, a small + popping out beside it. */
(function(){
 const env=$('#env'),view=$('#v-write'),bar=view.querySelector('.bar'),cname=$('#cname'),flipB=$('#flip'),bEnv=$('#bEnv'),bAdd=$('#bAdd');
 /* the envelope's body in images/envelope.png, as fractions of the image */
 const BODY={l:.03,t:.575,r:.97,b:.975};
 /* and the open one's (images/envelope-open.png), bottom edge and width */
 const OPEN={l:.03,r:.97,b:.965};
 let busy=false;
 const anim=(el,kf,o)=>el.animate(kf,{fill:'forwards',...o});
 const done=a=>a.finished.catch(()=>{});
 const frame=()=>new Promise(r=>requestAnimationFrame(r));
 async function waitIdle(){const t=performance.now();while(!cardIdle()&&performance.now()-t<800)await frame()}

 async function send(){
  if(busy)return;busy=true;
  settleCard();Store.save({design:st.d,to:st.to,message:st.txt});Store.flush();
  await waitIdle();
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){
   await done(anim(view,[{opacity:1},{opacity:0}],{duration:220}));
   location.hash='board';return finish()}
  const shot=cardShot(),vr=view.getBoundingClientRect(),mail=new Image();
  mail.className='mail';mail.alt='';mail.src=shot.src;
  Object.assign(mail.style,{left:shot.left-vr.left+'px',top:shot.top-vr.top+'px',width:shot.width+'px',height:shot.height+'px'});
  view.append(mail);hideCard(true);view.style.overflow='hidden';
  // the controls step aside and the snail pops up with its envelope
  [bar,cname,flipB].forEach(el=>anim(el,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(14px)'}],{duration:200,easing:'ease-in'}));
  const lift=anim(mail,[{transform:'none'},{transform:'translateY(-14px) scale(1.03)'}],{duration:220,easing:'ease-out'});
  env.classList.add('on');
  await done(anim(env,[{transform:'translateY(50px) scale(.4)',opacity:0},{transform:'translateY(-10px) scale(1.06)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.3,1.3,.5,1)'}));
  await done(lift);
  // the tall card turns sideways and shrinks to fit the slot (once turned, its width on screen is its height)
  const er=env.getBoundingClientRect(),bw=(BODY.r-BODY.l)*er.width,bh=(BODY.b-BODY.t)*er.height;
  const slotX=er.left+(BODY.l+BODY.r)/2*er.width,slotY=er.top+BODY.t*er.height;
  const s=Math.min(bw*.86/shot.height,(bh-6)/shot.width),lh=shot.width*s;
  const dx=slotX-(shot.left+shot.width/2),dy=slotY-lh/2-4-(shot.top+shot.height/2);
  const at=(y,r=90)=>`translate(${dx}px,${y}px) rotate(${r}deg) scale(${s})`;
  await done(anim(mail,[
   {transform:'translateY(-14px) scale(1.03)'},
   {transform:`translate(${dx*.4}px,${dy*.35-24}px) rotate(55deg) scale(${(1.03+s)/2})`,offset:.45},
   {transform:at(dy)}],{duration:560,easing:'cubic-bezier(.45,.05,.35,1)'}));
  // and falls through, behind the front of the envelope
  await done(anim(mail,[{transform:at(dy)},{transform:at(dy+lh+6)}],{duration:240,easing:'cubic-bezier(.6,0,.9,.6)'}));
  mail.remove();
  await done(anim(env,[{transform:'none'},{transform:'scale(1.1,.86)',offset:.35},{transform:'scale(.95,1.07)',offset:.7},{transform:'none'}],{duration:320}));
  // the envelope drops down to wait beside next on the photo board
  const r0=env.getBoundingClientRect(),fly=document.createElement('div');fly.className='env-fly';
  Object.assign(fly.style,{left:r0.left+'px',top:r0.top+'px',width:r0.width+'px',height:r0.height+'px'});
  document.body.append(fly);env.classList.remove('on');bEnv.style.visibility=bAdd.style.visibility='hidden';
  location.hash='board';await frame();await frame();
  // land with the closed envelope's body over the open one's: same width, same bottom edge
  const r1=bEnv.getBoundingClientRect(),k=(OPEN.r-OPEN.l)*r1.width/((BODY.r-BODY.l)*r0.width);
  const tx=r1.left+r1.width/2-r0.left-r0.width*k/2,ty=r1.top+OPEN.b*r1.height-r0.top-BODY.b*r0.height*k,go=(y,sc=k,r=0)=>`translate(${tx}px,${y}px) scale(${sc}) rotate(${r}deg)`;
  await done(fly.animate([
   {transform:'none'},
   {transform:`translate(${tx*.45}px,${Math.min(0,ty)*.45-36}px) scale(${(1+k)/2}) rotate(-6deg)`,offset:.4,easing:'cubic-bezier(.5,0,.8,.4)'},
   {transform:go(ty),offset:.8},
   {transform:go(ty-7,k,3),offset:.9},
   {transform:go(ty)}],{duration:640,fill:'forwards',easing:'cubic-bezier(.3,0,.5,1)'}));
  // the snail ducks in and the envelope opens; then the + pops out beside it
  bEnv.style.visibility='';
  fly.animate([{transform:go(ty),opacity:1},{transform:go(ty+8,k*.96),opacity:0}],{duration:200,fill:'forwards',easing:'ease-in'});
  await done(bEnv.animate([{transform:'scale(.8,.7)',opacity:0},{transform:'scale(1.1,1.08)',opacity:1,offset:.55},{transform:'scale(.97,1.02)',offset:.8},{transform:'none',opacity:1}],{duration:420,delay:90,easing:'cubic-bezier(.3,1.2,.5,1)',fill:'backwards'}));
  fly.remove();bAdd.style.visibility='';
  await done(bAdd.animate([{transform:'scale(0) rotate(-90deg)',opacity:0},{transform:'scale(1.15) rotate(0deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.3,1.3,.5,1)'}));
  finish()}

 // undo the flight's leftovers so the write view is ready if you come back
 function finish(){setTimeout(()=>{[env,bar,cname,flipB,view,$('#gl')].forEach(e=>e.getAnimations().forEach(a=>a.cancel()));view.style.overflow='';env.classList.remove('on');bEnv.style.visibility=bAdd.style.visibility='';hideCard(false);busy=false},50)}
 $('#next').onclick=send;
})();
