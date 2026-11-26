const CACHE='silver-meats-v12';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // the till page: use the network when online (so updates arrive), fall back to the saved copy offline
  if(u.origin===location.origin&&(r.mode==='navigate'||u.pathname.endsWith('/index.html'))){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  // everything else (icons, fonts): saved copy first, then network
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit)));
});
