import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { PROJECT_ROOT } from '../lib/config.mjs';

let client;
let transport;
let stderr = '';

before(async () => {
	transport = new StdioClientTransport({
		command: process.execPath,
		args: ['tools/docs-mcp/server.mjs'],
		cwd: PROJECT_ROOT,
		stderr: 'pipe',
	});
	transport.stderr?.on('data', (chunk) => {
		stderr += chunk.toString();
	});

	client = new Client({ name: 'docs-mcp-test', version: '1.0.0' });
	await client.connect(transport);
});

after(async () => {
	await client?.close();
});

function text(result) {
	assert.equal(result.content?.[0]?.type, 'text', `unexpected content: ${JSON.stringify(result)}`);
	return result.content[0].text;
}

function json(result) {
	return JSON.parse(text(result));
}

test('lists exactly the five read-only documentation tools', async () => {
	const { tools } = await client.listTools();
	assert.deepEqual(
		tools.map((tool) => tool.name).sort(),
		['get_baseline', 'get_page', 'get_related', 'list_pages', 'search_docs'],
	);

	for (const tool of tools) {
		assert.ok(tool.description, `missing description for ${tool.name}`);
		assert.equal(tool.annotations?.readOnlyHint, true, `missing readOnlyHint for ${tool.name}`);
	}

	assert.match(stderr, /indexed \d+ pages/, 'server did not report its index on stderr');
});

test('search_docs returns ranked pages with excerpts', async () => {
	const result = await client.callTool({
		name: 'search_docs',
		arguments: { query: 'flatpak portals', limit: 3 },
	});
	const payload = json(result);
	assert.equal(payload.query, 'flatpak portals');
	assert.ok(payload.results.length > 0);
	assert.equal(payload.results[0].slug, 'platform/flatpak-portals');
	assert.ok(payload.results[0].excerpt.length > 0);
	assert.ok(payload.results[0].headings.length > 0);
});

test('search_docs filters by section', async () => {
	const result = await client.callTool({
		name: 'search_docs',
		arguments: { query: 'accessibility', section: 'design', limit: 5 },
	});
	const payload = json(result);
	assert.ok(payload.results.length > 0);
	assert.ok(payload.results.every((entry) => entry.section === 'Design'));
});

test('get_page accepts common slug forms', async () => {
	for (const slug of ['start/why-linux', '/start/why-linux/', 'start/why-linux.md']) {
		const result = await client.callTool({ name: 'get_page', arguments: { slug } });
		const payload = json(result);
		assert.equal(payload.slug, 'start/why-linux');
		assert.equal(payload.url, '/start/why-linux/');
		assert.match(payload.content, /Linux is not a product/);
		assert.ok(payload.headings.length > 0);
	}
});

test('get_page rejects path traversal', async () => {
	const result = await client.callTool({
		name: 'get_page',
		arguments: { slug: '../package.json' },
	});
	assert.equal(result.isError, true);
	assert.match(text(result), /Invalid page slug/);
	assert.doesNotMatch(text(result), /"name": "linux-desktop-guide"/);
});

test('get_page suggests alternatives for an unknown slug', async () => {
	const result = await client.callTool({
		name: 'get_page',
		arguments: { slug: 'platform/waylnd' },
	});
	assert.equal(result.isError, true);
	assert.match(text(result), /Unknown page/);
	assert.match(text(result), /platform\/wayland/);
});

test('get_page points the baseline page at get_baseline', async () => {
	const result = await client.callTool({
		name: 'get_page',
		arguments: { slug: 'reference/baseline' },
	});
	assert.equal(result.isError, true);
	assert.match(text(result), /get_baseline/);
});

test('list_pages returns the table of contents', async () => {
	const result = await client.callTool({ name: 'list_pages', arguments: {} });
	const payload = json(result);
	assert.ok(payload.count >= 30);
	assert.deepEqual(
		payload.sections.map((section) => section.id),
		['start', 'platform', 'design', 'engineering', 'ship', 'reference'],
	);
	assert.ok(payload.sections[0].pages[0].slug === 'start/why-linux');
});

test('get_related recommends other pages', async () => {
	const result = await client.callTool({
		name: 'get_related',
		arguments: { slug: 'platform/flatpak-portals', limit: 5 },
	});
	const payload = json(result);
	assert.equal(payload.slug, 'platform/flatpak-portals');
	assert.ok(payload.related.length > 0);
	assert.ok(payload.related.every((entry) => entry.slug !== 'platform/flatpak-portals'));
	assert.ok(payload.related.every((entry) => entry.reason.length > 0));
});

test('get_baseline returns the JSON source of truth', async () => {
	const result = await client.callTool({ name: 'get_baseline', arguments: {} });
	const payload = json(result);
	assert.equal(payload.ubuntu.release, '26.04 LTS');
	assert.equal(payload.desktop.gtk, '4.22');
	assert.equal(payload.qt.version, '6.10.2');
	assert.equal(payload.packaging.flatpak_runtime, 'org.gnome.Platform//50');
});
