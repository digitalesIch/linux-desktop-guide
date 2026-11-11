import { DocsError } from '../../docs-core/errors.mjs';
import { REQUEST_DEFAULTS, USER_AGENT } from './config.mjs';

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);
const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch the published guide with an origin allowlist, bounded responses, and
 * a stale-aware cache. This client is the only module that opens a socket.
 */
export class SiteClient {
	constructor({ baseUrl, cache = null, fetchImpl = globalThis.fetch, userAgent = USER_AGENT, ...options }) {
		if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
		this.base = new URL(baseUrl);
		this.baseUrl = this.base.href;
		this.cache = cache;
		this.fetch = fetchImpl;
		this.userAgent = userAgent;
		this.options = { ...REQUEST_DEFAULTS, ...options };
		this.inflight = new Map();
	}

	assertAllowed(input) {
		let url;
		try {
			url = new URL(input);
		} catch {
			throw new DocsError(`Invalid URL: ${input}`, 'INVALID_URL');
		}

		if (url.username || url.password) {
			throw new DocsError('Refusing a URL that contains credentials.', 'SITE_NOT_ALLOWED');
		}
		if (url.origin !== this.base.origin || !url.pathname.startsWith(this.base.pathname)) {
			throw new DocsError(`Refusing to fetch ${url.href}: outside ${this.baseUrl}.`, 'SITE_NOT_ALLOWED');
		}
		return url;
	}

	result(entry, { stale, fromCache, error }) {
		return {
			body: entry.body,
			contentType: entry.contentType ?? '',
			fetchedAt: new Date(entry.fetchedAt).toISOString(),
			ageMs: Math.max(0, Date.now() - entry.fetchedAt),
			stale,
			fromCache,
			...(error ? { error } : {}),
		};
	}

	async safeWrite(url, entry) {
		try {
			await this.cache?.write(url, entry);
		} catch {
			// A read-only or full cache directory must not fail a tool call.
		}
	}

	async get(path, { ttlMs = 0, accept = '*/*' } = {}) {
		const url = this.assertAllowed(new URL(path, this.baseUrl)).href;

		const existing = this.inflight.get(url);
		if (existing) return existing;

		const promise = this.load(url, { ttlMs, accept }).finally(() => this.inflight.delete(url));
		this.inflight.set(url, promise);
		return promise;
	}

	async load(url, { ttlMs, accept }) {
		const cached = await this.cache?.read(url);
		if (cached && Date.now() - cached.fetchedAt < ttlMs) {
			return this.result(cached, { stale: false, fromCache: true });
		}

		const headers = { 'user-agent': this.userAgent, accept };
		if (cached?.etag) headers['if-none-match'] = cached.etag;
		if (cached?.lastModified) headers['if-modified-since'] = cached.lastModified;

		try {
			const response = await this.request(url, headers);

			if (response.status === 304) {
				await response.body?.cancel();
				if (!cached) throw new DocsError(`Unexpected 304 response from ${url}.`, 'UNEXPECTED_304');
				cached.fetchedAt = Date.now();
				await this.safeWrite(url, cached);
				return this.result(cached, { stale: false, fromCache: true });
			}
			if (response.status === 404) {
				await response.body?.cancel();
				throw new DocsError(`The published guide has no resource at ${url}.`, 'NOT_FOUND');
			}
			if (!response.ok) {
				await response.body?.cancel();
				throw new DocsError(`Request to ${url} failed with HTTP ${response.status}.`, 'HTTP_ERROR');
			}

			const body = await this.readBody(response, url);
			const entry = {
				url,
				body,
				etag: response.headers.get('etag') ?? undefined,
				lastModified: response.headers.get('last-modified') ?? undefined,
				contentType: response.headers.get('content-type') ?? undefined,
				fetchedAt: Date.now(),
			};
			await this.safeWrite(url, entry);
			return this.result(entry, { stale: false, fromCache: false });
		} catch (error) {
			if (
				error instanceof DocsError &&
				['NOT_FOUND', 'SITE_NOT_ALLOWED', 'CONTENT_TOO_LARGE', 'TOO_MANY_REDIRECTS', 'UNEXPECTED_304'].includes(
					error.code,
				)
			) {
				throw error;
			}

			if (cached) {
				return this.result(cached, { stale: true, fromCache: true, error: error.message });
			}

			if (error instanceof DocsError) throw error;
			throw new DocsError(
				`Could not reach ${url}: ${error.message}. Check the network, or read llms.txt when an MCP client is not available.`,
				'NETWORK_ERROR',
				{ cause: error },
			);
		}
	}

	async request(url, headers, attempt = 0, redirects = 0) {
		let response;
		try {
			response = await this.fetch(url, {
				headers,
				redirect: 'manual',
				signal: AbortSignal.timeout(this.options.timeoutMs),
			});
		} catch (error) {
			if (attempt < this.options.retries) {
				await sleep(this.options.retryDelayMs);
				return this.request(url, headers, attempt + 1, redirects);
			}
			throw error;
		}

		const location = response.headers.get('location');
		if (REDIRECT_STATUS.has(response.status) && location) {
			await response.body?.cancel();
			if (redirects >= this.options.maxRedirects) {
				throw new DocsError(`Too many redirects from ${url}.`, 'TOO_MANY_REDIRECTS');
			}
			const target = this.assertAllowed(new URL(location, url)).href;
			return this.request(target, headers, attempt, redirects + 1);
		}

		if (RETRY_STATUS.has(response.status) && attempt < this.options.retries) {
			const delay = this.retryAfterMs(response.headers.get('retry-after')) ?? this.options.retryDelayMs;
			await response.body?.cancel();
			await sleep(delay);
			return this.request(url, headers, attempt + 1, redirects);
		}

		return response;
	}

	retryAfterMs(value) {
		if (!value) return null;

		const seconds = Number(value);
		if (Number.isFinite(seconds)) {
			return Math.min(Math.max(0, seconds * 1000), this.options.maxRetryAfterMs);
		}

		const date = Date.parse(value);
		if (Number.isFinite(date)) {
			return Math.min(Math.max(0, date - Date.now()), this.options.maxRetryAfterMs);
		}
		return null;
	}

	async readBody(response, url) {
		const declared = Number(response.headers.get('content-length'));
		if (Number.isFinite(declared) && declared > this.options.maxBytes) {
			await response.body?.cancel();
			throw new DocsError(
				`Response from ${url} is larger than ${this.options.maxBytes} bytes.`,
				'CONTENT_TOO_LARGE',
			);
		}

		if (!response.body) {
			const text = await response.text();
			if (Buffer.byteLength(text) > this.options.maxBytes) {
				throw new DocsError(
					`Response from ${url} is larger than ${this.options.maxBytes} bytes.`,
					'CONTENT_TOO_LARGE',
				);
			}
			return text;
		}

		const reader = response.body.getReader();
		const chunks = [];
		let total = 0;

		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				total += value.byteLength;
				if (total > this.options.maxBytes) {
					await reader.cancel();
					throw new DocsError(
						`Response from ${url} is larger than ${this.options.maxBytes} bytes.`,
						'CONTENT_TOO_LARGE',
					);
				}
				chunks.push(Buffer.from(value));
			}
		} finally {
			reader.releaseLock();
		}

		return Buffer.concat(chunks, total).toString('utf8');
	}
}
