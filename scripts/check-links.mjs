#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_PATH } from '../site.config.mjs';
import { allowlistReason } from './external-allowlist.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const docsRoot = join(root, 'src', 'content', 'docs');
const assetExtensions = new Set([
	'.css',
	'.ico',
	'.jpeg',
	'.jpg',
	'.js',
	'.png',
	'.svg',
	'.webp',
	'.woff',
	'.woff2',
	'.xml',
]);
const placeholderHosts = new Set(['example.org', 'example.com', 'www.example.org', 'www.example.com']);
const basePrefix = BASE_PATH === '/' ? '' : BASE_PATH;

function stripBase(pathname) {
	if (!basePrefix) return pathname;
	if (pathname === basePrefix) return '/';
	if (pathname.startsWith(`${basePrefix}/`)) return pathname.slice(basePrefix.length);
	return pathname;
}

function walk(directory, extension) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...walk(path, extension));
		else if (entry.isFile() && path.endsWith(extension)) files.push(path);
	}
	return files;
}

function decodeHtml(value) {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function targetFor(pathname) {
	const clean = pathname.split('?')[0];
	if (clean.endsWith('/')) return join(dist, clean.slice(1), 'index.html');
	const direct = join(dist, clean.slice(1));
	if (extname(clean)) return direct;
	try {
		if (statSync(direct).isFile()) return direct;
	} catch {
		// Fall through to the directory index.
	}
	return join(dist, clean.slice(1), 'index.html');
}

function hasAnchor(file, fragment) {
	const source = readFileSync(file, 'utf8');
	const id = decodeHtml(fragment).replace(/"/g, '&quot;');
	return source.includes(`id="${id}"`) || source.includes(`name="${id}"`);
}

function checkInternal() {
	if (!existsSync(dist)) {
		console.error('dist/ is missing. Run `npm run build` first.');
		return false;
	}
	const pages = walk(dist, '.html');
	const errors = [];
	let checked = 0;

	for (const page of pages) {
		const source = readFileSync(page, 'utf8');
		for (const match of source.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
			const href = decodeHtml(match[1]).trim();
			if (!href || href.startsWith('#') || href.startsWith('//')) continue;
			if (!href.startsWith('/')) continue;

			const [rawPathname, fragment] = href.split('#');
			if (
				basePrefix &&
				rawPathname.startsWith('/') &&
				!rawPathname.startsWith('//') &&
				rawPathname !== basePrefix &&
				!rawPathname.startsWith(`${basePrefix}/`)
			) {
				errors.push(
					`${relative(root, page)} -> ${href} (missing base path ${basePrefix})`,
				);
				continue;
			}
			const pathname = stripBase(rawPathname);
			if (pathname.startsWith('/_astro/')) continue;
			if (assetExtensions.has(extname(pathname))) continue;

			checked += 1;
			const target = targetFor(pathname);
			try {
				statSync(target);
			} catch {
				errors.push(`${relative(root, page)} -> ${href} (missing page: ${relative(root, target)})`);
				continue;
			}
			if (fragment && !hasAnchor(target, fragment)) {
				errors.push(`${relative(root, page)} -> ${href} (missing anchor)`);
			}
		}
	}

	if (errors.length > 0) {
		console.error(`Internal links: ${errors.length} error(s) in ${checked} checked link(s):`);
		for (const error of errors) console.error(`- ${error}`);
		return false;
	}
	console.log(`Internal links OK: ${checked} link(s) across ${pages.length} page(s).`);
	return true;
}

function extractExternalUrls() {
	const urls = new Map();
	for (const file of walk(docsRoot, '.md')) {
		const source = readFileSync(file, 'utf8');
		const page = relative(docsRoot, file);
		for (const match of source.matchAll(/https?:\/\/[^\s)<>"']+/g)) {
			const url = match[0].replace(/[.,;:]+$/, '');
			if (!urls.has(url)) urls.set(url, new Set());
			urls.get(url).add(page);
		}
	}
	for (const file of walk(docsRoot, '.mdx')) {
		const source = readFileSync(file, 'utf8');
		const page = relative(docsRoot, file);
		for (const match of source.matchAll(/https?:\/\/[^\s)<>"']+/g)) {
			const url = match[0].replace(/[.,;:]+$/, '');
			if (!urls.has(url)) urls.set(url, new Set());
			urls.get(url).add(page);
		}
	}
	return urls;
}

function isPlaceholder(url) {
	try {
		const parsed = new URL(url);
		if (placeholderHosts.has(parsed.hostname)) return true;
		if (parsed.hostname === 'github.com' && parsed.pathname.startsWith('/yourname/')) return true;
		return false;
	} catch {
		return true;
	}
}

async function checkExternalUrl(url, attempts = 2) {
	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 25000);
		try {
			const response = await fetch(url, {
				redirect: 'follow',
				signal: controller.signal,
				headers: { 'user-agent': 'linux-desktop-guide-link-check/1.0' },
			});
			await response.body?.cancel();
			const effective = response.url || url;
			if (response.status < 200 || response.status >= 400) {
				return { kind: 'http', url, status: response.status, effective, error: 'non-success status' };
			}
			if (/readthedocs.*login|accounts\/login/i.test(effective)) {
				return { kind: 'login', url, status: response.status, effective, error: 'login redirect' };
			}
			return null;
		} catch (error) {
			if (attempt < attempts) {
				await new Promise((resolve) => setTimeout(resolve, 1200));
				continue;
			}
			return { kind: 'network', url, status: 'ERR', effective: url, error: error.message };
		} finally {
			clearTimeout(timer);
		}
	}
	return null;
}

async function checkExternal() {
	const urls = extractExternalUrls();
	const allowlisted = [];
	const entries = [...urls.entries()].filter(([url]) => {
		const reason = allowlistReason(url);
		if (reason) {
			allowlisted.push({ url, reason });
			return false;
		}
		return !isPlaceholder(url);
	});
	const failures = [];
	const warnings = [];
	let checked = 0;
	let next = 0;

	async function worker() {
		while (next < entries.length) {
			const index = next++;
			const [url] = entries[index];
			checked += 1;
			const failure = await checkExternalUrl(url);
			if (failure?.kind === 'network') warnings.push(failure);
			else if (failure) failures.push(failure);
		}
	}

	await Promise.all(Array.from({ length: Math.min(12, entries.length || 1) }, () => worker()));

	if (allowlisted.length > 0) {
		console.log(`External links: ${allowlisted.length} allowlisted URL(s):`);
		for (const entry of allowlisted) console.log(`- ${entry.url} (${entry.reason})`);
	}

	if (warnings.length > 0) {
		console.warn(`External links: ${warnings.length} unreachable URL(s) ignored as warnings:`);
		for (const warning of warnings) {
			console.warn(`- ${warning.url} (${warning.error})`);
		}
	}

	if (failures.length > 0) {
		console.error(`External links: ${failures.length} failure(s) in ${checked} checked URL(s):`);
		for (const failure of failures) {
			const pages = [...(urls.get(failure.url) ?? [])].join(', ');
			console.error(`- ${failure.url} -> ${failure.status} ${failure.error} (${failure.effective}) [${pages}]`);
		}
		return false;
	}
	// Strict mode fails only on real HTTP failures. Network/DNS warnings describe the
	// CI egress path, not the target site, so they do not fail the check.
	console.log(`External links OK${strict ? ' (strict)' : ''}: ${checked} URL(s) checked${warnings.length ? ` (${warnings.length} unreachable warning(s))` : ''}.`);
	return true;
}

const external = process.argv.includes('--external');
const strict = process.argv.includes('--strict');
const ok = external ? await checkExternal() : checkInternal();
process.exitCode = ok ? 0 : 1;
