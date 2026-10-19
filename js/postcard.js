const SNAIL='data:image/png;base64,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';
const N=D.length;
let editing=null;const st={d:0,to:'',txt:'',paper:null,ink:null,stamps:[]};
/* portrait card: texture size in px, world size, corner radius, thickness */
const W=920,H=1360,CW=2.3,CH=3.4,CR=.17,T=.05;
const cv=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c},cfs=D.map(cv),cb=cv(),img=new Image();
/* the back: "To:" and two lines for who it's for up top beside the stamp, then the message under a dashed line */
const R={to:{x:160,y:96,w:470,h:168,lh:84},txt:{x:80,y:352,w:760,h:924,lh:84}},TO_X=80;
function rrect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
/* where a stamp can sit on the front: centre, size of the box it fits in, and its little tilt */
const SPOTS=[{x:W-178,y:190,deg:4},{x:178,y:190,deg:-5},{x:W-178,y:H-200,deg:-3}],SB=230;
/* the stamp's drawn size inside a max×max box, keeping its shape */
function stampSize(i,max){const im=STAMPS[i].image,w=im&&im.naturalWidth||4,h=im&&im.naturalHeight||3,k=max/Math.max(w,h);return[w*k,h*k]}
/* a stamp, slightly crooked with a little drop shadow; the art is cached per stamp. st.stamps holds {i,spot}, one per spot */
const arts={};
function stamp(x,s,cx,cy,max,deg){const c=arts[s]||(arts[s]=stampArt(s,460,460));x.save();x.translate(cx,cy);x.rotate(deg*Math.PI/180);
 x.shadowColor='rgba(43,16,12,.3)';x.shadowBlur=12;x.shadowOffsetY=5;x.drawImage(c,-max/2,-max/2,max,max);x.restore()}
/* while a stamp is being dragged in, the middle card shows where it can land (G.hi is the one under your finger) */
let G=null;
function guides(x){SPOTS.forEach((p,k)=>{x.save();x.translate(p.x,p.y);x.rotate(p.deg*Math.PI/180);x.lineWidth=k===G.hi?7:4;x.setLineDash([16,12]);
 x.strokeStyle=k===G.hi?'rgba(255,253,240,.95)':'rgba(255,253,240,.6)';x.fillStyle=k===G.hi?'rgba(255,253,240,.35)':'rgba(255,253,240,.12)';
 x.shadowColor='rgba(43,16,12,.35)';x.shadowBlur=8;rrect(x,-SB/2,-SB/2,SB,SB,22);x.fill();x.stroke();x.restore()})}
/* until you pick colours, each design keeps its own */
const look=i=>({bg:st.paper||D[i].bg,fg:st.ink||D[i].fg});
/* the art, recoloured when you've picked colours; the untouched pixels are kept so recolouring never compounds */
function front(i){const x=cfs[i].getContext('2d'),d=D[i];
 if(!d.data){const im=d.image,k=Math.max(W/im.naturalWidth,H/im.naturalHeight)||1,iw=im.naturalWidth*k,ih=im.naturalHeight*k;x.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih);d.data=x.getImageData(0,0,W,H)}
 const from=d.pal.map(q=>q[1]),to=st.paper?remap(d,st.paper,st.ink):from;
 // recolouring takes a few ms per card, so keep the last result
 const key=to.join();if(!d.cache||d.cache.key!==key)d.cache={key,img:to.some((c,k)=>c!==from[k])?recolor(d.data,from,to):d.data};
 x.putImageData(d.cache.img,0,0);if(G&&i===st.d)guides(x);if(i===st.d)peels.forEach(q=>peeling(x,q));
 st.stamps.forEach(s=>{const p=SPOTS[s.spot];stamp(x,s.i,p.x,p.y,G&&i===st.d?SB*.92:SB,p.deg)});tfs[i].needsUpdate=true}
