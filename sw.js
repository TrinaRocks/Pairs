const CACHE_NAME = 'tables-pairs-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './images/panda.jpg',
  './images/bunny.jpg',
  './images/fox.jpg',
  './images/kitten.jpg',
  './images/puppy.jpg',
  './images/piglet.jpg',
  './images/chick_duckling.jpg',
  './images/lamb.jpg',
  './images/elephant.jpg',
  './images/goat.jpg',
  './images/rat.jpg',
  './images/hedgehog.jpg'
];

async function broadcast(msg){
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
  clientsList.forEach(c => c.postMessage(msg));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    let done = 0;
    for(const url of ASSETS){
      try {
        await cache.add(url);
      } catch(err){
        // one bad asset shouldn't block the rest of the offline pack
      }
      done++;
      await broadcast({ type: 'cache-progress', done, total: ASSETS.length });
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if(cached) return cached;

    try {
      const response = await fetch(event.request);
      if(response && response.ok && event.request.url.startsWith(self.location.origin)){
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch(err){
      return cached || Response.error();
    }
  })());
});
