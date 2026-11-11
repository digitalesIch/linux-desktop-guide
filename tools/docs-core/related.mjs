import { DocsError } from './errors.mjs';
import { topicTerms } from './text.mjs';

const RELATED_STOPWORDS = new Set([
	'also',
	'app',
	'apps',
	'application',
	'applications',
	'best',
	'build',
	'building',
	'code',
	'desktop',
	'ecosystem',
	'guide',
	'linux',
	'good',
	'great',
	'like',
	'make',
	'makes',
	'many',
	'much',
	'need',
	'needs',
	'new',
	'one',
	'often',
	'page',
	'pages',
	'project',
	'projects',
	'section',
	'shall',
	'should',
	'two',
	'use',
	'user',
	'users',
	'using',
	'way',
	'ways',
	'well',
	'work',
	'works',
]);

function topicWeights(text, weight, target) {
	for (const term of topicTerms(text)) {
		if (RELATED_STOPWORDS.has(term)) continue;
		target.set(term, (target.get(term) ?? 0) + weight);
	}
}

function buildVectors(pages) {
	const frequencies = pages.map((page) => {
		const terms = new Map();
		topicWeights(page.title, 3, terms);
		topicWeights(page.description, 2, terms);
		topicWeights(page.headings.map((heading) => heading.text).join(' '), 1.5, terms);
		topicWeights(page.plain, 1, terms);
		return terms;
	});

	const documentFrequency = new Map();
	for (const terms of frequencies) {
		for (const term of terms.keys()) {
			documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
		}
	}

	const vectors = new Map();
	for (const [index, page] of pages.entries()) {
		const vector = new Map();
		let norm = 0;

		for (const [term, frequency] of frequencies[index]) {
			const inverseDocumentFrequency =
				Math.log((pages.length + 1) / ((documentFrequency.get(term) ?? 0) + 1)) + 1;
			const value = (1 + Math.log(frequency)) * inverseDocumentFrequency;
			vector.set(term, value);
			norm += value * value;
		}

		norm = Math.sqrt(norm) || 1;
		for (const [term, value] of vector) vector.set(term, value / norm);
		vectors.set(page.slug, vector);
	}

	return vectors;
}

function cosine(a, b) {
	let dot = 0;
	const [small, large] = a.size <= b.size ? [a, b] : [b, a];
	for (const [term, value] of small) {
		const other = large.get(term);
		if (other) dot += value * other;
	}
	return dot;
}

function sharedTopics(a, b, limit) {
	const shared = [];
	const [small, large] = a.size <= b.size ? [a, b] : [b, a];

	for (const [term, value] of small) {
		const other = large.get(term);
		if (other) shared.push([term, Math.min(value, other)]);
	}

	return shared
		.sort((left, right) => right[1] - left[1])
		.slice(0, limit)
		.map(([term]) => term);
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}

export class DocsRelated {
	constructor(pages) {
		this.pages = pages;
		this.vectors = buildVectors(pages);
	}

	forPage(page, limit = 5) {
		if (!page) throw new DocsError('A page is required.', 'UNKNOWN_PAGE');

		const sourceVector = this.vectors.get(page.slug);
		const scored = [];

		for (const other of this.pages) {
			if (other.slug === page.slug) continue;

			const otherVector = this.vectors.get(other.slug);
			let score = cosine(sourceVector, otherVector);
			const linkedFromPage = page.links.includes(other.slug);
			const linksToPage = other.links.includes(page.slug);

			if (linkedFromPage && linksToPage) score += 0.18;
			else if (linkedFromPage || linksToPage) score += 0.1;
			if (page.section === other.section) score += 0.05;

			const topics = sharedTopics(sourceVector, otherVector, 3);
			if (score <= 0 && topics.length === 0) continue;

			scored.push({ page: other, score, linkedFromPage, linksToPage, topics });
		}

		scored.sort((left, right) => right.score - left.score);

		const related = scored.slice(0, limit).map((item) => {
			let reason = 'Related coverage';
			if (item.linkedFromPage && item.linksToPage) reason = 'Cross-references this page';
			else if (item.linkedFromPage) reason = 'Linked from this page';
			else if (item.linksToPage) reason = 'Links to this page';
			else if (page.section === item.page.section) reason = `Same section: ${page.sectionLabel}`;
			else if (item.topics.length > 0) reason = `Shares topics: ${item.topics.join(', ')}`;

			return {
				slug: item.page.slug,
				title: item.page.title,
				description: item.page.description,
				section: item.page.sectionLabel,
				url: item.page.url ?? `/${item.page.slug}/`,
				score: round(item.score),
				reason,
				sharedTopics: item.topics,
			};
		});

		return {
			slug: page.slug,
			title: page.title,
			section: page.sectionLabel,
			url: page.url ?? `/${page.slug}/`,
			related,
		};
	}
}
