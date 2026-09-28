const CACHE_NAME = 'droga-wojownika-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './announcement.js',
  './data/announcement.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/*
  CONFIG: OGŁOSZENIE
  Wstrzykuje announcement.js do dokumentu bez zmieniania Twojego index.html.
  Dzięki temu obecne ręczne zmiany w index.html pozostają nietknięte.
*/
async function injectAnnouncementScript(response) {
  if (!response) return response;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const text = await response.text();
  const scriptTag = '<script src="./announcement.js?v=1"></script>';
  const output = text.includes('announcement.js')
    ? text
    : text.replace('</body>', `${scriptTag}\n</body>`);

  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(output, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /*
    announcement.json = NETWORK FIRST.
    Gdy zmienisz JSON na GitHubie, aplikacja pobierze najnowszą wersję.
    Jeśli użytkownik jest offline, użyje ostatniej zapisanej wersji.
  */
  if (
    url.origin === self.location.origin &&
    url.pathname.endsWith('/data/announcement.json')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put('./data/announcement.json', copy)
            );
          }
          return response;
        })
        .catch(() => caches.match('./data/announcement.json'))
    );
    return;
  }

  /*
    Plakaty także są NETWORK FIRST, więc możesz podmienić grafikę
    pod tą samą nazwą pliku i użytkownik dostanie świeżą wersję.
  */
  if (
    url.origin === self.location.origin &&
    url.pathname.includes('/assets/posters/')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /*
    Dla strony głównej pobieramy dokument i dokładamy announcement.js.
    index.html w repozytorium nie jest przez to nadpisywany.
  */
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith((async () => {
      let response;

      try {
        response = await fetch(event.request);
      } catch (error) {
        response = await caches.match('./index.html');
      }

      return injectAnnouncementScript(response);
    })());
    return;
  }

  // Pozostałe zasoby zachowują dotychczasowe zachowanie cache-first.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