function back(){const x=cb.getContext('2d'),L=84,A=R.txt,B=R.to,ink='#6C2C25',on=k=>ed.dataset.k==k&&document.activeElement===ed&&blink;
 x.fillStyle='#fffdf0';x.fillRect(0,0,W,H);
 x.textBaseline='alphabetic';
 const rule=(y,g=A)=>{x.beginPath();x.moveTo(g.x,y);x.lineTo(g.x+g.w,y);x.stroke()};
 x.strokeStyle='#6C2C2545';x.lineWidth=3;x.setLineDash([]);for(let k=0;k<A.h/L;k++)rule(A.y+k*L+L-14);for(let k=0;k<2;k++)rule(B.y+k*L+L-14,{x:TO_X,w:B.x+B.w-TO_X});
 x.strokeStyle='#6C2C2599';x.lineWidth=4;x.setLineDash([12,10]);rule(B.y+B.h+50);x.setLineDash([]);if(st.stamps[0])stamp(x,st.stamps[0].i,752,150,180,-3);
 x.fillStyle=ink;x.font='500 46px "EB Garamond",Georgia,serif';const max=A.h/L;let y=A.y+L-22,cx=A.x,cy=y,n=0;
 if(!st.txt){x.globalAlpha=.35;x.fillText('dear you,',A.x,y);x.globalAlpha=1}
 for(const para of st.txt.split('\n')){let line='';for(const w of para.split(' ')){const t=line?line+' '+w:w;if(x.measureText(t).width>A.w&&line){if(n<max)x.fillText(line,A.x,y);y+=L;n++;line=w}else line=t}if(n<max)x.fillText(line,A.x,y);cx=A.x+x.measureText(line).width;cy=y;y+=L;n++}
 if(on('txt')){x.fillStyle='#EB5E3A';x.fillRect(cx+4,cy-36,3,46)}
 x.fillStyle=ink;x.globalAlpha=.6;x.fillText('To:',TO_X,B.y+L-22);x.globalAlpha=1;st.to.split('\n').slice(0,2).forEach((l,i)=>x.fillText(l,B.x,B.y+L-22+i*L));
 if(on('to')){const ls=st.to.split('\n').slice(0,2);x.fillStyle='#EB5E3A';x.fillRect(B.x+(st.to?x.measureText(ls[ls.length-1]).width:0)+5,B.y+L-22+(ls.length-1)*L-36,3,46)}
 tb.needsUpdate=true}
const tex=c=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t},tfs=cfs.map(tex),tb=tex(cb);
const stage=document.getElementById('stage'),canvas=document.getElementById('gl');
const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});r.outputEncoding=THREE.sRGBEncoding;r.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,50),TAN=Math.tan(17.5*Math.PI/180);
scene.add(new THREE.AmbientLight(0xffffff,.78));const sun=new THREE.DirectionalLight(0xfff4dd,.7);sun.position.set(-3,4,6);scene.add(sun);
/* rounded card: two flat faces with 0–1 UVs, plus the extruded rim for the paper edge */
const shape=new THREE.Shape();{const w=CW/2,h=CH/2,c=CR,P=Math.PI;shape.moveTo(-w+c,-h);shape.lineTo(w-c,-h);shape.absarc(w-c,-h+c,c,-P/2,0,false);shape.lineTo(w,h-c);shape.absarc(w-c,h-c,c,0,P/2,false);shape.lineTo(-w+c,h);shape.absarc(-w+c,h-c,c,P/2,P,false);shape.lineTo(-w,-h+c);shape.absarc(-w+c,-h+c,c,P,P*1.5,false)}
const faceGeo=new THREE.ShapeGeometry(shape,10);{const p=faceGeo.attributes.position,uv=faceGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/CW+.5,p.getY(i)/CH+.5)}
const edgeGeo=new THREE.ExtrudeGeometry(shape,{depth:T,bevelEnabled:false,curveSegments:10});edgeGeo.translate(0,0,-T/2);
const edge=new THREE.MeshStandardMaterial({color:0xe9e1b0,roughness:.9}),none=new THREE.MeshBasicMaterial({visible:false}),face=m=>new THREE.MeshStandardMaterial({map:m,roughness:.7});
/* a soft rounded shadow floating behind each card */
const sc=document.createElement('canvas');sc.width=256;sc.height=352;{const g=sc.getContext('2d');g.shadowColor='rgba(43,16,12,.5)';g.shadowBlur=34;g.shadowOffsetX=1000;g.fillStyle='#000';rrect(g,48-1000,48,160,256,14);g.fill()}
const shGeo=new THREE.PlaneGeometry(CW*256/160,CH*352/256),shMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false});
const cards=D.map((d,i)=>{const o=new THREE.Group(),f=new THREE.Group(),fm=face(tfs[i]),bm=face(tb),fr=new THREE.Mesh(faceGeo,fm),bk=new THREE.Mesh(faceGeo,bm),s=new THREE.Mesh(shGeo,shMat);
 fr.position.z=T/2+.001;bk.rotation.y=Math.PI;bk.position.z=-T/2-.001;f.add(fr,bk,new THREE.Mesh(edgeGeo,[none,edge]));s.position.set(.1,-.18,-.4);o.add(s,f);scene.add(o);return{o,f,s,fm,bm}});
