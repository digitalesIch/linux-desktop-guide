import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateSources } from './freshness-lib.mjs';

const sources = [
	{
		id: 'gnome',
		url: 'https://example.com/gnome',
		mode: 'machine',
		fields: ['baseline.desktop.gnome'],
		expect: ['GNOME 50'],
	},
	{
		id: 'manual',
		url: 'https://example.com/manual',
		mode: 'human',
		fields: ['baseline.desktop.gtk'],
		reason: 'Needs a human read.',
	},
];

function loader(map) {
	return async (url) => map[url] ?? { status: 404, body: '' };
}

test('reports no drift when the expected value is present', async () => {
	const report = await evaluateSources(
		sources,
		loader({
			'https://example.com/gnome': { status: 200, body: '<h1>GNOME 50</h1>' },
		}),
		'2026-11-11',
	);
	assert.equal(report.checkedAt, '2026-11-11');
	assert.deepEqual(report.drift, []);
	assert.deepEqual(report.errors, []);
	assert.equal(report.human.length, 1);
});

test('reports drift when a source changes', async () => {
	const report = await evaluateSources(
		sources,
		loader({
			'https://example.com/gnome': { status: 200, body: '<h1>GNOME 51</h1>' },
		}),
	);
	assert.equal(report.drift.length, 1);
	assert.equal(report.drift[0].source, 'gnome');
	assert.equal(report.drift[0].expected, 'GNOME 50');
	assert.deepEqual(report.drift[0].fields, ['baseline.desktop.gnome']);
});

test('reports an error for a failed source', async () => {
	const report = await evaluateSources(
		sources,
		loader({
			'https://example.com/gnome': { status: 500, body: 'server error' },
		}),
	);
	assert.equal(report.errors.length, 1);
	assert.equal(report.errors[0].source, 'gnome');
	assert.equal(report.errors[0].status, 500);
});
