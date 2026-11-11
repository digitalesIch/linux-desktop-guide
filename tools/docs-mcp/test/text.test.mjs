import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ASTRO_CONFIG_PATH, DOCS_ROOT } from '../lib/config.mjs';
import { loadPages } from '../lib/pages.mjs';
import { markdownToPlain } from '../../docs-core/text.mjs';

test('removes table separators without dropping table content', () => {
	const plain = markdownToPlain(`
| Layer | What it provides |
| --- | :---: |
| Kernel | Hardware, input, power |
| Toolkit | Widgets and layout |

After the table.
`);

	assert.ok(plain.includes('Layer'));
	assert.ok(plain.includes('Kernel'));
	assert.ok(plain.includes('Widgets and layout'));
	assert.ok(plain.includes('After the table'));
	assert.ok(!plain.includes('---'));
});

test('preserves angle-bracket comparisons as text', () => {
	const plain = markdownToPlain('| Cold start | < 1 s | < 200 MB |\n| --- | --- | --- |');

	assert.ok(plain.includes('< 1 s'));
	assert.ok(plain.includes('< 200 MB'));
});

test('keeps table-heavy guide pages at a realistic word count', () => {
	const { pages } = loadPages({ docsRoot: DOCS_ROOT, sidebarPath: ASTRO_CONFIG_PATH });
	const performance = pages.find((page) => page.slug === 'engineering/performance');

	assert.ok(performance);
	assert.ok(performance.plain.includes('Cold start to first window'));
	assert.ok(performance.wordCount > 1000, `expected > 1000 words, got ${performance.wordCount}`);
});
