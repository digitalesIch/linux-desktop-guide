import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { Cache } from '../src/cache.mjs';

async function tempCache(options = {}) {
	const directory = await mkdtemp(join(tmpdir(), 'guide-mcp-cache-test-'));
	return { cache: new Cache({ directory, ...options }), directory };
}

test('writes and reads a cache entry', async () => {
	const { cache } = await tempCache();
	const url = 'https://example.com/guide/start/why-linux.md';
	const entry = {
		url,
		body: '# Why Linux',
		etag: '"abc"',
		contentType: 'text/markdown',
		fetchedAt: Date.now(),
	};

	assert.equal(await cache.read(url), null);
	assert.equal(await cache.write(url, entry), true);
	assert.deepEqual(await cache.read(url), entry);
});

test('treats corrupt and foreign entries as misses', async () => {
	const { cache, directory } = await tempCache();
	const url = 'https://example.com/guide/llms.txt';
	await writeFile(cache.entryPath(url), '{not json', 'utf8');
	assert.equal(await cache.read(url), null);

	await writeFile(
		cache.entryPath(url),
		JSON.stringify({ url: 'https://example.com/other', body: 'x', fetchedAt: Date.now() }),
		'utf8',
	);
	assert.equal(await cache.read(url), null);
	assert.ok(directory);
});

test('disabled cache neither reads nor writes', async () => {
	const { cache } = await tempCache({ enabled: false });
	const url = 'https://example.com/guide/llms.txt';
	assert.equal(await cache.write(url, { url, body: 'x', fetchedAt: Date.now() }), false);
	assert.equal(await cache.read(url), null);
});

test('refuses to write an invalid entry', async () => {
	const { cache } = await tempCache();
	const url = 'https://example.com/guide/llms.txt';
	await assert.rejects(cache.write(url, { url, body: 42, fetchedAt: Date.now() }), /invalid entry/);
});
