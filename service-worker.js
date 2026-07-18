// Service worker minimal : met en cache la coquille de l'application
// (HTML, icônes) pour un chargement rapide et une installation possible.
// Les données passent toujours par le réseau (Google Drive, Google Identity) :
// aucune requête vers accounts.google.com ou googleapis.com n'est mise en cache.

const CACHE_NAME = 'caisse-hsk-smb-shell-v1';
const SCOPE = '/caisse-hsk-smb/';
const SHELL_FILES = [
  SCOPE,
  SCOPE + 'index.html',
  SCOPE + 'manifest.json',
  SCOPE + 'logo.png',
  SCOPE + 'icon-192.png',
  SCOPE + 'icon-512.png',
  SCOPE + 'privacy.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Jamais de cache pour Google (connexion, Drive API) : toujours le réseau.
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    return;
  }
  if (url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
