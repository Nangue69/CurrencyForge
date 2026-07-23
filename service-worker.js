const CACHE_NAME = "currencyforge-v1.0.1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",

    "./CSS/styles.css",
    "./CSS/components/forge-select.css",

    "./js/app.js",
    "./js/api.js",
    "./js/converter.js",
    "./js/currencies.js",
    "./js/dom.js",
    "./js/favorites.js",
    "./js/history.js",
    "./js/i18n.js",
    "./js/settings.js",
    "./js/theme.js",
    "./js/ui.js",
    "./js/components/forge-select.js",

    "./assets/icons/currencyforge-logo.svg",
    "./assets/icons/favicon-32x32.png",
    "./assets/icons/icon-192x192.png",
    "./assets/icons/icon-512x512.png",


    "./img/flags/es.svg",
    "./img/flags/gb.svg",

    "./assets/screenshots/desktop.png",
    "./assets/screenshots/mobile.png"
];

/* ==========================================================
   INSTALACIÓN
========================================================== */

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

/* ==========================================================
   ACTIVACIÓN
========================================================== */

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter(
                            (cacheName) =>
                                cacheName !== CACHE_NAME
                        )
                        .map(
                            (cacheName) =>
                                caches.delete(cacheName)
                        )
                )
            )
            .then(() => self.clients.claim())
    );
});

/* ==========================================================
   PETICIONES
========================================================== */

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                if (
                    !networkResponse
                    || networkResponse.status !== 200
                    || networkResponse.type !== "basic"
                ) {
                    return networkResponse;
                }

                const responseToCache =
                    networkResponse.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(
                        event.request,
                        responseToCache
                    );
                });

                return networkResponse;
            });
        })
    );
});