let gap=2.6;
function size(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;
 cam.position.z=focused?Math.max(CH*1.04/(2*TAN),CW*1.1/(2*TAN*cam.aspect)):Math.max(CH*1.14/(2*TAN),CW*1.25/(2*TAN*cam.aspect));cam.updateProjectionMatrix();
 // neighbours peek in from the edges on a phone, and sit a little apart on wider screens
 const hw=TAN*cam.position.z*cam.aspect;gap=Math.min(Math.max(CW*1.08,hw+CW*.24),CW*1.3)}
const pxPer=()=>stage.clientHeight/(2*TAN*cam.position.z);
addEventListener('resize',size);
if(window.visualViewport){const vv=()=>{fitKeyboard();size();if(editing)place(editing)};visualViewport.addEventListener('resize',vv);visualViewport.addEventListener('scroll',vv)}
/* the carousel: pos glides toward target; st.d is the card in the middle */
let ry=0,rx=0,vy=0,vx=0,drag=false,mode=null,px=0,py=0,hx=0,hy=0,thx=0,thy=0,pos=0,target=0,pos0=0,sv=0,lx=0,lt=0,hidden=false;const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
canvas.addEventListener('pointerdown',e=>{e.preventDefault();vy=vx=0;drag=true;mode=null;px=dx0=lx=e.clientX;py=dy0=e.clientY;tt=lt=performance.now();pos0=pos;sv=0;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();if(!drag)canvas.style.cursor=hit(e.clientX,e.clientY)?'text':'';thx=((e.clientX-b.left)/b.width-.5);thy=((e.clientY-b.top)/b.height-.5);
 if(focused)thx=thy=0;if(!drag||focused)return;const dx=e.clientX-dx0,dy=e.clientY-dy0;
 // the first few pixels decide: sideways on the front browses cards, anything else spins the card
 if(!mode){if(Math.hypot(dx,dy)<8)return;mode=!onBack()&&Math.abs(dx)>Math.abs(dy)?'swipe':'spin';px=e.clientX;py=e.clientY;if(mode==='swipe'&&document.activeElement===ed)ed.blur()}
 if(mode==='swipe'){pos=pos0-dx/(gap*pxPer());const t=performance.now();sv=(lx-e.clientX)/(gap*pxPer())/Math.max(8,t-lt)*1000;lx=e.clientX;lt=t;return}
 vy=(e.clientX-px)*.011;vx=(e.clientY-py)*.007;ry+=vy;rx=Math.max(-.7,Math.min(.7,rx+vx));px=e.clientX;py=e.clientY});
const up=()=>drag=false;
canvas.addEventListener('pointerup',e=>{up();if(mode==='swipe'){const base=Math.round(pos0),fl=Math.abs(sv)>1.2?Math.sign(sv):0;choose(fl?base+fl:Math.round(pos))}
 else if(!mode&&performance.now()-tt<500)tap(e.clientX,e.clientY);mode=null});
