import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ASTRO_CONFIG_PATH, DOCS_ROOT } from '../lib/config.mjs';
import { DocsError } from '../../docs-core/errors.mjs';
import { loadPages } from '../lib/pages.mjs';
import { DocsRelated } from '../../docs-core/related.mjs';

const corpus = loadPages({ docsRoot: DOCS_ROOT, sidebarPath: ASTRO_CONFIG_PATH });
const related = new DocsRelated(corpus.pages);

test('returns related pages without the source page', () => {
	const response = related.forPage(corpus.bySlug.get('platform/flatpak-portals'), 5);
	assert.equal(response.slug, 'platform/flatpak-portals');
	assert.ok(response.related.length > 0);
	assert.ok(response.related.length <= 5);
	assert.ok(response.related.every((entry) => entry.slug !== 'platform/flatpak-portals'));
	assert.ok(response.related.every((entry) => entry.reason.length > 0));
});

test('ranks scores in descending order', () => {
	const response = related.forPage(corpus.bySlug.get('start/why-linux'), 6);
	const scores = response.related.map((entry) => entry.score);
	assert.deepEqual(scores, [...scores].sort((left, right) => right - left));
});

test('uses internal links and section context', () => {
	const response = related.forPage(corpus.bySlug.get('platform/flatpak-portals'), 8);
	const slugs = response.related.map((entry) => entry.slug);
	assert.ok(
		slugs.some((slug) => ['platform/packaging', 'platform/xdg', 'platform/integration'].includes(slug)),
		`got ${slugs.join(', ')}`,
	);
	assert.ok(
		response.related.some((entry) => entry.reason.startsWith('Same section: Platform')),
		`reasons: ${response.related.map((entry) => entry.reason).join(' | ')}`,
	);
});

test('rejects a missing page', () => {
	assert.throws(() => related.forPage(null), DocsError);
});
