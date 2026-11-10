#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const external = process.argv.includes('--external');
const steps = ['check:baseline', 'check:examples', 'check:targets', 'build', 'check:agent-docs', 'test:docs-mcp', 'check:links'];
if (external) steps.push('check:links:external');

for (const step of steps) {
	console.log(`\n==> npm run ${step}`);
	const result = spawnSync('npm', ['run', step], {
		cwd: root,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	if (result.status !== 0) {
		console.error(`\ncheck:docs failed at: ${step}`);
		process.exit(result.status ?? 1);
	}
}

console.log(`\ncheck:docs passed (${steps.length} steps${external ? ', external links included' : ', offline'}).`);
