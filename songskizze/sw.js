// Songskizze – offline cache. VERSION is set by the build.
const VERSION = 'songskizze-0dceba56e8';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', ...["../samples/akustik/crashL.wav", "../samples/akustik/crashR.wav", "../samples/akustik/floor.wav", "../samples/akustik/hhc.wav", "../samples/akustik/hho.wav", "../samples/akustik/kick.wav", "../samples/akustik/ride.wav", "../samples/akustik/snare.wav", "../samples/akustik/tom1.wav", "../samples/akustik/tom2.wav", "../samples/perc/crashL.wav", "../samples/perc/crashR.wav", "../samples/perc/floor.wav", "../samples/perc/hhc.wav", "../samples/perc/hho.wav", "../samples/perc/kick.wav", "../samples/perc/ride.wav", "../samples/perc/snare.wav", "../samples/perc/tom1.wav", "../samples/perc/tom2.wav", "../samples/pop/crashL.wav", "../samples/pop/crashR.wav", "../samples/pop/floor.wav", "../samples/pop/hhc.wav", "../samples/pop/hho.wav", "../samples/pop/kick.wav", "../samples/pop/ride.wav", "../samples/pop/snare.wav", "../samples/pop/tom1.wav", "../samples/pop/tom2.wav", "../samples/rock/crashL.wav", "../samples/rock/crashR.wav", "../samples/rock/floor.wav", "../samples/rock/hhc.wav", "../samples/rock/hho.wav", "../samples/rock/kick.wav", "../samples/rock/ride.wav", "../samples/rock/snare.wav", "../samples/rock/tom1.wav", "../samples/rock/tom2.wav", "../samples/tr707/crashL.wav", "../samples/tr707/crashR.wav", "../samples/tr707/floor.wav", "../samples/tr707/hhc.wav", "../samples/tr707/hho.wav", "../samples/tr707/kick.wav", "../samples/tr707/ride.wav", "../samples/tr707/snare.wav", "../samples/tr707/tom1.wav", "../samples/tr707/tom2.wav", "../samples/tr808/crashL.wav", "../samples/tr808/crashR.wav", "../samples/tr808/floor.wav", "../samples/tr808/hhc.wav", "../samples/tr808/hho.wav", "../samples/tr808/kick.wav", "../samples/tr808/ride.wav", "../samples/tr808/snare.wav", "../samples/tr808/tom1.wav", "../samples/tr808/tom2.wav"]];
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