canvas.addEventListener('pointercancel',()=>{up();if(mode==='swipe')choose(Math.round(pos));mode=null});canvas.addEventListener('pointerleave',()=>{thx=thy=0});
function choose(t){target=t;const i=((t%N)+N)%N;if(i===st.d)return;if(document.activeElement===ed)ed.blur();st.d=i;ry=rx=vy=0;Store.save({design:i});label()}
/* randomize: another design, new colours (now and then its own) and a fresh handful of stamps */
const pick=a=>a[Math.floor(Math.random()*a.length)],lum=h=>[1,3,5].reduce((s,k,j)=>s+[.3,.59,.11][j]*parseInt(h.slice(k,k+2),16)/255,0);
document.getElementById('shuffle').onclick=()=>{const step=1+Math.floor(Math.random()*(N-1));choose(Math.round(target)+step+(calm?0:N));
 // paper and ink far enough apart in lightness that the art still reads
 if(Math.random()<.2)st.paper=st.ink=null;else{const p=pick(INKS);st.paper=p.c;st.ink=pick(INKS.filter(n=>Math.abs(lum(n.c)-lum(p.c))>.2)).c}
 const spots=SPOTS.map((_,k)=>k).sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*SPOTS.length));
 st.stamps=spots.map(spot=>({i:Math.floor(Math.random()*STAMPS.length),spot}));
 Store.save({paper:st.paper,ink:st.ink,stamps:st.stamps});D.forEach((_,k)=>front(k));back();label()};
