// Drumloop Station – offline cache. VERSION is set automatically by the build.
const VERSION = 'drumloop-d5b4f0e4a2';
const SAMPLES = ["./samples/akustik/crashL.wav", "./samples/akustik/crashR.wav", "./samples/akustik/floor.wav", "./samples/akustik/hhc.wav", "./samples/akustik/hho.wav", "./samples/akustik/kick.wav", "./samples/akustik/ride.wav", "./samples/akustik/snare.wav", "./samples/akustik/tom1.wav", "./samples/akustik/tom2.wav", "./samples/perc/crashL.wav", "./samples/perc/crashR.wav", "./samples/perc/floor.wav", "./samples/perc/hhc.wav", "./samples/perc/hho.wav", "./samples/perc/kick.wav", "./samples/perc/ride.wav", "./samples/perc/snare.wav", "./samples/perc/tom1.wav", "./samples/perc/tom2.wav", "./samples/tr707/crashL.wav", "./samples/tr707/crashR.wav", "./samples/tr707/floor.wav", "./samples/tr707/hhc.wav", "./samples/tr707/hho.wav", "./samples/tr707/kick.wav", "./samples/tr707/ride.wav", "./samples/tr707/snare.wav", "./samples/tr707/tom1.wav", "./samples/tr707/tom2.wav", "./samples/tr808/crashL.wav", "./samples/tr808/crashR.wav", "./samples/tr808/floor.wav", "./samples/tr808/hhc.wav", "./samples/tr808/hho.wav", "./samples/tr808/kick.wav", "./samples/tr808/ride.wav", "./samples/tr808/snare.wav", "./samples/tr808/tom1.wav", "./samples/tr808/tom2.wav"];
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', ...SAMPLES];

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
