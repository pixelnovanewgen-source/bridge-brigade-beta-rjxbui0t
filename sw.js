/* Bridge Brigade — bêta web (stable) — service worker généré par tools/build-beta.mjs le 2026-10-14T12:24:04.857Z
   Cache : bb-beta-stable-0.8.0-3ffe70f-2026-10-14
   - index.html (navigation) : RÉSEAU D'ABORD (revalidé auprès du serveur), cache en secours hors ligne.
   - autres fichiers de ce dossier : cache d'abord, réseau sinon.
   - autres origines (polices Google…) : jamais interceptées ni mises en cache.
   - activation d'une nouvelle version : seulement sur message SKIP_WAITING envoyé par la page (bandeau RECHARGER),
     jamais en pleine partie. À l'activation, tous les autres caches bb-beta-* sont supprimés. */
'use strict';
const CANAL = "stable";
const BUILD = "0.8.0-3ffe70f-2026-10-14";
const GENERE = "2026-10-14T12:24:04.857Z";
const CACHE = "bb-beta-stable-0.8.0-3ffe70f-2026-10-14";
const BASE = new URL('./', self.location.href).href; // dossier de la bêta (celui de sw.js)
const PAGE = BASE + 'index.html';
const PRECACHE = ["index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-512-maskable.png","icon-180.png"];

self.addEventListener('install', (e) => {
  // pré-cache de la page, du manifeste et des icônes (réseau forcé : jamais une vieille copie du cache HTTP)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE.map((p) => new Request(BASE + p, { cache: 'reload' })))));
  // pas d'activation immédiate ici : c'est la page qui décide (message SKIP_WAITING), jamais pendant une partie
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((cles) => Promise.all(cles.filter((k) => k.indexOf('bb-beta-') === 0 && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  const d = e.data;
  const type = d && typeof d === 'object' ? d.type : d;
  if (type === 'SKIP_WAITING') self.skipWaiting();
  else if (type === 'BUILD' && e.ports && e.ports[0]) e.ports[0].postMessage({ canal: CANAL, build: BUILD, genere: GENERE });
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url.split('#')[0];
  if (url.indexOf(BASE) !== 0) return; // autre origine ou autre dossier : le navigateur fait comme d'habitude
  const sansParams = url.split('?')[0];
  const page = req.mode === 'navigate' || sansParams === PAGE || sansParams === BASE;
  if (page) {
    e.respondWith(fetch(sansParams === BASE ? PAGE : sansParams, { cache: 'no-cache', credentials: 'same-origin' })
      .then((res) => {
        if (res && res.ok) { const copie = res.clone(); caches.open(CACHE).then((c) => c.put(PAGE, copie)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(PAGE).then((r) => r || Response.error())));
    return;
  }
  e.respondWith(caches.match(sansParams).then((r) => r || fetch(req)));
});
