import { DocsError } from './errors.mjs';
import { SECTION_LABELS, SECTION_ORDER } from './sections.mjs';
import { markdownUrl, pageUrl } from './slug.mjs';

export function pageSummary(page) {
	return {
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.sectionLabel,
		url: page.url ?? pageUrl(page.slug),
	};
}

export function pageResult(page) {
	return {
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.sectionLabel,
		url: page.url ?? pageUrl(page.slug),
		markdownPath: page.markdownUrl ?? markdownUrl(page.slug),
		...(page.source ? { source: page.source } : {}),
		wordCount: page.wordCount,
		headings: page.headings.map(({ depth, text }) => ({ depth, text })),
		content: page.body,
	};
}

export function listPages(pages, section) {
	if (section && !SECTION_LABELS[section]) {
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
