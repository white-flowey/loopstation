// Songskizze – offline cache. VERSION is set by the build.
const VERSION = 'songskizze-1683f63382';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('songskizze-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  e.respondWith(isPage ? networkFirst(req) : cacheFirst(req));
});
async function networkFirst(req) {
  const c = await caches.open(VERSION);
  const net = fetch(req, {cache: 'no-store'}).then(r => { if (r && r.ok) c.put('./index.html', r.clone()); return r; });
  try { const r = await Promise.race([net, new Promise((_, rej) => setTimeout(rej, 3500))]); if (r && r.ok) return r; } catch (_) {}
  return (await c.match('./index.html')) || (await c.match(req)) || net.catch(() => Response.error());
}
async function cacheFirst(req) { const c = await caches.open(VERSION); const hit = await c.match(req, {ignoreSearch: true}); if (hit) return hit; const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
