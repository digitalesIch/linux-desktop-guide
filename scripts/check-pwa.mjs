#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const manifestPath = join(dist, 'manifest.webmanifest');
const indexPath = join(dist, 'index.html');
const swPath = join(dist, 'sw.js');
const offlinePath = join(dist, 'offline.html');

const errors = [];

function read(path, label) {
	if (!existsSync(path)) {
		errors.push(`${label} is missing at ${path}`);
		return '';
	}
	return readFileSync(path, 'utf8');
}

const manifestText = read(manifestPath, 'dist/manifest.webmanifest');
const index = read(indexPath, 'dist/index.html');
const sw = read(swPath, 'dist/sw.js');
const offline = read(offlinePath, 'dist/offline.html');

let manifest;
try {
	manifest = JSON.parse(manifestText);
} catch (error) {
	errors.push(`dist/manifest.webmanifest is not valid JSON: ${error.message}`);
	manifest = {};
}

for (const field of ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color']) {
	if (typeof manifest[field] !== 'string' || manifest[field].length === 0) {
		errors.push(`manifest.${field} is required`);
	}
}
if (manifest.display !== 'standalone') errors.push('manifest.display must be "standalone"');
if (!String(manifest.start_url ?? '').startsWith('/')) errors.push('manifest.start_url must be root-relative');
if (!String(manifest.scope ?? '').startsWith('/')) errors.push('manifest.scope must be root-relative');

const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
const requiredIcons = [
	{ sizes: '192x192', purpose: 'any' },
	{ sizes: '512x512', purpose: 'any' },
	{ sizes: '512x512', purpose: 'maskable' },
];
for (const required of requiredIcons) {
	const icon = icons.find((entry) => entry.sizes === required.sizes && entry.purpose === required.purpose);
	if (!icon) {
		errors.push(`manifest.icons is missing ${required.sizes} (${required.purpose})`);
		continue;
	}
	const file = join(dist, icon.src.replace(/^\//, ''));
	if (!existsSync(file)) {
		errors.push(`manifest icon is missing: ${icon.src}`);
		continue;
	}
	try {
		const meta = await sharp(file).metadata();
		const [width, height] = required.sizes.split('x').map(Number);
		if (meta.width !== width || meta.height !== height) {
			errors.push(`${icon.src} is ${meta.width}x${meta.height}, expected ${required.sizes}`);
		}
		if (meta.format !== 'png') errors.push(`${icon.src} must be a PNG`);
	} catch (error) {
		errors.push(`${icon.src} cannot be read as an image: ${error.message}`);
	}
}

if (!/rel=["']manifest["'][^>]*href=["']\/manifest\.webmanifest["']/i.test(index) && !/href=["']\/manifest\.webmanifest["'][^>]*rel=["']manifest["']/i.test(index)) {
	errors.push('built index.html is missing the manifest link');
}
for (const [label, pattern] of [
	['theme-color', /name=["']theme-color["']/i],
	['mobile-web-app-capable', /name=["']mobile-web-app-capable["']/i],
	['apple-mobile-web-app-capable', /name=["']apple-mobile-web-app-capable["']/i],
	['apple-mobile-web-app-title', /name=["']apple-mobile-web-app-title["']/i],
	['apple-touch-icon', /rel=["']apple-touch-icon["']/i],
	['service-worker registration', /navigator\.serviceWorker\.register\(\s*['"]\/sw\.js['"]/i],
]) {
	if (!pattern.test(index)) errors.push(`built index.html is missing ${label}`);
}

for (const handler of ['install', 'activate', 'fetch']) {
	if (!new RegExp(`addEventListener\\(['"]${handler}['"]`).test(sw)) {
		errors.push(`sw.js is missing the ${handler} handler`);
	}
}
if (!sw.includes('/offline.html')) errors.push('sw.js does not cache the offline page');
if (!/cache\.addAll|CORE/.test(sw)) errors.push('sw.js does not precache a core shell');

if (!/offline/i.test(offline)) errors.push('offline.html does not look like an offline page');

if (errors.length > 0) {
	console.error('PWA validation failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`PWA OK: ${manifest.name}, ${icons.length} icon(s), manifest + service worker + offline page.`,
);
