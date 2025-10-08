const CACHE_NAME = "masazysta-vizytowka-v1.0.1";
const urlsToCache = [
	"index.html",
	"index.css",
	"main.js",
	"manifest.json",
	"APPnG1000018783.png",
	"SRpNg5b777339.png",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Opened cache");
			return Promise.all(
				urlsToCache.map((url) =>
					cache.add(url).catch((err) => {
						console.warn("Nie udało się dodać do cache:", url, err);
					})
				)
			);
		})
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});
