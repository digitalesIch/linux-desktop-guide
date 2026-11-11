// Linux Desktop Guide service worker.
// Bump CACHE_VERSION when the shell or cache strategy changes.
const CACHE_VERSION = 'ldg-v3';
const SCOPE = self.registration.scope;
const BASE = new URL(SCOPE).pathname;
const CORE = [
	BASE,
	`${BASE}manifest.webmanifest`,
	`${BASE}offline.html`,
	`${BASE}favicon.svg`,
	`${BASE}icons/icon-192.png`,
	`${BASE}icons/icon-512.png`,
	`${BASE}icons/icon-maskable-512.png`,
	`${BASE}icons/apple-touch-icon.png`,
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_VERSION)
			.then((cache) => cache.addAll(CORE))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('message', (event) => {
	if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isCacheable(response) {
	return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

async function cachePut(request, response) {
	if (!isCacheable(response)) return;
	try {
		const cache = await caches.open(CACHE_VERSION);
		await cache.put(request, response.clone());
	} catch {
		// A full or unavailable cache must not break the network response.
	}
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (url.pathname === `${BASE}sw.js`) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			(async () => {
				try {
					const response = await fetch(request);
					await cachePut(request, response);
					return response;
				} catch {
					const cached = await caches.match(request);
					if (cached) return cached;
					const root = await caches.match(BASE);
					if (root) return root;
					return (await caches.match(`${BASE}offline.html`)) || Response.error();
				}
			})(),
		);
		return;
	}

	if (
		url.pathname.startsWith(`${BASE}_astro/`) ||
		/\.(?:css|js|svg|png|jpe?g|webp|ico|woff2?)$/i.test(url.pathname)
	) {
		event.respondWith(
			(async () => {
				const cached = await caches.match(request);
				if (cached) return cached;
				const response = await fetch(request);
				await cachePut(request, response);
				return response;
			})(),
		);
	}
});
