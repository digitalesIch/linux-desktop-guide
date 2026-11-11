import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	json,
	makeTempCache,
	startFixtureServer,
	startServer,
} from './helpers.mjs';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = join(packageDirectory, 'dist', 'server.mjs');

test('the built bundle is executable and reports its version', () => {
	assert.ok(existsSync(bundle), 'dist/server.mjs is missing; run npm run build:guide-mcp');
	assert.equal(readFileSync(bundle, 'utf8').split('\n')[0], '#!/usr/bin/env node');

	const manifest = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
	const output = execFileSync(process.execPath, [bundle, '--version'], { encoding: 'utf8' }).trim();
	assert.equal(output, `linux-desktop-guide ${manifest.version}`);
});

test('the built bundle talks to a published guide', async () => {
	const fixture = await startFixtureServer();
	const server = await startServer({
		entry: 'dist/server.mjs',
		baseUrl: fixture.baseUrl,
		cacheDir: await makeTempCache(),
	});

	try {
		const payload = json(await server.client.callTool({ name: 'list_pages', arguments: {} }));
		assert.equal(payload.count, 3);
		assert.equal(payload.stale, false);
	} finally {
		await server.close();
		await fixture.close();
	}
});
