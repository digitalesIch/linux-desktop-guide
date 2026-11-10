import { DocsError } from '../../../tools/docs-mcp/lib/errors.mjs';
import { DocsRelated } from '../../../tools/docs-mcp/lib/related.mjs';
import { DocsSearch } from '../../../tools/docs-mcp/lib/search.mjs';
import { SECTION_LABELS, SECTION_ORDER } from '../../../tools/docs-mcp/lib/sections.mjs';

const KNOWN_SECTIONS = new Set(SECTION_ORDER);

export function createDocsApi(pages, baseline) {
	const bySlug = new Map(pages.map((page) => [page.slug, page]));
	const search = new DocsSearch(pages);
	const related = new DocsRelated(pages);

	function normalizeSlug(input) {
		let value = String(input ?? '').trim();
		if (value.startsWith('docs://page/')) value = value.slice('docs://page/'.length);
		value = value.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.md$/, '');

		if (!value) throw new DocsError('A page slug is required.', 'INVALID_SLUG');
		if (value.includes('..') || value.includes('\\') || value.startsWith('/') || /^[A-Za-z]:/.test(value)) {
			throw new DocsError('Invalid page slug: path traversal and absolute paths are rejected.', 'INVALID_SLUG');
		}

		const parts = value.split('/');
		if (parts.length < 2 || !parts.every((part) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part))) {
			throw new DocsError('Invalid page slug: use a canonical slug such as "start/why-linux".', 'INVALID_SLUG');
		}
		if (!KNOWN_SECTIONS.has(parts[0])) {
			throw new DocsError(
				`Unknown section "${parts[0]}". Available sections: ${SECTION_ORDER.join(', ')}.`,
				'UNKNOWN_SECTION',
			);
		}

		return value;
	}

	function requirePage(input) {
		const normalized = normalizeSlug(input);
		const page = bySlug.get(normalized);
		if (page) return page;

		if (normalized === 'reference/baseline') {
			throw new DocsError(
				'The baseline page is MDX and is not indexed as a Markdown page. Use get_baseline for the validated platform data, or read /reference/baseline/ on the site.',
				'BASELINE_PAGE',
			);
		}

		const suggestions = search.suggestSlugs(normalized);
		const suggestionText =
			suggestions.length > 0 ? ` Did you mean ${suggestions.map((entry) => `"${entry}"`).join(', ')}?` : '';
		throw new DocsError(
			`Unknown page "${input}".${suggestionText} Call list_pages to browse valid slugs.`,
			'UNKNOWN_PAGE',
		);
	}

	function pageResult(page) {
		return {
			slug: page.slug,
			title: page.title,
			description: page.description,
			section: page.sectionLabel,
			url: `/${page.slug}/`,
			markdownPath: `/${page.slug}.md`,
			source: page.source,
			wordCount: page.wordCount,
			headings: page.headings,
			content: page.body,
		};
	}

	function pageSummary(page) {
		return {
			slug: page.slug,
			title: page.title,
			description: page.description,
			section: page.sectionLabel,
			url: `/${page.slug}/`,
		};
	}

	function listPages(section) {
		if (section && !KNOWN_SECTIONS.has(section)) {
			throw new DocsError(
				`Unknown section "${section}". Available sections: ${SECTION_ORDER.join(', ')}.`,
				'UNKNOWN_SECTION',
			);
		}

		const filtered = section ? pages.filter((page) => page.section === section) : pages;
		const sections = [];

		for (const id of SECTION_ORDER) {
			const items = filtered.filter((page) => page.section === id);
			if (items.length === 0) continue;
			sections.push({
				id,
				label: SECTION_LABELS[id],
				pages: items.map(pageSummary),
			});
		}

		return {
			count: filtered.length,
			sections,
			...(!section || section === 'reference'
				? { note: 'The reference baseline page is exposed as structured data through get_baseline.' }
				: {}),
		};
	}

	return {
		pageCount: pages.length,
		normalizeSlug,
		searchDocs: (options) => search.search(options),
		getPage: (slug) => pageResult(requirePage(slug)),
		listPages: ({ section } = {}) => listPages(section),
		getRelated: (slug, limit = 5) => related.forPage(requirePage(slug), limit),
		getBaseline: () => baseline,
	};
}

export { DocsError };
