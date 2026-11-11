import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	parseBaseline,
	parseFullText,
	parseManifest,
	parsePage,
	slugFromUrl,
} from '../src/corpus.mjs';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const baseUrl = 'https://example.com/guide/';

async function fixture(name) {
	return (await readFile(join(fixtures, name), 'utf8')).replaceAll('__BASE__', baseUrl);
}

test('parses the published manifest and skips the optional block', async () => {
	const { pages, bySlug } = parseManifest(await fixture('llms.txt'), baseUrl);

	assert.deepEqual(
		pages.map((page) => page.slug),
		['start/why-linux', 'start/choose-stack', 'platform/flatpak-portals'],
	);
	assert.deepEqual(
		[pages[0].section, pages[2].section],
		['start', 'platform'],
	);
	assert.equal(pages[0].url, 'https://example.com/guide/start/why-linux/');
	assert.equal(pages[0].markdownUrl, 'https://example.com/guide/start/why-linux.md');
	assert.equal(pages[0].description, 'A fixture page about Linux contracts.');
	assert.equal(bySlug.size, 3);
	assert.equal(bySlug.has('reference/baseline'), false);
});

test('splits the published full text and resolves internal links', async () => {
	const { pages, bySlug } = parseFullText(
		await fixture('llms-full.txt'),
		baseUrl,
		new Set(['start/why-linux', 'start/choose-stack', 'platform/flatpak-portals']),
	);

	assert.equal(pages.length, 3);
	const why = bySlug.get('start/why-linux');
	const flatpak = bySlug.get('platform/flatpak-portals');

	assert.equal(why.title, 'Why Linux Is Different');
	assert.equal(why.description, 'A fixture page about Linux contracts.');
	assert.match(why.body, /Linux is not a product/);
	assert.doesNotMatch(why.body, /^# Why Linux Is Different/);
	assert.deepEqual(why.links, ['platform/flatpak-portals']);
	assert.deepEqual(flatpak.links, ['start/why-linux']);
	assert.equal(flatpak.url, 'https://example.com/guide/platform/flatpak-portals/');
	assert.ok(flatpak.headings.some((heading) => heading.text === 'Portals you will use'));
});

test('parses a published page without the duplicated heading and summary', async () => {
	const page = parsePage(await fixture('start/why-linux.md'), 'start/why-linux', baseUrl);

	assert.equal(page.title, 'Why Linux Is Different');
	assert.equal(page.description, 'A fixture page about Linux contracts.');
	assert.equal(page.url, 'https://example.com/guide/start/why-linux/');
	assert.equal(page.markdownUrl, 'https://example.com/guide/start/why-linux.md');
	assert.match(page.body, /^Linux is not a product/);
	assert.doesNotMatch(page.body, /^# /);
	assert.ok(page.headings.some((heading) => heading.text === 'The four contracts'));
	assert.ok(page.wordCount > 10);
});

test('keeps a content blockquote when the description is empty', () => {
	const text = [
		'---',
		'title: "Quoted Page"',
		'description: ""',
		'url: "https://example.com/guide/start/quoted/"',
		'section: "Start Here"',
		'---',
		'',
		'# Quoted Page',
		'',
		'> This is content, not a summary.',
		'',
		'Body text.',
	].join('\n');

	const page = parsePage(text, 'start/quoted', baseUrl);
	assert.equal(page.description, '');
	assert.match(page.body, /^> This is content/);
});

test('maps published URLs to canonical slugs and rejects the rest', () => {
	assert.equal(slugFromUrl(`${baseUrl}start/why-linux/`, baseUrl), 'start/why-linux');
	assert.equal(slugFromUrl(`${baseUrl}start/why-linux.md`, baseUrl), 'start/why-linux');
	assert.equal(slugFromUrl(`${baseUrl}`, baseUrl), null);
	assert.equal(slugFromUrl(`${baseUrl}404/`, baseUrl), null);
	assert.equal(slugFromUrl('https://evil.example/start/why-linux/', baseUrl), null);
	assert.equal(slugFromUrl(`${baseUrl}llms-full.txt`, baseUrl), null);
});

test('parses the published baseline and rejects invalid data', async () => {
	const baseline = parseBaseline(await fixture('reference/baseline.json'), 'baseline');
	assert.equal(baseline.ubuntu.release, '26.04 LTS');
	assert.equal(baseline.desktop.gtk, '4.22');

	assert.throws(() => parseBaseline('not json', 'baseline'), /not valid JSON/);
	assert.throws(() => parseBaseline('[]', 'baseline'), /must be a JSON object/);
});
