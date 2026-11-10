import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { ASTRO_CONFIG_PATH, DOCS_ROOT } from '../lib/config.mjs';
import { DocsError } from '../lib/errors.mjs';
import { listPages, loadPages, normalizeSlug, pageResult, sourceSignature } from '../lib/pages.mjs';

const corpus = loadPages({ docsRoot: DOCS_ROOT, sidebarPath: ASTRO_CONFIG_PATH });

test('loads the guide pages and parses frontmatter', () => {
	assert.ok(corpus.pages.length >= 30, `expected at least 30 pages, got ${corpus.pages.length}`);
	assert.ok(corpus.bySlug.has('start/why-linux'));
	assert.ok(corpus.bySlug.has('platform/flatpak-portals'));
	assert.ok(corpus.bySlug.has('reference/glossary'));

	const page = corpus.bySlug.get('start/why-linux');
	assert.equal(page.title, 'Why Linux Is Different');
	assert.match(page.description, /GNOME, KDE/);
	assert.ok(page.body.includes('## The stack, from glass to app'));
	assert.ok(page.headings.some((heading) => heading.text === 'Where each concern lives'));
	assert.ok(page.wordCount > 500);
	assert.equal(page.section, 'start');
	assert.equal(page.sectionLabel, 'Start Here');
});

test('excludes the 404 page and keeps sidebar order', () => {
	assert.equal(corpus.bySlug.has('404'), false);
	assert.equal(corpus.pages.some((page) => page.slug === '404'), false);

	const startPages = corpus.pages.filter((page) => page.section === 'start').map((page) => page.slug);
	assert.deepEqual(startPages, [
		'start/why-linux',
		'start/choose-stack',
		'start/first-app',
		'start/native-standard',
	]);
});

test('resolves internal links to indexed slugs', () => {
	const page = corpus.bySlug.get('start/why-linux');
	assert.ok(page.links.includes('start/choose-stack'));
	assert.ok(page.links.includes('platform/wayland'));
	assert.ok(page.links.every((slug) => corpus.bySlug.has(slug)));
});

test('normalizes common slug forms', () => {
	for (const value of ['start/why-linux', '/start/why-linux', 'start/why-linux/', '/start/why-linux/', 'start/why-linux.md']) {
		assert.equal(normalizeSlug(value), 'start/why-linux');
	}
	assert.equal(normalizeSlug('docs://page/platform/xdg'), 'platform/xdg');
});

test('rejects traversal and absolute filesystem paths', () => {
	for (const value of ['../package.json', 'start/../package.json', '../src/content/docs/start/why-linux', '/etc/passwd', 'C:\\Windows\\win.ini', 'start/.hidden']) {
		assert.throws(() => normalizeSlug(value), DocsError, `expected ${value} to be rejected`);
	}
	assert.throws(() => normalizeSlug(''), DocsError);
	assert.throws(() => normalizeSlug('not-a-section/why-linux'), DocsError);
});

test('page results contain readable content and metadata', () => {
	const page = pageResult(corpus.bySlug.get('platform/xdg'));
	assert.equal(page.slug, 'platform/xdg');
	assert.equal(page.url, '/platform/xdg/');
	assert.equal(page.markdownPath, '/platform/xdg.md');
	assert.match(page.source, /^src\/content\/docs\//);
	assert.ok(page.content.includes('XDG'));
	assert.ok(page.headings.length > 0);
});

test('lists pages by section', () => {
	const all = listPages(corpus.pages);
	assert.equal(all.count, corpus.pages.length);
	assert.deepEqual(
		all.sections.map((section) => section.id),
		['targets', 'start', 'platform', 'design', 'engineering', 'ship', 'reference'],
	);

	const platform = listPages(corpus.pages, 'platform');
	assert.ok(platform.count >= 7);
	assert.ok(platform.sections.every((section) => section.id === 'platform'));
	assert.ok(platform.sections[0].pages.every((page) => page.url.startsWith('/platform/')));

	const reference = listPages(corpus.pages, 'reference');
	assert.match(reference.note, /get_baseline/);
});

test('rejects an unknown section', () => {
	assert.throws(() => listPages(corpus.pages, 'nope'), DocsError);
});

test('detects source changes and reloads the index', () => {
	const root = mkdtempSync(join('/tmp/opencode', 'docs-mcp-'));
	const file = join(root, 'start', 'one.md');

	try {
		mkdirSync(join(root, 'start'), { recursive: true });
		writeFileSync(file, '---\ntitle: One\ndescription: First version.\n---\n\nBody.\n');

		const before = sourceSignature(root);
		const initial = loadPages({ docsRoot: root });
		assert.equal(initial.pages.length, 1);
		assert.equal(initial.pages[0].title, 'One');

		writeFileSync(file, '---\ntitle: One\ndescription: Second version.\n---\n\nBody changed.\n');

		const after = sourceSignature(root);
		const reloaded = loadPages({ docsRoot: root });
		assert.notEqual(before, after);
		assert.equal(reloaded.pages[0].description, 'Second version.');
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
