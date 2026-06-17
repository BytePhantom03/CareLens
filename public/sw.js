// This file exists to satisfy cached service worker requests.
// It immediately unregisters any old service workers to prevent stale cache issues.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister();
  self.clients.matchAll().then(clients => clients.forEach(c => c.navigate(c.url)));
});
