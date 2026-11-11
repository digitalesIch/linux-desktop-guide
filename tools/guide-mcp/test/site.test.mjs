import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Cache } from '../src/cache.mjs';
import { SiteClient } from '../src/site.mjs';

const baseUrl = 'https://example.com/guide/';

async function tempCache() {
	return new Cache({ directory: await mkdtemp(join(tmpdir(), 'guide-mcp-site-test-')) });
}

function makeFetch(handler) {
	const calls = [];
	const fetchImpl = async (url, options = {}) => {
		calls.push({ url: String(url), options });
		return handler(String(url), options, calls.length);
	};
	return { fetchImpl, calls };
}

function makeClient(fetchImpl, options = {}) {
	return new SiteClient({
		baseUrl,
		fetchImpl,
		retries: 0,
		retryDelayMs: 0,
		timeoutMs: 1000,
		...options,
	});
}

test('rejects URLs outside the configured origin and path', async () => {
	const client = makeClient(async () => new Response('no'));
	await assert.rejects(client.get('https://evil.example/guide/llms.txt'), (error) => error.code === 'SITE_NOT_ALLOWED');
	await assert.rejects(client.get('https://example.com/other/llms.txt'), (error) => error.code === 'SITE_NOT_ALLOWED');
});

test('serves a fresh cache entry without another request', async () => {
	const cache = await tempCache();
	const { fetchImpl, calls } = makeFetch(
		async () => new Response('hello', { headers: { etag: '"1"' } }),
	);
	const client = makeClient(fetchImpl, { cache });

	const first = await client.get('llms.txt', { ttlMs: 60_000 });
	const second = await client.get('llms.txt', { ttlMs: 60_000 });

	assert.equal(first.body, 'hello');
	assert.equal(second.body, 'hello');
	assert.equal(second.fromCache, true);
	assert.equal(second.stale, false);
	assert.equal(calls.length, 1);
	assert.match(calls[0].options.headers['user-agent'], /linux-desktop-guide-mcp/);
});

test('revalidates an expired entry with If-None-Match', async () => {
	const cache = await tempCache();
	let requests = 0;
	const { fetchImpl, calls } = makeFetch(async (url, options) => {
		requests += 1;
		if (requests === 1) return new Response('hello', { headers: { etag: '"1"' } });
		assert.equal(options.headers['if-none-match'], '"1"');
		return new Response(null, { status: 304, headers: { etag: '"1"' } });
	});
	const client = makeClient(fetchImpl, { cache });

	await client.get('llms.txt', { ttlMs: 0 });
	const second = await client.get('llms.txt', { ttlMs: 0 });

	assert.equal(second.body, 'hello');
	assert.equal(second.fromCache, true);
	assert.equal(second.stale, false);
	assert.equal(calls.length, 2);
});

test('returns stale content when the network fails', async () => {
	const cache = await tempCache();
	let requests = 0;
	const { fetchImpl } = makeFetch(async () => {
		requests += 1;
		if (requests === 1) return new Response('hello');
		throw new Error('offline');
	});
	const client = makeClient(fetchImpl, { cache });

	await client.get('llms.txt', { ttlMs: 0 });
	const second = await client.get('llms.txt', { ttlMs: 0 });

	assert.equal(second.body, 'hello');
	assert.equal(second.fromCache, true);
	assert.equal(second.stale, true);
	assert.match(second.error, /offline/);
});

test('fails clearly without network and without cache', async () => {
	const { fetchImpl } = makeFetch(async () => {
		throw new Error('offline');
	});
	const client = makeClient(fetchImpl);

	await assert.rejects(client.get('llms.txt'), (error) => error.code === 'NETWORK_ERROR');
});

test('treats 404 as definitive and never serves stale content', async () => {
	const cache = await tempCache();
	let requests = 0;
	const { fetchImpl } = makeFetch(async () => {
		requests += 1;
		if (requests === 1) return new Response('hello');
		return new Response('missing', { status: 404 });
	});
	const client = makeClient(fetchImpl, { cache });

	await client.get('llms.txt', { ttlMs: 0 });
	await assert.rejects(client.get('llms.txt', { ttlMs: 0 }), (error) => error.code === 'NOT_FOUND');
});

test('caps response size', async () => {
	const { fetchImpl } = makeFetch(async () => new Response('hello world'));
	const client = makeClient(fetchImpl, { maxBytes: 5 });
	await assert.rejects(client.get('llms.txt'), (error) => error.code === 'CONTENT_TOO_LARGE');
});

test('retries a 429 once and respects Retry-After', async () => {
	let requests = 0;
	const { fetchImpl, calls } = makeFetch(async () => {
		requests += 1;
		if (requests === 1) return new Response('slow down', { status: 429, headers: { 'retry-after': '0' } });
		return new Response('hello');
	});
	const client = makeClient(fetchImpl, { retries: 1 });

	const result = await client.get('llms.txt');
	assert.equal(result.body, 'hello');
	assert.equal(calls.length, 2);
});

test('follows redirects inside the guide and rejects external ones', async () => {
	const { fetchImpl } = makeFetch(async (url) => {
		if (url.endsWith('/llms.txt')) {
			return new Response(null, { status: 302, headers: { location: '/guide/llms-full.txt' } });
		}
		return new Response('full');
	});
	const client = makeClient(fetchImpl);
	assert.equal((await client.get('llms.txt')).body, 'full');

	const { fetchImpl: external } = makeFetch(
		async () => new Response(null, { status: 302, headers: { location: 'https://evil.example/x' } }),
	);
	await assert.rejects(
		makeClient(external).get('llms.txt'),
		(error) => error.code === 'SITE_NOT_ALLOWED',
	);
});

test('a cache write failure does not fail the request', async () => {
	const { fetchImpl } = makeFetch(async () => new Response('hello'));
	const cache = {
		read: async () => null,
		write: async () => {
			throw new Error('read-only cache');
		},
	};
	const client = makeClient(fetchImpl, { cache });
	const result = await client.get('llms.txt');
	assert.equal(result.body, 'hello');
	assert.equal(result.fromCache, false);
});

test('times out a hanging request', async () => {
	const fetchImpl = (_url, options) =>
		new Promise((_resolve, reject) => {
			options.signal.addEventListener('abort', () => {
				reject(new DOMException('Aborted', 'AbortError'));
			});
		});
	const client = makeClient(fetchImpl, { timeoutMs: 20 });
	await assert.rejects(client.get('llms.txt'), (error) => error.code === 'NETWORK_ERROR');
});