addEventListener('keydown',e=>{if(!writeOn||editing||onBack()||/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;if(e.key==='ArrowLeft')choose(Math.round(target)-1);if(e.key==='ArrowRight')choose(Math.round(target)+1)});
const nameEl=document.getElementById('cname'),hintEl=document.getElementById('hint');let hintTxt='';
function label(){nameEl.textContent=D[st.d].name;dispatchEvent(new Event('snaily:card'))}
let note=null,flipBack=null;const flipEl=document.getElementById('flip');flipEl.onclick=()=>{if(document.activeElement===ed)ed.blur();flipOver()};
/* momentum decays by .93 a frame, so it coasts vy/.07 in all: aim that at exactly the next half turn */
function flipOver(){vy=((Math.round(ry/Math.PI)+1)*Math.PI-ry)*.07;vx=0}
/* a short-lived line on the front, e.g. after picking a stamp */
function noteHint(s,ms=3200){note={s,until:performance.now()+ms}}
function hint(){const fb=onBack();if(fb!==flipBack){flipBack=fb;flipEl.querySelector('span').textContent=fb?'see the front':'write on the back'}
 const s=!onBack()?(note&&performance.now()<note.until?note.s:''):document.activeElement===ed?(st.txt?'tap next when you\'re done':'start typing your message…'):'tap the lines to start typing';
 if(s!==hintTxt){hintTxt=s;hintEl.textContent=s;if(!calm)hintEl.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'})}}
function tick(t){if(!writeOn){running=false;return}requestAnimationFrame(tick);
 const sb=settled()&&onBack();if(sb&&!editing&&!auto){auto=true;edit('txt')}if(!sb)auto=false;if(settled()&&!onBack()&&document.activeElement===ed)ed.blur();const bl=((t/530|0)&1)==0;if(document.activeElement===ed&&bl!==blink){blink=bl;back()}
 if(!drag){ry+=vy;vy*=.93;if(Math.abs(vy)<.012){const tg=Math.round(ry/Math.PI)*Math.PI;ry+=(tg-ry)*.09}rx+=(0-rx)*.07}
 if(mode!=='swipe')pos+=(target-pos)*(calm?1:.14);
 hx+=(thx-hx)*.1;hy+=(thy-hy)*.1;lift+=((drag&&mode==='spin'?1:0)-lift)*.15;
 const turn=Math.abs(Math.sin(ry/2));
 cards.forEach((c,i)=>{const d=((i-pos)%N+N*1.5)%N-N/2,a=Math.abs(d),k=Math.min(a,1),fade=a>1.2?Math.max(0,(2-a)/.8):1,mid=i===st.d;
  c.o.visible=fade>0&&!(mid&&hidden)&&(mid||!focused);
  // the middle card straightens up when it turns over, so the back reads level
  c.o.position.set(d*gap,mid?lift*.06:0,-k*.6);c.o.rotation.set(0,-d*.2,D[i].tilt*Math.PI/180*(mid?1-turn:1));c.o.scale.setScalar((1-.12*k)*fade*(mid?1+lift*.04:1));
  if(mid)c.f.rotation.set(rx+hy*.22*(1-k),ry+hx*.3*(1-k),0);else c.f.rotation.set(0,0,0);
  c.s.scale.x=Math.max(.12,Math.abs(Math.cos(c.f.rotation.y)));
  const g=1-.3*k;c.fm.color.setScalar(g);c.bm.color.setScalar(g)});
 if(peels.length){const now=performance.now();peels=peels.filter(q=>now-q.t0<PEEL);front(st.d)}
 hint();r.render(scene,cam)}
let dx0=0,dy0=0,tt=0,auto=false,blink=true,lift=0;
const ed=document.getElementById('ed'),v3=new THREE.Vector3();
const scr=(u,v)=>{v3.set((.5-u/W)*CW,(.5-v/H)*CH,-T/2);cards[st.d].f.localToWorld(v3);v3.project(cam);return[(v3.x+1)/2*stage.clientWidth,(1-v3.y)/2*stage.clientHeight]};
const settled=()=>!drag&&Math.abs(pos-target)<.01&&Math.abs(vy)<.012&&Math.abs(rx)<.03&&Math.abs(ry-Math.round(ry/Math.PI)*Math.PI)<.04;
const onBack=()=>Math.abs(Math.round(ry/Math.PI))%2==1;
const hit=(cx,cy)=>{if(!settled()||!onBack())return;const bb=canvas.getBoundingClientRect(),X=cx-bb.left,Y=cy-bb.top;for(const k in R){const g=R[k],[a,b2]=scr(g.x,g.y),[c,d]=scr(g.x+g.w,g.y+g.h);if(X>=a&&X<=c&&Y>=b2&&Y<=d)return k}};
function place(k){const g=R[k],[x0,y0]=scr(g.x,g.y),[x1,y1]=scr(g.x+g.w,g.y+g.h),s=(x1-x0)/g.w;
 Object.assign(ed.style,{display:'block',left:x0+'px',top:y0+'px',width:(x1-x0)+'px',height:(y1-y0)+'px',fontSize:Math.max(16,46*s)+'px',lineHeight:g.lh*s+'px'})}
function edit(k,user){if(user)setFocus(true);editing=k;ed.dataset.k=k;place(k);
 ed.value=st[k];ed.placeholder=k=='txt'?'dear you,':'';ed.maxLength=k=='txt'?400:60;
 ed.oninput=()=>{if(k=='to')ed.value=ed.value.split('\n').slice(0,2).join('\n');if(!focused)setFocus(true);st[k]=ed.value;Store.save(k=='to'?{to:ed.value}:{message:ed.value});blink=true;back()};
 ed.focus();ed.setSelectionRange(ed.value.length,ed.value.length);blink=true;back()}
ed.onblur=()=>{ed.style.display='none';editing=null;back()};ed.onkeydown=e=>{if(/^(Arrow|Home|End|Page)/.test(e.key))e.preventDefault()};
/* a tap on a peeking neighbour brings it to the middle; on the front a tap flips; on the back it picks a field */
function tap(cx,cy){if(!settled())return;const bb=canvas.getBoundingClientRect(),X=cx-bb.left,Y=cy-bb.top;
 if(!onBack()){const k=stampAt(cx,cy);if(k>=0)return peel((s,j)=>j===k);
  const xs=[[0,0],[W,0],[0,H],[W,H]].map(([u,v])=>scr(u,v)[0]);if(X<Math.min(...xs))return choose(Math.round(target)-1);if(X>Math.max(...xs))return choose(Math.round(target)+1);flipOver();return}
 for(const k in R){const g=R[k],[a,b2]=scr(g.x,g.y),[c,d]=scr(g.x+g.w,g.y+g.h);if(X>=a&&X<=c&&Y>=b2&&Y<=d)return edit(k,true)}}
let running=false,writeOn=false,ready=false;
function run(){if(!ready||!writeOn)return;size();if(!running){running=true;requestAnimationFrame(tick)}}
function setWrite(v){writeOn=v;if(v)run();else{if(document.activeElement===ed)ed.blur();setFocus(false,true)}}
/* writing: the card lifts into a focused view, big and centred, everything else steps away; the small X (or Esc) puts it back.
   The stage grows to fill the view, then a FLIP from the card's old spot on screen makes it look like the card itself grew */
let focused=false;const wView=document.getElementById('v-write'),wClose=document.getElementById('wClose');
const cardRect=()=>{const b=stage.getBoundingClientRect(),p=[[0,0],[W,0],[0,H],[W,H]].map(([u,v])=>scr(u,v)),xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);return{x:b.left+Math.min(...xs),y:b.top+Math.min(...ys),w:Math.max(...xs)-Math.min(...xs)}};
function setFocus(v,instant){if(v===focused)return;const was=ready&&!instant&&!calm?cardRect():null;
 focused=v;wView.classList.toggle('focused',v);if(!v)stage.style.bottom='';fitKeyboard();size();hx=hy=thx=thy=0;
 if(was){cam.updateMatrixWorld();const now=cardRect(),b=stage.getBoundingClientRect(),k=was.w/now.w;
  stage.animate([{transformOrigin:'0 0',transform:`translate(${was.x-b.left-k*(now.x-b.left)}px,${was.y-b.top-k*(now.y-b.top)}px) scale(${k})`},{transformOrigin:'0 0',transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}
 if(editing)place(editing)}
function closeFocus(){if(document.activeElement===ed)ed.blur();setFocus(false)}
wClose.onclick=closeFocus;
addEventListener('keydown',e=>{if(e.key==='Escape'&&focused){e.preventDefault();closeFocus()}});
/* with the on-screen keyboard up, the focused card fits in what's left above it */
function fitKeyboard(){const vv=window.visualViewport;if(!focused||!vv)return;const vr=wView.getBoundingClientRect(),top=vv.offsetTop+vv.height;
 stage.style.bottom=top<innerHeight-60?Math.max(0,vr.bottom-top+12)+'px':''}
function start(){Store.load().then(d=>{st.to=d.to||'';st.txt=d.message||'';st.d=D[d.design]?d.design:0;if(inkName(d.paper)&&inkName(d.ink)){st.paper=d.paper;st.ink=d.ink}// older drafts kept a single stamp + spot
 st.stamps=Array.isArray(d.stamps)?d.stamps.filter(s=>s&&STAMPS[s.i]&&SPOTS[s.spot]):[{i:STAMPS[d.stamp]?d.stamp:0,spot:SPOTS[d.spot]?d.spot:0}];pos=target=st.d;D.forEach((_,i)=>front(i));label();ready=true;back();run()})}
/* the front face, texture px → screen px inside the stage */
const scrF=(u,v)=>{v3.set((u/W-.5)*CW,(.5-v/H)*CH,T/2);cards[st.d].f.localToWorld(v3);v3.project(cam);return[(v3.x+1)/2*stage.clientWidth,(1-v3.y)/2*stage.clientHeight]};
/* which of st.stamps (index, or -1) is under this screen point on the middle card's front? the top one wins */
function stampAt(cx,cy){if(onBack())return-1;const bb=canvas.getBoundingClientRect(),X=cx-bb.left,Y=cy-bb.top;
 for(let k=st.stamps.length-1;k>=0;k--){const s=st.stamps[k],p=SPOTS[s.spot],[w,h]=stampSize(s.i,SB),[a,b]=scrF(p.x-w/2-20,p.y-h/2-20),[c,d]=scrF(p.x+w/2+20,p.y+h/2+20);
  if(X>=Math.min(a,c)&&X<=Math.max(a,c)&&Y>=Math.min(b,d)&&Y<=Math.max(b,d))return k}
 return-1}
/* for dragging a stamp onto the card (js/craft.js): spot centres in page px, the drop guides, and placing it */
function spotCentres(){const bb=canvas.getBoundingClientRect();return SPOTS.map(p=>{const[x,y]=scrF(p.x,p.y);return{x:bb.left+x,y:bb.top+y}})}
function stampGuides(on,hi=-1){if(on&&onBack())flipOver();const was=G;G=on?{hi}:null;if(on||was)front(st.d)}
/* one stamp per spot: without a spot it takes the first empty one (or swaps out the oldest); a drop takes the spot it lands on */
function placeStamp(i,spot){if(spot==null){spot=SPOTS.findIndex((_,k)=>!st.stamps.some(s=>s.spot===k));if(spot<0)spot=st.stamps[0].spot}
 st.stamps=st.stamps.filter(s=>s.spot!==spot).concat({i,spot});G=null;stampsChanged()}
/* peels off the stamps f(stamp,index) picks */
function peel(f){const now=performance.now();st.stamps=st.stamps.filter((s,k)=>{const off=f(s,k);if(off&&!calm)peels.push({i:s.i,spot:s.spot,t0:now});return!off});stampsChanged()}
/* a stamp coming off: its corner folds back along a diagonal (the flap is the stamp's paper back, mirrored across
   the fold), then what's left lifts away and fades. Drawn into the middle card's front each frame (see tick). */
let peels=[];const backs={},PEEL=560;
const halfPlane=(x,d,side)=>{const k=Math.SQRT1_2,L=2000,ax=d*k,ay=d*k;x.beginPath();x.moveTo(ax+L*k,ay-L*k);x.lineTo(ax-L*k,ay+L*k);
 x.lineTo(ax-L*k+side*L*k,ay+L*k+side*L*k);x.lineTo(ax+L*k+side*L*k,ay-L*k+side*L*k);x.closePath()};
function peeling(x,q){const t=Math.min(1,(performance.now()-q.t0)/PEEL),p=SPOTS[q.spot],m=SB,h=m/2,c=arts[q.i]||(arts[q.i]=stampArt(q.i,460,460));
 if(!backs[q.i]){const b=stampArt(q.i,460,460),g=b.getContext('2d');g.globalCompositeOperation='source-in';const gr=g.createLinearGradient(0,0,460,460);gr.addColorStop(0,'#efe6cc');gr.addColorStop(1,'#fbf6e6');g.fillStyle=gr;g.fillRect(0,0,460,460);backs[q.i]=b}
 const f=Math.min(1,t/.7),e=f*f*(3-2*f),d=h*Math.SQRT2*(1-1.7*e),lift=t>.55?(t-.55)/.45:0;
 x.save();x.translate(p.x,p.y-lift*40);x.rotate((p.deg-lift*10)*Math.PI/180);x.scale(1+lift*.08,1+lift*.08);x.globalAlpha=1-lift;
 // the part still stuck down
 x.save();halfPlane(x,d,-1);x.clip();x.shadowColor='rgba(43,16,12,.3)';x.shadowBlur=12;x.shadowOffsetY=5+lift*14;x.drawImage(c,-h,-h,m,m);x.restore();
 // the flap, folded back over it
 x.save();x.transform(0,-1,-1,0,Math.SQRT2*d,Math.SQRT2*d);halfPlane(x,d,1);x.clip();x.drawImage(backs[q.i],-h,-h,m,m);x.restore();
 x.restore()}
function stampsChanged(){Store.save({stamps:st.stamps});D.forEach((_,k)=>front(k));back();dispatchEvent(new Event('snaily:stamps'))}
/* for the send-to-envelope flight (js/send.js) */
function cardIdle(){return settled()}
function settleCard(){vy=0;if(document.activeElement===ed)ed.blur()}
function hideCard(v){hidden=v}
function cardShot(){
 const src=(onBack()?cb:cfs[st.d]).toDataURL('image/jpeg',.9),b=stage.getBoundingClientRect();
 const pts=[[0,0],[W,0],[0,H],[W,H]].map(([u,v])=>scr(u,v)),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 return{src,left:b.left+Math.min(...xs),top:b.top+Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)}}
img.onload=()=>Promise.all([document.fonts.load('40px "Instrument Serif"'),document.fonts.load('500 40px "EB Garamond"'),designsReady]).catch(()=>{}).then(start);img.src=SNAIL;
