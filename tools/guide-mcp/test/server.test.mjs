import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	json,
	makeTempCache,
	startFixtureServer,
	startServer,
	text,
} from './helpers.mjs';

async function withGuide(run, { cacheDir, env } = {}) {
	const fixture = await startFixtureServer();
	const directory = cacheDir ?? (await makeTempCache());
	const server = await startServer({ baseUrl: fixture.baseUrl, cacheDir: directory, env });
	try {
		return await run({ fixture, server, cacheDir: directory });
	} finally {
		await server.close();
		await fixture.close();
	}
}

test('lists exactly the five read-only tools and reports its source', async () => {
	await withGuide(async ({ fixture, server }) => {
		const { tools } = await server.client.listTools();
		assert.deepEqual(
			tools.map((tool) => tool.name).sort(),
			['get_baseline', 'get_page', 'get_related', 'list_pages', 'search_docs'],
		);
		for (const tool of tools) {
			assert.ok(tool.description, `missing description for ${tool.name}`);
			assert.equal(tool.annotations?.readOnlyHint, true, `missing readOnlyHint for ${tool.name}`);
		}
		assert.match(server.stderr(), new RegExp(`reading ${fixture.baseUrl}`));
	});
});

test('list_pages returns the published index with absolute URLs', async () => {
	await withGuide(async ({ fixture, server }) => {
		const payload = json(await server.client.callTool({ name: 'list_pages', arguments: {} }));

		assert.equal(payload.count, 3);
		assert.deepEqual(
			payload.sections.map((section) => section.id),
			['start', 'platform'],
		);
		assert.equal(payload.sections[0].pages[0].slug, 'start/why-linux');
		assert.ok(payload.sections[0].pages[0].url.startsWith(fixture.baseUrl));
		assert.match(payload.order, /alphabetical/);
		assert.equal(payload.stale, false);
		assert.ok(payload.fetchedAt);
	});
});

test('get_page accepts common slug forms', async () => {
	await withGuide(async ({ fixture, server }) => {
		for (const slug of ['start/why-linux', '/start/why-linux/', 'start/why-linux.md']) {
			const payload = json(await server.client.callTool({ name: 'get_page', arguments: { slug } }));
			assert.equal(payload.slug, 'start/why-linux');
			assert.equal(payload.title, 'Why Linux Is Different');
			assert.match(payload.content, /Linux is not a product/);
			assert.ok(payload.url.startsWith(fixture.baseUrl));
			assert.ok(payload.markdownPath.endsWith('/start/why-linux.md'));
			assert.ok(payload.headings.length > 0);
			assert.equal(payload.stale, false);
		}
	});
});

test('get_page rejects traversal and unknown slugs', async () => {
	await withGuide(async ({ fixture, server }) => {
		const before = fixture.requests.length;
		const traversal = await server.client.callTool({
			name: 'get_page',
			arguments: { slug: '../package.json' },
		});
		assert.equal(traversal.isError, true);
		assert.match(text(traversal), /Invalid page slug/);
		assert.equal(fixture.requests.length, before, 'traversal must not reach the network');

		const unknown = await server.client.callTool({
			name: 'get_page',
			arguments: { slug: 'platform/waylnd' },
		});
		assert.equal(unknown.isError, true);
		assert.match(text(unknown), /Unknown page/);
		assert.match(text(unknown), /list_pages/);
	});
});

test('get_page points the baseline page at get_baseline', async () => {
	await withGuide(async ({ server }) => {
		const result = await server.client.callTool({
			name: 'get_page',
			arguments: { slug: 'reference/baseline' },
		});
		assert.equal(result.isError, true);
		assert.match(text(result), /get_baseline/);
	});
});

test('search_docs ranks published pages and filters by section', async () => {
	await withGuide(async ({ server }) => {
		const payload = json(
			await server.client.callTool({
				name: 'search_docs',
				arguments: { query: 'flatpak portals', limit: 3 },
			}),
		);
		assert.equal(payload.results[0].slug, 'platform/flatpak-portals');
		assert.ok(payload.results[0].excerpt.length > 0);
		assert.ok(payload.results[0].headings.length > 0);
		assert.equal(payload.stale, false);

		const filtered = json(
			await server.client.callTool({
				name: 'search_docs',
				arguments: { query: 'target', section: 'start', limit: 5 },
			}),
		);
		assert.ok(filtered.results.length > 0);
		assert.ok(filtered.results.every((entry) => entry.section === 'Start Here'));
	});
});

test('get_related excludes the source page and explains each result', async () => {
	await withGuide(async ({ server }) => {
		const payload = json(
			await server.client.callTool({
				name: 'get_related',
				arguments: { slug: 'platform/flatpak-portals', limit: 5 },
			}),
		);
		assert.equal(payload.slug, 'platform/flatpak-portals');
		assert.ok(payload.related.length > 0);
		assert.ok(payload.related.every((entry) => entry.slug !== 'platform/flatpak-portals'));
		assert.ok(payload.related.every((entry) => entry.reason.length > 0));
		assert.ok(payload.related.every((entry) => entry.url.startsWith('http://127.0.0.1')));
	});
});

test('get_baseline returns the published JSON object', async () => {
	await withGuide(async ({ server }) => {
		const payload = json(await server.client.callTool({ name: 'get_baseline', arguments: {} }));
		assert.equal(payload.ubuntu.release, '26.04 LTS');
		assert.equal(payload.desktop.gtk, '4.22');
		assert.equal(payload.qt.version, '6.10.2');
		assert.equal(payload.packaging.flatpak_runtime, 'org.gnome.Platform//50');
		assert.equal(payload.stale, false);
	});
});

test('returns stale content after the site goes offline', async () => {
	const fixture = await startFixtureServer();
	const cacheDir = await makeTempCache();
	const first = await startServer({ baseUrl: fixture.baseUrl, cacheDir });
	try {
		const payload = json(await first.client.callTool({ name: 'list_pages', arguments: {} }));
		assert.equal(payload.stale, false);
	} finally {
		await first.close();
	}
	await fixture.close();

	const second = await startServer({
		baseUrl: fixture.baseUrl,
		cacheDir,
		env: { LDG_CACHE_TTL_MS: '0' },
	});
	try {
		const payload = json(await second.client.callTool({ name: 'list_pages', arguments: {} }));
		assert.equal(payload.count, 3);
		assert.equal(payload.stale, true);
		assert.ok(payload.fetchedAt);
		assert.ok(payload.staleReason);
	} finally {
		await second.close();
	}
});

test('fails clearly with a cold cache and no network', async () => {
	const fixture = await startFixtureServer();
	const baseUrl = fixture.baseUrl;
	await fixture.close();

	const server = await startServer({ baseUrl, cacheDir: await makeTempCache() });
	try {
		const result = await server.client.callTool({ name: 'list_pages', arguments: {} });
		assert.equal(result.isError, true);
		assert.match(text(result), /Could not reach/);
		assert.match(text(result), /llms\.txt/);
	} finally {
		await server.close();
	}
});
