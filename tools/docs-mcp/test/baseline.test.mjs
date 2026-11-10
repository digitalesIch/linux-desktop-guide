import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { BASELINE_PATH } from '../lib/config.mjs';
import { readBaseline } from '../lib/baseline.mjs';
import { DocsError } from '../lib/errors.mjs';

test('reads the documented baseline data', () => {
	const baseline = readBaseline();
	const source = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
	assert.deepEqual(baseline, source);
	assert.equal(baseline.ubuntu.release, '26.04 LTS');
	assert.equal(baseline.desktop.gtk, '4.22');
	assert.equal(baseline.qt.version, '6.10.2');
	assert.match(baseline.validated_on, /^\d{4}-\d{2}-\d{2}$/);
});

test('reports unreadable baseline data', () => {
	assert.throws(() => readBaseline('/tmp/opencode/does-not-exist-baseline.json'), DocsError);
});
