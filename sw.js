// Cliptic Service Worker – Caches essential assets for offline use
const CACHE_NAME = 'cliptic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  'https://cliptic-backend-2.onrender.com/'
];

// Install event – cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event – serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip API calls – don't cache dynamic backend requests
  if (event.request.url.includes('/api/') || 
      (event.request.url.includes('cliptic-backend-2.onrender.com') &&
       !event.request.url.endsWith('/'))) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
