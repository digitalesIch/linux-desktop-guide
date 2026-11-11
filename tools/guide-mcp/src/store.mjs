import { DocsError } from '../../docs-core/errors.mjs';
import { DocsRelated } from '../../docs-core/related.mjs';
import { DocsSearch } from '../../docs-core/search.mjs';
import { listPages, pageResult } from '../../docs-core/results.mjs';
import { normalizeSlug } from '../../docs-core/slug.mjs';
import { parseBaseline, parseFullText, parseManifest, parsePage } from './corpus.mjs';
import { resolveTtl, TTL } from './config.mjs';

function withMeta(result, fetched) {
	return {
		...result,
		fetchedAt: fetched.fetchedAt,
		stale: fetched.stale,
		...(fetched.error ? { staleReason: fetched.error } : {}),
	};
}

/**
 * Lazily load the published manifest and corpus. No request is made until the
 * first tool call, so the server starts and fails fast without network access.
 */
export class GuideStore {
	constructor({ client, baseUrl, env = process.env }) {
		this.client = client;
		this.baseUrl = baseUrl;
		this.env = env;
		this.manifestState = null;
		this.corpusState = null;
	}

	ttl(name) {
		return resolveTtl(this.env, TTL[name]);
	}

	async manifest() {
		const fetched = await this.client.get('llms.txt', {
			ttlMs: this.ttl('manifest'),
			accept: 'text/plain, text/markdown;q=0.9, */*;q=0.1',
		});
		if (this.manifestState && this.manifestState.fetched.fetchedAt === fetched.fetchedAt) {
			return this.manifestState;
		}

		const parsed = parseManifest(fetched.body, this.baseUrl);
		if (parsed.pages.length === 0) {
			throw new DocsError('The published llms.txt did not contain any guide pages.', 'MANIFEST_EMPTY');
		}

		const suggestions = new DocsSearch(
			parsed.pages.map((page) => ({ ...page, body: '', plain: '', headings: [] })),
		);

		this.manifestState = { ...parsed, fetched, suggestions };
		return this.manifestState;
	}

	async corpus() {
		const manifest = await this.manifest();
		const fetched = await this.client.get('llms-full.txt', {
			ttlMs: this.ttl('corpus'),
			accept: 'text/plain, text/markdown;q=0.9, */*;q=0.1',
		});
		if (
			this.corpusState &&
			this.corpusState.fetched.fetchedAt === fetched.fetchedAt &&
			this.corpusState.manifestFetchedAt === manifest.fetched.fetchedAt
		) {
			return this.corpusState;
		}

		const parsed = parseFullText(
			fetched.body,
			this.baseUrl,
			new Set(manifest.pages.map((page) => page.slug)),
		);
		if (parsed.pages.length === 0) {
			throw new DocsError('The published llms-full.txt did not contain any guide pages.', 'CORPUS_EMPTY');
		}

		for (const page of parsed.pages) {
			const summary = manifest.bySlug.get(page.slug);
			if (!summary) continue;
			page.title = summary.title;
			page.description = summary.description;
			page.section = summary.section;
			page.sectionLabel = summary.sectionLabel;
			page.order = summary.order;
			page.url = summary.url;
			page.markdownUrl = summary.markdownUrl;
		}

		this.corpusState = {
			...parsed,
			fetched,
			manifestFetchedAt: manifest.fetched.fetchedAt,
			search: new DocsSearch(parsed.pages),
			related: new DocsRelated(parsed.pages),
		};
		return this.corpusState;
	}

	unknownPage(input, manifest) {
		const suggestions = manifest?.suggestions?.suggestSlugs(input) ?? [];
		const suggestionText =
			suggestions.length > 0 ? ` Did you mean ${suggestions.map((slug) => `"${slug}"`).join(', ')}?` : '';
		return new DocsError(
			`Unknown page "${input}".${suggestionText} Call list_pages to browse the published guide.`,
			'UNKNOWN_PAGE',
		);
	}

	async page(slug) {
		const normalized = normalizeSlug(slug);
		if (normalized === 'reference/baseline') {
			throw new DocsError(
				'The baseline is published as structured data. Call get_baseline instead.',
				'USE_GET_BASELINE',
			);
		}

		const manifest = await this.manifest();
		if (!manifest.bySlug.has(normalized)) throw this.unknownPage(normalized, manifest);

		const fetched = await this.client.get(`${normalized}.md`, {
			ttlMs: this.ttl('page'),
			accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1',
		});
		return withMeta(pageResult(parsePage(fetched.body, normalized, this.baseUrl)), fetched);
	}

	async list({ section } = {}) {
		const manifest = await this.manifest();
		return withMeta(
			{
				...listPages(manifest.pages, section),
				order: 'Published index order: alphabetical within a section, not the sidebar order.',
			},
			manifest.fetched,
		);
	}

	async search({ query, limit, section }) {
		const corpus = await this.corpus();
		return withMeta(corpus.search.search({ query, limit, section }), corpus.fetched);
	}

	async related(slug, limit) {
		const normalized = normalizeSlug(slug);
		if (normalized === 'reference/baseline') {
			throw new DocsError(
				'The baseline is published as structured data. Call get_baseline instead.',
				'USE_GET_BASELINE',
			);
		}

		const corpus = await this.corpus();
		const page = corpus.bySlug.get(normalized);
		if (!page) throw this.unknownPage(normalized, await this.manifest());
		return withMeta(corpus.related.forPage(page, limit), corpus.fetched);
	}

	async baseline() {
		const fetched = await this.client.get('reference/baseline.json', {
			ttlMs: this.ttl('baseline'),
			accept: 'application/json, text/plain;q=0.9, */*;q=0.1',
		});
		return withMeta(parseBaseline(fetched.body, this.baseUrl), fetched);
	}
}
