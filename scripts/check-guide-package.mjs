#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageDirectory = join(root, 'tools', 'guide-mcp');
const errors = [];

const manifest = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
const runtimeDependencies = [
	...(manifest.dependencies ? Object.keys(manifest.dependencies) : []),
	...(manifest.optionalDependencies ? Object.keys(manifest.optionalDependencies) : []),
	...(manifest.peerDependencies ? Object.keys(manifest.peerDependencies) : []),
];

if (manifest.name !== 'linux-desktop-guide-mcp') errors.push('unexpected package name');
if (manifest.license !== 'MIT') errors.push('the package must be MIT licensed');
if (manifest.bin?.['linux-desktop-guide-mcp'] !== 'dist/server.mjs') {
	errors.push('the bin entry must point to dist/server.mjs');
}
if (!manifest.engines?.node?.includes('22')) errors.push('the package must declare the Node.js baseline');
if (runtimeDependencies.length > 0) {
	errors.push(`the package must not declare runtime dependencies: ${runtimeDependencies.join(', ')}`);
}
if (manifest.scripts?.postinstall) errors.push('the package must not run a postinstall script');

let packed;
try {
	const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
		cwd: packageDirectory,
		encoding: 'utf8',
		shell: process.platform === 'win32',
	});
	const parsed = JSON.parse(output);
	packed = Array.isArray(parsed) ? parsed[0] : parsed;
} catch (error) {
	errors.push(`npm pack failed: ${error.message}`);
}

if (packed) {
	const files = new Set((packed.files ?? []).map((file) => file.path));
	for (const required of ['dist/server.mjs', 'README.md', 'LICENSE', 'package.json']) {
		if (!files.has(required)) errors.push(`the tarball is missing ${required}`);
	}
	for (const forbidden of ['src/server.mjs', 'test/server.test.mjs', 'build.mjs']) {
		if (files.has(forbidden)) errors.push(`the tarball must not include ${forbidden}`);
	}
	if (packed.unpackedSize > 3_000_000) {
		errors.push(`the unpacked package is unexpectedly large: ${packed.unpackedSize} bytes`);
	}
}

let version = '';
try {
	version = execFileSync(process.execPath, ['dist/server.mjs', '--version'], {
		cwd: packageDirectory,
		encoding: 'utf8',
	}).trim();
} catch (error) {
	errors.push(`the built bundle does not start: ${error.message}`);
}
if (version && version !== `linux-desktop-guide ${manifest.version}`) {
	errors.push(`unexpected version output: ${version}`);
}

if (errors.length > 0) {
	console.error('Guide package check failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`Guide package OK: ${manifest.name}@${manifest.version}, ${packed.entryCount} files, ${packed.unpackedSize} bytes unpacked, no runtime dependencies.`,
);
