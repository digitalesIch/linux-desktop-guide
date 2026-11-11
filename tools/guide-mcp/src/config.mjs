import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const SERVER_NAME = 'linux-desktop-guide';

export const SERVER_VERSION =
	typeof __GUIDE_MCP_VERSION__ === 'string' ? __GUIDE_MCP_VERSION__ : '0.0.0-dev';

export const DEFAULT_BASE_URL = 'https://digitalesich.github.io/linux-desktop-guide/';

export const TTL = Object.freeze({
	manifest: 15 * 60_000,
	page: 30 * 60_000,
	corpus: 60 * 60_000,
	baseline: 60 * 60_000,
});

export const REQUEST_DEFAULTS = Object.freeze({
	timeoutMs: 10_000,
	maxBytes: 2 * 1024 * 1024,
	retries: 1,
	retryDelayMs: 250,
	maxRetryAfterMs: 5_000,
	maxRedirects: 3,
});

export const USER_AGENT = `linux-desktop-guide-mcp/${SERVER_VERSION} (+https://github.com/digitalesIch/linux-desktop-guide)`;

/**
 * Resolve and validate the published base URL.
 */
export function resolveBaseUrl(env = process.env) {
	const raw = env.LDG_SITE_URL?.trim() || DEFAULT_BASE_URL;
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error(`LDG_SITE_URL is not a valid URL: ${raw}`);
	}

	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new Error(`LDG_SITE_URL must use http or https: ${raw}`);
	}
	if (url.username || url.password) {
		throw new Error('LDG_SITE_URL must not contain credentials.');
	}
	if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
	url.search = '';
	url.hash = '';
	return url.href;
}

/**
 * Cache entries are disposable and live outside the consumer's project.
 */
export function resolveCacheDir(env = process.env) {
	if (env.LDG_CACHE_DIR?.trim()) return resolve(env.LDG_CACHE_DIR.trim());

	const name = 'linux-desktop-guide-mcp';
	if (process.platform === 'win32') {
		const base = env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
		return join(base, name, 'Cache');
	}
	if (process.platform === 'darwin') {
		return join(homedir(), 'Library', 'Caches', name);
	}
	return join(env.XDG_CACHE_HOME || join(homedir(), '.cache'), name);
}

export function cacheEnabled(env = process.env) {
	return env.LDG_NO_CACHE !== '1';
}

/**
 * A single override for tests and debugging; it applies to every resource.
 */
export function resolveTtl(env, fallback) {
	const raw = env.LDG_CACHE_TTL_MS;
	if (raw === undefined || raw === '') return fallback;
	const value = Number(raw);
	if (!Number.isFinite(value) || value < 0) {
		throw new Error(`LDG_CACHE_TTL_MS must be a non-negative number, got: ${raw}`);
	}
	return value;
}
