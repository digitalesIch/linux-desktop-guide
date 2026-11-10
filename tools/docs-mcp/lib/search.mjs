import MiniSearch from 'minisearch';
import { SECTION_LABELS, SECTION_ORDER } from './config.mjs';
import { DocsError } from './errors.mjs';
import { makeExcerpt, matchingHeadings, normalizeSearchText, queryTerms } from './text.mjs';

function round(value) {
	return Math.round(value * 1000) / 1000;
}

export class DocsSearch {
	constructor(pages) {
		this.pages = pages;
		this.bySlug = new Map(pages.map((page) => [page.slug, page]));
		this.index = new MiniSearch({
			idField: 'slug',
			fields: ['title', 'description', 'headings', 'body', 'slug'],
			storeFields: ['slug', 'section'],
		});

		this.index.addAll(
			pages.map((page) => ({
				slug: page.slug,
				title: normalizeSearchText(page.title),
				description: normalizeSearchText(page.description),
				headings: normalizeSearchText(page.headings.map((heading) => heading.text).join(' ')),
				body: normalizeSearchText(page.body),
				section: page.section,
			})),
		);
	}

	search({ query, limit = 8, section } = {}) {
		const trimmed = String(query ?? '').trim();
		if (!trimmed) {
			throw new DocsError('Search query must not be empty.', 'INVALID_QUERY');
		}
		if (section && !SECTION_LABELS[section]) {
			throw new DocsError(
				`Unknown section "${section}". Available sections: ${SECTION_ORDER.join(', ')}.`,
				'UNKNOWN_SECTION',
			);
		}

		const terms = queryTerms(trimmed);
		const prepared = terms.join(' ');
		if (!prepared) {
			throw new DocsError('Search query must contain at least one searchable word.', 'INVALID_QUERY');
		}

		const options = {
			boost: { title: 3, description: 2, headings: 1.5, slug: 1.25 },
			prefix: true,
			fuzzy: (term) => (term.length > 4 ? 0.2 : false),
			combineWith: 'OR',
			filter: section ? (result) => result.section === section : undefined,
		};

		const matches = this.index.search(prepared, options);

		const results = matches.slice(0, limit).map((match) => {
			const page = this.bySlug.get(match.id);
			return {
				slug: page.slug,
				title: page.title,
				description: page.description,
				section: page.sectionLabel,
				url: `/${page.slug}/`,
				score: round(match.score),
				excerpt: makeExcerpt(page.plain, terms),
				headings: matchingHeadings(page.headings, terms),
			};
		});

		const hints = [];
		if (/\b(baseline|version|versions|support window|support windows)\b/i.test(trimmed)) {
			hints.push('For validated platform versions and support windows, call get_baseline.');
		}
		if (results.length === 0) {
			hints.push('Try fewer or broader words, remove the section filter, or call list_pages to browse the guide.');
		}

		return {
			query: trimmed,
			...(section ? { section } : {}),
			total: matches.length,
			returned: results.length,
			results,
			...(hints.length > 0 ? { hint: hints.join(' ') } : {}),
		};
	}

	suggestSlugs(input, limit = 3) {
		const terms = queryTerms(input);
		const query = terms.join(' ') || String(input ?? '').trim();
		if (!query) return [];

		try {
			return this.index
				.search(query, {
					boost: { title: 3, slug: 2, description: 1, headings: 1, body: 0.5 },
					prefix: true,
					fuzzy: (term) => (term.length > 4 ? 0.25 : false),
					combineWith: 'OR',
				})
				.slice(0, limit)
				.map((match) => match.id);
		} catch {
			return [];
		}
	}
}
