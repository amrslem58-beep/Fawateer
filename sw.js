// فواتير اليوم — استقبال الصور من زرار "مشاركة" في الأندرويد
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'POST') return;
  const u = new URL(r.url);
  if (!u.searchParams.has('share')) return;
  e.respondWith((async () => {
    try {
      const fd = await r.formData();
      const files = fd.getAll('photos').filter(f => f && f.size);
      const c = await caches.open('share-inbox');
      for (const k of await c.keys()) await c.delete(k);
      let i = 0;
      for (const f of files) {
        await c.put(new URL('./shared/' + (i++), self.registration.scope).href,
          new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } }));
      }
    } catch (_) {}
    return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
  })());
});
