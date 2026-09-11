const C='mc-v76';
const CORE=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>clients.claim()).then(()=>clients.matchAll({type:'window'})).then(cs=>cs.forEach(c=>c.postMessage({type:'mc-update'})))));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isStatic=/unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host);
  if(isStatic){
    // cache-first: libraries and fonts never change per URL
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})));
    return;
  }
  // network-first for app files, fallback to cache
  e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
