import { parse as parseYaml } from 'yaml';
import { DocsError } from './errors.mjs';

const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

export const STOPWORDS = new Set([
	'a',
	'an',
	'and',
	'app',
	'apps',
	'application',
	'applications',
	'are',
	'as',
	'at',
	'be',
	'been',
	'being',
	'by',
	'can',
	'could',
	'did',
	'do',
	'does',
	'doing',
	'for',
	'from',
	'had',
	'has',
	'have',
	'having',
	'he',
	'her',
	'here',
	'him',
	'his',
	'how',
	'i',
	'if',
	'in',
	'into',
	'is',
	'it',
	'its',
	'just',
	'me',
	'more',
	'most',
	'my',
	'no',
	'nor',
	'not',
	'of',
	'on',
	'or',
	'our',
	'out',
	'over',
	'she',
	'so',
	'some',
	'such',
	'than',
	'that',
	'the',
	'their',
	'them',
	'then',
	'there',
	'these',
	'they',
	'this',
	'those',
	'through',
	'to',
	'too',
	'under',
	'up',
	'very',
	'was',
	'we',
	'were',
	'what',
	'when',
	'where',
	'which',
	'while',
	'who',
	'why',
	'will',
	'with',
	'would',
	'you',
	'your',
]);

/**
 * Split YAML frontmatter from a Markdown document.
 * The file name is only used to produce a useful parse error.
 */
export function splitFrontmatter(source, file = 'document') {
	const match = source.match(FRONTMATTER);
	if (!match) return { data: {}, body: source };

	let data;
	try {
		data = parseYaml(match[1]);
	} catch (error) {
		throw new DocsError(`Invalid frontmatter in ${file}: ${error.message}`, 'INVALID_FRONTMATTER', {
			cause: error,
		});
	}

	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		throw new DocsError(`Frontmatter in ${file} must be a YAML mapping.`, 'INVALID_FRONTMATTER');
	}

	return { data, body: source.slice(match[0].length) };
}

/**
 * Remove inline Markdown syntax while keeping the readable text.
 */
export function stripInlineMarkdown(value) {
	return String(value)
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/[*_~]{1,3}/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Extract ATX headings from Markdown, ignoring fenced code blocks.
 */
export function extractHeadings(markdown) {
	const headings = [];
	let fence = null;

	for (const line of markdown.split(/\r?\n/)) {
		const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
		if (fenceMatch) {
			if (!fence) fence = fenceMatch[1][0];
			else if (fenceMatch[1][0] === fence) fence = null;
			continue;
		}
		if (fence) continue;

		const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
		if (match) {
			headings.push({
				depth: match[1].length,
				text: stripInlineMarkdown(match[2]),
			});
		}
	}

	return headings;
}

/**
 * Collect internal links from Markdown links and HTML anchors.
 * The caller resolves them against the indexed slugs.
 */
export function extractLinks(markdown) {
	const links = new Set();
	const markdownLinks = /\[[^\]]*\]\(([^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'))?\)/g;
	const htmlLinks = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;

	for (const regex of [markdownLinks, htmlLinks]) {
		for (const match of markdown.matchAll(regex)) {
			const href = match[1];
			if (!href || !href.startsWith('/') || href.startsWith('//')) continue;
			links.add(href);
		}
	}

	return [...links];
}

/**
 * Convert Markdown to a compact prose string for excerpts and similarity.
 * Fenced code is removed; search still indexes the raw body.
 */
export function markdownToPlain(markdown) {
	return String(markdown)
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/~~~[\s\S]*?~~~/g, ' ')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<\/?(?:a|abbr|article|aside|b|blockquote|br|code|dd|details|div|dl|dt|em|figcaption|figure|h[1-6]|hr|i|img|kbd|li|main|nav|ol|p|pre|s|section|small|source|span|strong|sub|summary|sup|table|tbody|td|th|thead|time|tr|u|ul|video)\b[^>]*>/gi, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, '')
		.replace(/^[ \t]*\|?[ \t:|-]+\|?[ \t]*$/gm, ' ')
		.replace(/\|/g, ' ')
		.replace(/^:::[a-z]+(?:\[[^\]]*\])?$/gim, ' ')
		.replace(/[*_~]{1,3}/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

export function countWords(plain) {
	if (!plain) return 0;
	return plain.split(/\s+/).filter(Boolean).length;
}

/**
 * Fold spellings that MiniSearch would otherwise split into different tokens.
 */
export function normalizeSearchText(value) {
	return String(value).replace(/\bD[-\s]?Bus\b/gi, 'dbus');
}

/**
 * Query terms used for MiniSearch and excerpts.
 */
export function queryTerms(query) {
	const raw = normalizeSearchText(query).toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_'.-]*/gu) ?? [];
	const meaningful = raw.filter((term) => term.length > 1 && !STOPWORDS.has(term));
	return meaningful.length > 0 ? meaningful : raw.filter(Boolean);
}

/**
 * Terms used for related-page similarity. Plurals are folded lightly.
 */
export function topicTerms(text) {
	const raw = String(text).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
	return raw
		.filter((term) => !STOPWORDS.has(term))
		.map((term) => (term.length > 4 && term.endsWith('s') ? term.slice(0, -1) : term));
}

function termVariants(term) {
	const lower = String(term).toLowerCase();
	if (lower === 'dbus') return ['dbus', 'd-bus', 'd bus'];
	return [lower];
}

export function makeExcerpt(plain, terms, maxLength = 240) {
	if (!plain) return '';

	const lower = plain.toLowerCase();
	let index = -1;

	for (const term of terms) {
		for (const variant of termVariants(term)) {
			const found = lower.indexOf(variant);
			if (found !== -1 && (index === -1 || found < index)) index = found;
		}
	}

	if (index === -1) index = 0;

	let start = Math.max(0, index - Math.floor(maxLength * 0.35));
	let end = Math.min(plain.length, start + maxLength);

	if (end - start < maxLength) start = Math.max(0, end - maxLength);

	if (start > 0) {
		const space = plain.indexOf(' ', start);
		if (space !== -1 && space < index) start = space + 1;
	}

	if (end < plain.length) {
		const space = plain.lastIndexOf(' ', end);
		if (space !== -1 && space > index) end = space;
	}

	let text = plain.slice(start, end).trim();
	if (start > 0) text = `…${text}`;
	if (end < plain.length) text = `${text}…`;
	return text;
}

export function matchingHeadings(headings, terms, limit = 3) {
	return headings
		.filter((heading) => {
			const text = heading.text.toLowerCase();
			return terms.some((term) => termVariants(term).some((variant) => text.includes(variant)));
		})
		.slice(0, limit)
		.map((heading) => heading.text);
}
