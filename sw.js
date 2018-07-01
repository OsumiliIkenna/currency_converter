//Open and Cache files.
//Confirming if all required files are cached

let CACHE_NAME = 'currency-converter-v2';
let allUrlsCaches = [
    '/',
    '/index.html',
    '/index.js',
    '/index.css',
    '/idb.js',
    'https://code.jquery.com/jquery-3.3.1.min.js',
    'https://fonts.googleapis.com/css?family=Coda',
    'http://www.apilayer.net/api/live?access_key=81114525181954e239c08ff2ea960d53&format=1'
];

self.addEventListener('install', (event) => {
    console.log("[SW] Installed!!!");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(allUrlsCaches);
        })
    );
});

//Cache and return requests

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('currency-') &&
                        cacheName != CACHE_NAME;
                }).map((cacheName) => {
                    console.log("[SW] Removing cached files from ", cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('[SW] fetch SW....', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log("[SW] found in catch", event.request.url);
                return response;
            }
            return fetch(event.request);

            let cloneReq = event.request.clone();

            return fetch(cloneReq).then((response) => {
                    if (!response || response.status !== 200 || response.status !== 404 || response.type !== 'basic') {
                        console.log("[SW] there is no response", event.request.url);
                        return response;
                    }

                    let cloneRes = response.clone();

                    caches.open(CACHE_NAME).then(function(cache) {
                        console.log("[SW] Cloned Cache", event.request + "Clone: " + cloneRes);
                        cache.put(event.request, cloneRes);
                    });

                    return response;

                })
                .catch((err) => {
                    console.log("[SW] We observed error catching your file", err);
                });
        })
    );

});