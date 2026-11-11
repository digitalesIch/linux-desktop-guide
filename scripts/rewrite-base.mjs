#!/usr/bin/env node
/**
 * Prefix root-relative URLs in the built HTML with the deployment base path.
 *
 * Astro handles the base for its own routes and assets, and the Markdown
 * rehype plugin handles ordinary links. Raw HTML in Markdown/MDX and
 * frontmatter HTML (for example, the landing hero image) bypass both, so this
 * post-build pass closes the remaining gap.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_PATH } from '../site.config.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const base = BASE_PATH === '/' ? '' : BASE_PATH;

if (!base) {
	console.log('Base path is root; no HTML rewrite needed.');
	process.exit(0);
}

function walk(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...walk(path));
		else if (entry.isFile() && path.endsWith('.html')) files.push(path);
	}
	return files;
}

const attribute = /\b(href|src|poster|action)=(["'])(\/(?!\/)[^"']*)\2/gi;
let changedFiles = 0;
let changedUrls = 0;

for (const file of walk(dist)) {
	const source = readFileSync(file, 'utf8');
	const output = source.replace(attribute, (match, name, quote, pathname) => {
		if (pathname === base || pathname.startsWith(`${base}/`)) return match;
		changedUrls += 1;
		return `${name}=${quote}${base}${pathname}${quote}`;
	});
	if (output !== source) {
		writeFileSync(file, output);
		changedFiles += 1;
	}
}

console.log(
	`Base path rewrite: ${changedUrls} URL(s) in ${changedFiles} HTML file(s) prefixed with ${base}.`,
);
