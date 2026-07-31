// Service worker voor Mijn Kalender
// Zorgt dat de app offline werkt en installeerbaar is (PWA).
// Verhoog CACHE_NAAM bij elke nieuwe versie van de app, zodat gebruikers de update krijgen.
const CACHE_NAAM = 'mijn-kalender-v1';

const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './favicon-64.png'
];

// Installatie: app-shell alvast in de cache zetten
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAAM).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activatie: oude caches van vorige versies opruimen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen
          .filter((naam) => naam !== CACHE_NAAM)
          .map((naam) => caches.delete(naam))
      )
    )
  );
  self.clients.claim();
});

// Ophalen: cache-first, met fallback naar het netwerk (en terug de cache bijwerken)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((gecached) => {
      const netwerkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const kopie = response.clone();
            caches.open(CACHE_NAAM).then((cache) => cache.put(event.request, kopie));
          }
          return response;
        })
        .catch(() => gecached);

      return gecached || netwerkFetch;
    })
  );
});
