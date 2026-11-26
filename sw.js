/* Seventh Trumpet — offline + cache (st-v5: network-first for JS) */
var CACHE = 'st-v11';
var PRECACHE = [
  '/',
  '/index.html',
  '/bible.html',
  '/media.html',
  '/css/style.css',
  '/css/menu.css',
  '/css/quality.css',
  '/js/menu.js?v=mobile-header-click-layer-20261126',
  '/js/app.js',
  '/js/app_core.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE).catch(function () {});
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === '/sw.js') {
    e.respondWith(fetch(req));
    return;
  }

  var isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') !== -1 ||
    /\.html$/.test(url.pathname) ||
    url.pathname === '/';

  var isStatic = /\.(js|css|woff2?|jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
    url.pathname.indexOf('/js/') === 0 ||
    url.pathname.indexOf('/css/') === 0 ||
    url.pathname.indexOf('/data/') === 0;

  if (isHTML) {
    e.respondWith(
      fetch(req).then(function (res) {
        try {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        } catch (err) {}
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match('/index.html');
        });
      })
    );
    return;
  }

  /* JS always network-first so ?v= cache-bust works */
  var isJS = /\.js$/i.test(url.pathname) || url.pathname.indexOf('/js/') === 0;
  if (isJS) {
    e.respondWith(
      fetch(req).then(function (res) {
        try {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        } catch (err) {}
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  if (isStatic) {
    e.respondWith(
      caches.match(req).then(function (cached) {
        var net = fetch(req).then(function (res) {
          try {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          } catch (err) {}
          return res;
        }).catch(function () { return cached; });
        return cached || net;
      })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(function (res) {
      try {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      } catch (err) {}
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
