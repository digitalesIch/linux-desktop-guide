#!/usr/bin/env node

/**
 * Verify the deployed guide at a base URL.
 *
 * Usage:
 *   npm run check:deployed -- https://digitalesich.github.io/linux-desktop-guide/
 *   DEPLOY_URL=https://example.com/ npm run check:deployed
 */

const input = process.argv[2] ?? process.env.DEPLOY_URL;
if (!input) {
	console.error('Usage: npm run check:deployed -- <base-url>');
	console.error('   or: DEPLOY_URL=<base-url> npm run check:deployed');
	process.exit(1);
}

const base = input.endsWith('/') ? input : `${input}/`;
const basePath = new URL(base).pathname;
const errors = [];
let checked = 0;

function decode(value) {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function typeMatches(actual, expected) {
	return actual.toLowerCase().includes(expected.toLowerCase());
}

async function fetchRoute(path, expectedType, label = path) {
	const url = new URL(path, base).toString();
	let response;
	try {
		response = await fetch(url, {
			redirect: 'follow',
			signal: AbortSignal.timeout(20000),
			headers: { 'user-agent': 'linux-desktop-guide-deployed-check/1.0' },
		});
	} catch (error) {
		errors.push(`${label}: request failed for ${url} (${error.message})`);
		return null;
	}

	checked += 1;
	if (!response.ok) {
		errors.push(`${label}: ${url} returned ${response.status}`);
		return null;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (expectedType && !typeMatches(contentType, expectedType)) {
		errors.push(`${label}: expected ${expectedType}, got ${contentType || 'no content type'} at ${url}`);
	}
	return response;
}

function checkRootRelativeLinks(html, pageUrl) {
	for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
		const value = decode(match[1]).trim();
		if (!value || value.startsWith('#') || value.startsWith('//')) continue;
		if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
		if (!value.startsWith('/')) continue;
		if (!value.startsWith(basePath)) {
			errors.push(`${pageUrl} references ${value}, which is outside the base path ${basePath}`);
		}
	}
}

const landing = await fetchRoute('', 'text/html', 'landing page');
if (landing) {
	const html = await landing.text();
	checkRootRelativeLinks(html, new URL(base).toString());

	if (!/navigator\.serviceWorker\.register\(/.test(html)) {
		errors.push('landing page: service worker registration is missing');
	}
	const swPath = html.match(/swPath\s*=\s*"([^"]+)"/)?.[1];
	if (!swPath || !swPath.startsWith(basePath) || !swPath.endsWith('/sw.js')) {
		errors.push(`landing page: service worker path is not under ${basePath}`);
	}
	const swScope = html.match(/swScope\s*=\s*"([^"]+)"/)?.[1];
	if (!swScope || swScope !== basePath) {
		errors.push(`landing page: service worker scope ${swScope ?? '(missing)'} does not match ${basePath}`);
	}
}

const content = await fetchRoute('start/why-linux/', 'text/html', 'content page');
if (content) {
	checkRootRelativeLinks(await content.text(), new URL('start/why-linux/', base).toString());
}

await fetchRoute('llms.txt', 'text/plain', 'llms.txt');
const full = await fetchRoute('llms-full.txt', 'text/plain', 'llms-full.txt');
await fetchRoute('start/why-linux.md', 'text/markdown', 'Markdown route');

const manifestResponse = await fetchRoute('manifest.webmanifest', 'application/manifest+json', 'manifest');
if (manifestResponse) {
	let manifest;
	try {
		manifest = await manifestResponse.json();
	} catch (error) {
		errors.push(`manifest: invalid JSON (${error.message})`);
	}
	if (manifest) {
		if (manifest.start_url !== basePath) {
			errors.push(`manifest: start_url ${manifest.start_url ?? '(missing)'} does not match ${basePath}`);
		}
		if (manifest.scope !== basePath) {
			errors.push(`manifest: scope ${manifest.scope ?? '(missing)'} does not match ${basePath}`);
		}
		for (const icon of manifest.icons ?? []) {
			if (typeof icon.src !== 'string' || !icon.src.startsWith(basePath)) {
				errors.push(`manifest: icon ${icon.src ?? '(missing)'} is outside ${basePath}`);
			}
		}
	}
}

await fetchRoute('sw.js', 'javascript', 'service worker');
await fetchRoute('offline.html', 'text/html', 'offline page');

if (full) {
	const text = await full.text();
	if (!text.includes('Linux Desktop Guide')) errors.push('llms-full.txt does not contain the guide title');
}

if (errors.length > 0) {
	console.error(`Deployed check failed: ${errors.length} issue(s) in ${checked} request(s) at ${base}`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`Deployed check OK: ${checked} request(s) at ${base}`);
