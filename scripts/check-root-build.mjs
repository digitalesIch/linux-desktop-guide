#!/usr/bin/env node

/**
 * Verify a root-domain build produced no project-path prefixes.
 * Run after: BASE_PATH=/ SITE_URL=https://example.com npm run build
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const errors = [];
const forbidden = '/linux-desktop-guide';

function walk(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...walk(path));
		else if (entry.isFile()) files.push(path);
	}
	return files;
}

if (!existsSync(dist)) {
	console.error('dist/ is missing. Run `BASE_PATH=/ SITE_URL=https://example.com npm run build` first.');
	process.exit(1);
}

const rootRelative = /\b(?:href|src)=["']\/linux-desktop-guide(?:[\/"'])/;
for (const file of walk(dist).filter((path) => path.endsWith('.html'))) {
	const source = readFileSync(file, 'utf8');
	if (rootRelative.test(source)) {
		errors.push(`${file}: contains a root-relative ${forbidden} path`);
	}
}

const manifestPath = join(dist, 'manifest.webmanifest');
if (!existsSync(manifestPath)) {
	errors.push('dist/manifest.webmanifest is missing');
} else {
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	if (manifest.scope !== '/') errors.push(`manifest scope is ${manifest.scope}, expected /`);
	if (manifest.start_url !== '/') errors.push(`manifest start_url is ${manifest.start_url}, expected /`);
	for (const icon of manifest.icons ?? []) {
		if (typeof icon.src !== 'string' || !icon.src.startsWith('/icons/')) {
			errors.push(`manifest icon ${icon.src} is not a root path`);
		}
	}
}

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) {
	errors.push('dist/index.html is missing');
} else {
	const index = readFileSync(indexPath, 'utf8');
	if (!index.includes('swPath = "/sw.js"')) errors.push('index.html does not register /sw.js');
	if (!index.includes('swScope = "/"')) errors.push('index.html does not use the root service-worker scope');
}

const llmsPath = join(dist, 'llms.txt');
if (!existsSync(llmsPath)) {
	errors.push('dist/llms.txt is missing');
} else {
	const llms = readFileSync(llmsPath, 'utf8');
	if (!llms.includes('https://example.com/start/why-linux.md')) {
		errors.push('llms.txt does not use the example.com site URL');
	}
	if (llms.includes(`https://example.com${forbidden}`)) errors.push(`llms.txt contains a ${forbidden} site URL`);
}

const markdownPath = join(dist, 'start', 'why-linux.md');
if (!existsSync(markdownPath)) {
	errors.push('dist/start/why-linux.md is missing');
} else {
	const markdown = readFileSync(markdownPath, 'utf8');
	if (!markdown.includes('url: "https://example.com/start/why-linux/"')) {
		errors.push('Markdown frontmatter does not use the example.com site URL');
	}
	if (markdown.includes(`https://example.com${forbidden}`)) errors.push(`Markdown contains a ${forbidden} site URL`);
}

const sitemapPath = join(dist, 'sitemap-0.xml');
if (!existsSync(sitemapPath)) {
	errors.push('dist/sitemap-0.xml is missing');
} else {
	const sitemap = readFileSync(sitemapPath, 'utf8');
	if (!sitemap.includes('https://example.com/')) errors.push('sitemap does not use the example.com site URL');
	if (sitemap.includes(`https://example.com${forbidden}`)) errors.push(`sitemap contains a ${forbidden} site URL`);
}

if (errors.length > 0) {
	console.error('Root build check failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log('Root build check OK: no project-path prefix in HTML, manifest, service worker, sitemap, or agent Markdown.');
