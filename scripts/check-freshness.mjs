#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateSources } from './freshness-lib.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const configPath = join(root, 'src', 'data', 'freshness.json');
const args = process.argv.slice(2);
const json = args.includes('--json');
const fixtureIndex = args.indexOf('--fixture');
const fixturePath = fixtureIndex >= 0 ? args[fixtureIndex + 1] : null;

let config;
try {
	config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
	console.error(`Could not read ${configPath}: ${error.message}`);
	process.exit(1);
}

const fixture = fixturePath ? JSON.parse(readFileSync(fixturePath, 'utf8')) : null;

async function load(url) {
	if (fixture) {
		const entry = fixture[url];
		if (!entry) return { status: 404, body: '', error: 'No fixture entry' };
		return entry;
	}

	const response = await fetch(url, {
		redirect: 'follow',
		signal: AbortSignal.timeout(25000),
		headers: { 'user-agent': 'linux-desktop-guide-freshness-check/1.0' },
	});
	return {
		status: response.status,
		body: await response.text(),
		contentType: response.headers.get('content-type') ?? '',
	};
}

const report = await evaluateSources(config.sources, load, config.checked_on);

if (json) {
	console.log(JSON.stringify(report, null, 2));
} else {
	console.log(`Freshness check: ${config.sources.length} source(s), checked ${report.checkedAt}`);
	if (report.drift.length > 0) {
		console.log(`\nDrift (${report.drift.length}):`);
		for (const item of report.drift) {
			console.log(`- ${item.source}: expected "${item.expected}" for ${item.fields.join(', ')}`);
			console.log(`  ${item.url}`);
		}
	}
	if (report.errors.length > 0) {
		console.log(`\nErrors (${report.errors.length}):`);
		for (const item of report.errors) {
			console.log(`- ${item.source}: ${item.status} ${item.error}`);
			console.log(`  ${item.url}`);
		}
	}
	if (report.human.length > 0) {
		console.log(`\nManual review (${report.human.length}):`);
		for (const item of report.human) {
			console.log(`- ${item.source}: ${item.fields.join(', ')} — ${item.reason}`);
		}
	}
	if (report.drift.length === 0 && report.errors.length === 0) {
		console.log('\nNo machine-checkable drift.');
	}
}

process.exitCode = 0;
