// 44JANGAL Service Worker: immer erst online die neueste Version holen (ohne Browser-Cache), offline aus dem Speicher
const C='44j-202610222231';
const CORE=['./','index.html','fbshim.js','manifest.json','firebase/firebase-app-compat.js','firebase/firebase-auth-compat.js','firebase/firebase-firestore-compat.js','icons/icon-192.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(res=>{if(res&&res.ok)return c.put(u,res)}).catch(()=>{})))).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 const same=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(!same&&!font)return;
 e.respondWith((async()=>{try{const res=await fetch(same?new Request(r.url,{cache:'no-store',credentials:'same-origin'}):r);
  if(res&&(res.ok||res.type==='opaque')&&!/version\.json/.test(u.pathname)){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res}
  catch(err){const m=(await caches.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?((await caches.match('index.html'))||(await caches.match('./'))):null);if(m)return m;throw err}})())});
