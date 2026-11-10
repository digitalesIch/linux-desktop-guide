// Linux Desktop Guide service worker.
// Bump CACHE_VERSION when the shell or cache strategy changes.
const CACHE_VERSION = 'ldg-v1';
const CORE = [
	'/',
	'/manifest.webmanifest',
	'/offline.html',
	'/favicon.svg',
	'/icons/icon-192.png',
	'/icons/icon-512.png',
	'/icons/icon-maskable-512.png',
	'/icons/apple-touch-icon.png',
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
	if (url.pathname === '/sw.js') return;

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
					const root = await caches.match('/');
					if (root) return root;
					return (await caches.match('/offline.html')) || Response.error();
				}
			})(),
		);
		return;
	}

	if (
		url.pathname.startsWith('/_astro/') ||
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
