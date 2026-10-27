// Drumloop Station – offline cache. VERSION is set automatically by the build.
const VERSION = 'drumloop-614493b6a4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  e.respondWith(isPage ? networkFirst(req) : cacheFirst(req));
});
// page: try the network briefly (gets updates right away), fall back to the stored copy offline
async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const r = await Promise.race([fetch(req, {cache: 'no-store'}), new Promise((_, rej) => setTimeout(rej, 2500))]);
    if (r && r.ok) { c.put('./index.html', r.clone()); return r; }
  } catch (_) {}
  return (await c.match('./index.html')) || (await c.match(req)) || Response.error();
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req, {ignoreSearch: true});
  if (hit) return hit;
  const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
}
