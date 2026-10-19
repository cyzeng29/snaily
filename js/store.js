/* ---------- local draft storage (IndexedDB) ----------
   One open draft: the chosen postcard plus today's photos and captions.
   Photo bytes are stored as ArrayBuffers, not Blobs: WebKit rejects Blobs in
   IndexedDB in private mode. Everything stays on this device for now. */
const Store=(()=>{
 const MAX_PHOTOS=6,MAX_SIDE=1600,MAX_BYTES=40*1024*1024;
 let dbp=null,draft=null,timer=null;const urls=new Map();
 const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 function db(){
  if(!dbp)dbp=new Promise((res,rej)=>{const r=indexedDB.open('snaily',1);
   r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('drafts',{keyPath:'id'});d.createObjectStore('blobs',{keyPath:'id'})};
   r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}).catch(e=>{dbp=null;throw e});
  return dbp}
 const store=async(name,mode='readonly')=>(await db()).transaction(name,mode).objectStore(name);
 const id=p=>p+Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');
 const fresh=()=>{const now=new Date().toISOString();return{id:id('d_'),createdAt:now,updatedAt:now,design:0,paper:null,ink:null,stamps:[{i:0,spot:0}],to:'',message:'',photos:[]}};

 async function load(){
  if(draft)return draft;
  try{const all=await req((await store('drafts')).getAll());draft=all.filter(d=>!d.sentId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0]||fresh()}
  catch(e){draft=fresh()}
  return draft}
 async function flush(){clearTimeout(timer);timer=null;if(!draft)return;try{await req((await store('drafts','readwrite')).put(draft))}catch(e){}}
 function save(patch){if(!draft)return;Object.assign(draft,patch,{updatedAt:new Date().toISOString()});clearTimeout(timer);timer=setTimeout(flush,250)}

 /* photos: resize to at most 1600px and re-encode as JPEG (drops EXIF/GPS) */
 function decode(file){
  if(window.createImageBitmap)return createImageBitmap(file,{imageOrientation:'from-image'}).catch(()=>viaImg(file));
  return viaImg(file)}
 function viaImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();
  i.onload=()=>{URL.revokeObjectURL(u);res(i)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('unreadable'))};i.src=u})}
 async function prepare(file){
  if(file.type&&!file.type.startsWith('image/'))throw new Error("That file isn't a photo.");
  if(file.size>MAX_BYTES)throw new Error('That photo is too big (over 40 MB).');
  let bmp;try{bmp=await decode(file)}catch(e){throw new Error(/hei[cf]/i.test(file.type+file.name)?"This browser can't open HEIC photos. Try choosing it from your phone's photo library.":"That photo couldn't be opened.")}
  const w0=bmp.width,h0=bmp.height,s=Math.min(1,MAX_SIDE/Math.max(w0,h0)),w=Math.round(w0*s),h=Math.round(h0*s);
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(bmp,0,0,w,h);if(bmp.close)bmp.close();
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));
  if(!blob)throw new Error("That photo couldn't be prepared.");
  return{blob,w,h}}
 async function putPhoto(file){
  const{blob,w,h}=await prepare(file),blobId=id('b_');
  // read the bytes before opening the transaction: an await in between lets IndexedDB auto-commit it
  const data=await blob.arrayBuffer();
  try{await req((await store('blobs','readwrite')).put({id:blobId,type:blob.type,data}))}catch(e){console.warn('photo not saved',e)}
  urls.set(blobId,URL.createObjectURL(blob));
  return{id:id('p_'),blobId,w,h,caption:'',nudge:{x:0,y:0}}}
 async function url(blobId){
  if(urls.has(blobId))return urls.get(blobId);
  try{const r=await req((await store('blobs')).get(blobId));if(!r)return'';const u=URL.createObjectURL(new Blob([r.data],{type:r.type}));urls.set(blobId,u);return u}
  catch(e){return''}}
 async function dropBlob(blobId){try{await req((await store('blobs','readwrite')).delete(blobId))}catch(e){}if(urls.has(blobId)){URL.revokeObjectURL(urls.get(blobId));urls.delete(blobId)}}
 /* any finished image (a sent card's front, back and prints) kept on this device; returns its id */
 async function putBlob(blob){const blobId=id('b_'),data=await blob.arrayBuffer();
  await req((await store('blobs','readwrite')).put({id:blobId,type:blob.type,data}));return blobId}
 /* once sent: the draft is kept as a record holding exactly what went (front, back, prints, layout), the original
    photos' bytes go, and a fresh draft starts. `kept` is {front,back,prints:[blob],layout,to,sender,deliverAt} */
 async function finish(sentId,kept){if(!draft)return;const old=draft;
  // it's already posted by now, so a full disk only costs the archive its copy
  if(kept)try{const ids={front:await putBlob(kept.front),back:await putBlob(kept.back),prints:[]};for(const b of kept.prints)ids.prints.push(await putBlob(b));
   old.sent={...ids,layout:kept.layout,to:kept.to,sender:kept.sender,deliverAt:kept.deliverAt}}catch(e){console.warn('no archive copy',e)}
  old.sentId=sentId;old.updatedAt=new Date().toISOString();await flush();
  for(const p of old.photos)await dropBlob(p.blobId);old.photos=[];draft=old;await flush();draft=fresh();await flush()}
 /* what was kept of a sent postcard (see finish), or null */
 async function sentCard(sentId){try{const all=await req((await store('drafts')).getAll());const d=all.find(x=>x.sentId===sentId);return d&&d.sent||null}catch(e){return null}}
 /* postcards sent from / opened on this device, newest first (small: an id, link, dates and a thumbnail) */
 const list=k=>{try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}};
 const add=(k,item)=>{const l=list(k).filter(x=>x.id!==item.id);l.unshift(item);try{localStorage.setItem(k,JSON.stringify(l.slice(0,100)))}catch(e){}};
 addEventListener('pagehide',flush);
 return{MAX_PHOTOS,load,save,flush,putPhoto,url,dropBlob,finish,sentCard,get draft(){return draft},
  sent:()=>list('snaily-sent'),addSent:x=>add('snaily-sent',x),received:()=>list('snaily-received'),addReceived:x=>add('snaily-received',x)};
})();
