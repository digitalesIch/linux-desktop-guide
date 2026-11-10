import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ASTRO_CONFIG_PATH, DOCS_ROOT } from '../lib/config.mjs';
import { DocsError } from '../lib/errors.mjs';
import { loadPages } from '../lib/pages.mjs';
import { DocsSearch } from '../lib/search.mjs';

const corpus = loadPages({ docsRoot: DOCS_ROOT, sidebarPath: ASTRO_CONFIG_PATH });
const search = new DocsSearch(corpus.pages);

function topSlugs(query, options = {}) {
	return search.search({ query, ...options }).results.map((result) => result.slug);
}

test('finds the canonical page for a topic', () => {
	assert.equal(topSlugs('flatpak portals')[0], 'platform/flatpak-portals');
	assert.equal(topSlugs('accessibility keyboard')[0], 'design/accessibility');
	assert.equal(topSlugs('startup performance sysprof')[0], 'engineering/performance');
	assert.equal(topSlugs('wayland x11')[0], 'platform/wayland');
	assert.equal(topSlugs('reduce startup time')[0], 'engineering/performance');
	assert.equal(topSlugs('dbus notifications')[0], 'platform/integration');
	assert.equal(topSlugs('package my app')[0], 'platform/packaging');
});

test('returns metadata and an excerpt for every hit', () => {
	const response = search.search({ query: 'desktop portals', limit: 3 });
	assert.ok(response.results.length > 0);
	for (const result of response.results) {
		assert.ok(result.slug);
		assert.ok(result.title);
		assert.ok(result.section);
		assert.match(result.url, /^\/[a-z0-9/-]+\/$/);
		assert.ok(result.score > 0);
		assert.ok(result.excerpt.length > 0, `missing excerpt for ${result.slug}`);
	}
});

test('honors the result limit', () => {
	const response = search.search({ query: 'flatpak', limit: 2 });
	assert.ok(response.total >= 2);
	assert.equal(response.results.length, 2);
	assert.equal(response.returned, 2);
});

test('filters by section', () => {
	const response = search.search({ query: 'accessibility', section: 'design', limit: 10 });
	assert.ok(response.results.length > 0);
	assert.ok(response.results.every((result) => result.section === 'Design'));
});

test('matches pages that cover only part of a query', () => {
	const response = search.search({ query: 'flatpak quantum', limit: 5 });
	assert.ok(response.results.length > 0);
	assert.ok(response.results.some((result) => result.slug === 'platform/flatpak-portals'));
});

test('returns guidance when nothing matches', () => {
	const response = search.search({ query: 'zzzzzzzzzzzzzzzz' });
	assert.equal(response.total, 0);
	assert.equal(response.results.length, 0);
	assert.match(response.hint, /list_pages/);
});

test('points version questions at the baseline tool', () => {
	const response = search.search({ query: 'baseline versions' });
	assert.match(response.hint, /get_baseline/);
});

test('rejects empty and section-less queries clearly', () => {
	assert.throws(() => search.search({ query: '   ' }), DocsError);
	assert.throws(() => search.search({ query: 'flatpak', section: 'nope' }), DocsError);
});

test('suggests a page for a misspelled slug', () => {
	const suggestions = search.suggestSlugs('platform/waylnd');
	assert.ok(suggestions.includes('platform/wayland'), `got ${suggestions.join(', ')}`);
});
