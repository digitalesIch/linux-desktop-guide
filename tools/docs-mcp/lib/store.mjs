import { DocsError } from './errors.mjs';
import { listPages, loadPages, normalizeSlug, pageResult, sourceSignature } from './pages.mjs';
import { DocsRelated } from './related.mjs';
import { DocsSearch } from './search.mjs';

export class DocsStore {
	constructor({ docsRoot, sidebarPath }) {
		this.docsRoot = docsRoot;
		this.sidebarPath = sidebarPath;
		this.signature = null;
		this.pages = [];
		this.bySlug = new Map();
		this.search = null;
		this.related = null;
		this.refresh(true);
	}

	/**
	 * Rebuild only when a source file's path, mtime, or size changed.
	 */
	refresh(force = false) {
		const signature = sourceSignature(this.docsRoot);
		if (!force && signature === this.signature) return false;

		const { pages, bySlug } = loadPages({
			docsRoot: this.docsRoot,
			sidebarPath: this.sidebarPath,
		});

		this.pages = pages;
		this.bySlug = bySlug;
		this.search = new DocsSearch(pages);
		this.related = new DocsRelated(pages);
		this.signature = signature;
		return true;
	}

	ensureFresh() {
		return this.refresh(false);
	}

	requirePage(slug) {
		const normalized = normalizeSlug(slug);
		const page = this.bySlug.get(normalized);
		if (page) return page;

		if (normalized === 'reference/baseline') {
			throw new DocsError(
				'The baseline page is MDX and is not indexed as a Markdown page. Use get_baseline for the validated platform data, or read /reference/baseline/ on the site.',
				'BASELINE_PAGE',
			);
		}

		const suggestions = this.search?.suggestSlugs(normalized) ?? [];
		const suggestionText =
			suggestions.length > 0 ? ` Did you mean ${suggestions.map((entry) => `"${entry}"`).join(', ')}?` : '';
		throw new DocsError(
			`Unknown page "${slug}".${suggestionText} Call list_pages to browse valid slugs.`,
			'UNKNOWN_PAGE',
		);
	}

	getPage(slug) {
		return pageResult(this.requirePage(slug));
	}

	listPages({ section } = {}) {
		return listPages(this.pages, section);
	}

	getRelated(slug, limit = 5) {
		return this.related.forPage(this.requirePage(slug), limit);
	}

	searchDocs(options) {
		return this.search.search(options);
	}
}
