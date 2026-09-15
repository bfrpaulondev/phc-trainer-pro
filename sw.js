/* PHC Trainer Pro — service worker (offline-first) */
var CACHE = 'phc-trainer-v9';
var CDN = [
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1.11.11/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/antd@5.21.6/dist/antd.min.js',
  'https://cdn.jsdelivr.net/npm/antd@5.21.6/dist/reset.css',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.25.6/babel.min.js'
];
var SHELL = ['./', './index.html', './manifest.webmanifest',
  './assets/img/hero-pro.jpg', './assets/img/einstein-pro.jpg',
  './assets/audio/bemvindo.mp3',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-64.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(
        SHELL.concat(CDN).map(function (u) {
          return c.add(u).catch(function () { /* recurso opcional */ });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.host === 'openrouter.ai') return; /* IA: sempre rede, nunca cache */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () { return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        try {
          if (res && (res.ok || res.type === 'opaque')) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
        } catch (x) {}
        return res;
      }).catch(function () { return new Response('', { status: 503 }); });
    })
  );
});
