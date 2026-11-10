import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createDocsApi, DocsError } from '../src/core.mjs';

const corpus = JSON.parse(readFileSync(new URL('../src/generated/docs.json', import.meta.url), 'utf8'));
const api = createDocsApi(corpus.pages, corpus.baseline);

test('searches return the expected top pages', () => {
	const flatpak = api.searchDocs({ query: 'flatpak portal', limit: 5 });
	assert.equal(flatpak.results[0].slug, 'platform/flatpak-portals');
	assert.ok(flatpak.results[0].excerpt.length > 0);
	assert.ok(flatpak.results[0].headings.length > 0);

	const wayland = api.searchDocs({ query: 'wayland screen capture', limit: 5 });
	assert.equal(wayland.results[0].slug, 'platform/wayland');

	const appstream = api.searchDocs({ query: 'appstream metadata', limit: 5 });
	assert.equal(appstream.results[0].slug, 'ship/appstream');
});

test('get_page accepts common slug forms', () => {
	const canonical = api.getPage('start/why-linux');
	for (const input of ['/start/why-linux', 'start/why-linux/', '/start/why-linux/', 'start/why-linux.md']) {
		assert.deepEqual(api.getPage(input), canonical, input);
	}
	assert.equal(canonical.title, 'Why Linux Is Different');
	assert.equal(canonical.url, '/start/why-linux/');
	assert.equal(canonical.markdownPath, '/start/why-linux.md');
	assert.ok(canonical.content.includes('Linux'));
	assert.ok(canonical.headings.length > 0);
});

test('get_page returns the pages used by the site', () => {
	for (const slug of ['platform/wayland', 'ship/documentation', 'reference/feedback']) {
		const page = api.getPage(slug);
		assert.equal(page.slug, slug);
		assert.ok(page.content.length > 100);
		assert.ok(page.wordCount > 100);
	}
});

test('rejects unsafe slugs', () => {
	for (const value of ['../package.json', 'start/../package.json', '/etc/passwd', 'C:\\Windows\\win.ini']) {
		assert.throws(() => api.getPage(value), DocsError, value);
	}
	assert.throws(() => api.normalizeSlug(''), DocsError);
	assert.throws(() => api.normalizeSlug('not-a-section/why-linux'), DocsError);
});

test('suggests a close page for a typo', () => {
	assert.throws(
		() => api.getPage('start/why-linx'),
		(error) => error instanceof DocsError && /start\/why-linux/.test(error.message),
	);
});

test('list_pages groups by section', () => {
	const all = api.listPages();
	assert.equal(all.count, corpus.pageCount);
	assert.deepEqual(
		all.sections.map((section) => section.id),
		['targets', 'start', 'platform', 'design', 'engineering', 'ship', 'reference'],
	);
	assert.ok(all.sections.every((section) => section.pages.every((page) => page.url.startsWith('/'))));

	const platform = api.listPages({ section: 'platform' });
	assert.ok(platform.count >= 7);
	assert.ok(platform.sections.every((section) => section.id === 'platform'));
});

test('get_related excludes the source page and explains each result', () => {
	const result = api.getRelated('platform/xdg', 5);
	assert.equal(result.slug, 'platform/xdg');
	assert.ok(result.related.length > 0);
	assert.ok(result.related.every((entry) => entry.slug !== 'platform/xdg'));
	assert.ok(result.related.every((entry) => entry.reason.length > 0));
});

test('baseline matches the generated corpus', () => {
	assert.deepEqual(api.getBaseline(), corpus.baseline);
});
