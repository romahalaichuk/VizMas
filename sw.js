const CACHE_NAME = "masazysta-vizytowka-v1.0.0";
const urlsToCache = [
	"/",
	"index.html",
	"main.js",
	"manifest.json",
	"APPnG1000018783.png",
	"SRpNg5b777339.png",
	"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap",
	"https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.2.4/pixi.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js",
	"https://unpkg.com/splitting@1.0.6/dist/splitting.js",
	"https://unpkg.com/splitting@1.0.6/dist/splitting.css",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Opened cache");
			return cache.addAll(urlsToCache);
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
			// Return cached version or fetch from network
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
	if (event.tag === "background-sync") {
		event.waitUntil(doBackgroundSync());
	}
});

async function doBackgroundSync() {
	try {
		// Try to sync any pending data
		const cache = await caches.open(CACHE_NAME);
		// Add your sync logic here
		console.log("Background sync completed");
	} catch (error) {
		console.error("Background sync failed:", error);
	}
}

// Push notifications
self.addEventListener("push", (event) => {
	const options = {
		body: event.data ? event.data.text() : "Masz nową wiadomość od masażysty!",
		icon: "APPnG1000018783.png",
		badge: "APPnG1000018783.png",
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: "explore",
				title: "Zobacz wizytówkę",
				icon: "APPnG1000018783.png",
			},
			{
				action: "close",
				title: "Zamknij",
				icon: "APPnG1000018783.png",
			},
		],
	};

	event.waitUntil(
		self.registration.showNotification("Masażysta - Wizytówka", options)
	);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/"));
	}
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
	if (event.tag === "content-sync") {
		event.waitUntil(syncContent());
	}
});

async function syncContent() {
	try {
		// Update cached content periodically
		const cache = await caches.open(CACHE_NAME);
		console.log("Periodic sync completed");
	} catch (error) {
		console.error("Periodic sync failed:", error);
	}
}
