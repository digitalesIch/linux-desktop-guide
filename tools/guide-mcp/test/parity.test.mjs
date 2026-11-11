import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	json,
	makeTempCache,
	startFixtureServer,
	startServer,
} from './helpers.mjs';

const PAGE_FIELDS = [
	'slug',
	'title',
	'description',
	'section',
	'url',
	'markdownPath',
	'wordCount',
	'headings',
	'content',
];

test('guide exposes the same tool contract as the source server', async () => {
	const fixture = await startFixtureServer();
	let guide;
	let docs;

	try {
		guide = await startServer({ baseUrl: fixture.baseUrl, cacheDir: await makeTempCache() });
		docs = await startServer({
			entry: '../docs-mcp/server.mjs',
			baseUrl: fixture.baseUrl,
			cacheDir: await makeTempCache(),
		});
		const guideTools = (await guide.client.listTools()).tools.map((tool) => tool.name).sort();
		const docsTools = (await docs.client.listTools()).tools.map((tool) => tool.name).sort();
		assert.deepEqual(guideTools, docsTools);

		const guidePage = json(
			await guide.client.callTool({ name: 'get_page', arguments: { slug: 'start/why-linux' } }),
		);
		const docsPage = json(
			await docs.client.callTool({ name: 'get_page', arguments: { slug: 'start/why-linux' } }),
		);
		for (const field of PAGE_FIELDS) {
			assert.ok(field in guidePage, `guide get_page is missing ${field}`);
			assert.ok(field in docsPage, `docs get_page is missing ${field}`);
		}

		const guideList = json(await guide.client.callTool({ name: 'list_pages', arguments: {} }));
		const docsList = json(await docs.client.callTool({ name: 'list_pages', arguments: {} }));
		for (const payload of [guideList, docsList]) {
			assert.ok(typeof payload.count === 'number');
			assert.ok(Array.isArray(payload.sections));
			assert.ok(payload.sections[0].pages.every((page) => 'slug' in page && 'title' in page && 'url' in page));
		}

		const guideSearch = json(
			await guide.client.callTool({ name: 'search_docs', arguments: { query: 'flatpak', limit: 1 } }),
		);
		const docsSearch = json(
			await docs.client.callTool({ name: 'search_docs', arguments: { query: 'flatpak', limit: 1 } }),
		);
		for (const payload of [guideSearch, docsSearch]) {
			assert.ok(Array.isArray(payload.results));
			assert.ok(payload.results.every((entry) => 'slug' in entry && 'url' in entry && 'excerpt' in entry));
		}
	} finally {
		await guide?.close();
		await docs?.close();
		await fixture.close();
	}
});
