/* Service worker — مكتبة الريماس
   يستبدل sw.js القديم. غيّر رقم النسخة عند كل تحديث كبير لإجبار المتصفحات على التحديث. */
const V='alremas-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.hostname==='firestore.googleapis.com')return;
  // صفحات الموقع: الشبكة أولاً (ليصل التحديث فوراً) ثم النسخة المخزنة عند انقطاع الإنترنت
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(ch=>ch.put(r,c))}return res})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')||caches.match('./'))));
    return;
  }
  // الخطوط ومكتبة Firebase: من الذاكرة مع تحديث في الخلفية
  if(/fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs/.test(r.url)){
    e.respondWith(caches.match(r).then(m=>{
      const f=fetch(r).then(res=>{caches.open(V).then(ch=>ch.put(r,res.clone()));return res}).catch(()=>m);
      return m||f;
    }));
  }
});
