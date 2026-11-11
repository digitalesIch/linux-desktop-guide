import { DocsError } from '../../docs-core/errors.mjs';
import { SECTION_LABELS, SECTION_ORDER } from '../../docs-core/sections.mjs';
import { linkToSlug, normalizeSlug } from '../../docs-core/slug.mjs';
import {
	countWords,
	extractHeadings,
	extractLinks,
	markdownToPlain,
} from '../../docs-core/text.mjs';

const SECTION_BY_LABEL = new Map(Object.entries(SECTION_LABELS).map(([id, label]) => [label, id]));
const MANIFEST_LINK = /^- \[(.+?)\]\((\S+?)\)(?::\s*(.*))?$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Parse the generated frontmatter. The build writes JSON-stringified scalar
 * values, so a small parser is enough and keeps the package free of YAML.
 */
function parsePublishedFrontmatter(source) {
	const match = String(source).match(FRONTMATTER);
	if (!match) return { data: {}, body: String(source) };

	const data = {};
	for (const line of match[1].split(/\r?\n/)) {
		const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!field) continue;

		const raw = field[2].trim();
		if (raw.startsWith('"')) {
			try {
				data[field[1]] = JSON.parse(raw);
			} catch {
				data[field[1]] = raw;
			}
		} else if (raw === 'true' || raw === 'false') {
			data[field[1]] = raw === 'true';
		} else {
			data[field[1]] = raw;
		}
	}

	return { data, body: String(source).slice(match[0].length) };
}

function sectionFor(slug) {
	const section = slug.split('/')[0] ?? 'root';
	return { section, sectionLabel: SECTION_LABELS[section] ?? section };
}

/**
 * Resolve a published URL to a canonical slug. Returns null for the home page,
 * the 404 page, and URLs outside the configured base.
 */
export function slugFromUrl(input, baseUrl) {
	let url;
	let base;
	try {
		base = new URL(baseUrl);
		url = new URL(input, base);
	} catch {
		return null;
	}

	if (url.origin !== base.origin) return null;
	if (!url.pathname.startsWith(base.pathname)) return null;

	let path = url.pathname.slice(base.pathname.length);
	path = path.replace(/\.md$/, '').replace(/\/+$/, '');
	if (!path) return null;

	try {
		return normalizeSlug(path);
	} catch {
		return null;
	}
}

function pageUrls(slug, baseUrl) {
	return {
		url: new URL(`${slug}/`, baseUrl).href,
		markdownUrl: new URL(`${slug}.md`, baseUrl).href,
	};
}

/**
 * Parse llms.txt into page summaries. Unknown sections and the Optional block
 * are ignored.
 */
export function parseManifest(text, baseUrl) {
	const pages = [];
	const seen = new Set();
	let section = null;

	for (const line of String(text).split(/\r?\n/)) {
		const heading = line.match(/^##\s+(.+?)\s*$/);
		if (heading) {
			section = SECTION_BY_LABEL.get(heading[1]) ?? null;
			continue;
		}

		if (!section) continue;
		const link = line.match(MANIFEST_LINK);
		if (!link) continue;

		const slug = slugFromUrl(link[2], baseUrl);
		if (!slug || seen.has(slug)) continue;
		seen.add(slug);

		const { sectionLabel } = sectionFor(slug);
		pages.push({
			slug,
			title: link[1].trim(),
			description: (link[3] ?? '').trim(),
			section,
			sectionLabel,
			...pageUrls(slug, baseUrl),
			order: pages.length,
		});
	}

	pages.sort((left, right) => {
		const bySection = SECTION_ORDER.indexOf(left.section) - SECTION_ORDER.indexOf(right.section);
		return bySection !== 0 ? bySection : left.order - right.order;
	});

	return { pages, bySlug: new Map(pages.map((page) => [page.slug, page])) };
}

/**
 * Split the generated full text into pages and build the objects the shared
 * search and related-page modules expect.
 */
export function parseFullText(text, baseUrl, allowedSlugs) {
	const blocks = String(text).split(/\n---\n\n(?=# )/);
	const pages = [];

	for (const block of blocks) {
		const lines = block.trimStart().split(/\r?\n/);
		const titleMatch = lines[0]?.match(/^#\s+(.+?)\s*$/);
		if (!titleMatch) continue;

		const urlIndex = lines.findIndex((line) => /^URL:\s+/.test(line));
		if (urlIndex === -1) continue;

		const slug = slugFromUrl(lines[urlIndex].replace(/^URL:\s+/, '').trim(), baseUrl);
		if (!slug) continue;
		if (allowedSlugs && !allowedSlugs.has(slug)) continue;

		let description = '';
		let bodyStart = urlIndex + 1;
		while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart += 1;
		if (/^>\s?/.test(lines[bodyStart] ?? '')) {
			description = lines[bodyStart].replace(/^>\s?/, '').trim();
			bodyStart += 1;
		}

		const normalized = lines.slice(bodyStart).join('\n').replaceAll(baseUrl, '/');
		const body = normalized.trim();
		const plain = markdownToPlain(body);
		const { section, sectionLabel } = sectionFor(slug);

		pages.push({
			slug,
			title: titleMatch[1],
			description,
			section,
			sectionLabel,
			body,
			plain,
			headings: extractHeadings(body),
			links: [],
			wordCount: countWords(plain),
			order: pages.length,
			...pageUrls(slug, baseUrl),
		});
	}

	const bySlug = new Map(pages.map((page) => [page.slug, page]));
	for (const page of pages) {
		const links = extractLinks(page.body);
		page.links = [...new Set(links.map((href) => linkToSlug(href, bySlug)).filter(Boolean))].filter(
			(slug) => slug !== page.slug,
		);
	}

	return { pages, bySlug };
}

/**
 * Parse one published .md route: frontmatter, title, description, headings,
 * and the body without the duplicated heading and summary.
 */
export function parsePage(text, slug, baseUrl) {
	const { data, body: rawBody } = parsePublishedFrontmatter(text);
	const title = typeof data.title === 'string' ? data.title.trim() : '';
	const description = typeof data.description === 'string' ? data.description.trim() : '';

	let body = rawBody.trimStart();
	const heading = body.match(/^#\s+(.+?)\r?\n+/);
	if (heading && (title === '' || heading[1].trim() === title)) {
		body = body.slice(heading[0].length);
	}

	const quote = body.match(/^>\s+(.+?)\r?\n+/);
	if (quote && description !== '' && quote[1].trim() === description) {
		body = body.slice(quote[0].length);
	}

	body = body.trim();
	const plain = markdownToPlain(body);
	const resolvedTitle = title || heading?.[1]?.trim() || slug;
	const { section, sectionLabel } = sectionFor(slug);

	return {
		slug,
		title: resolvedTitle,
		description,
		section,
		sectionLabel,
		body,
		plain,
		headings: extractHeadings(body),
		links: [],
		wordCount: countWords(plain),
		order: 0,
		...pageUrls(slug, baseUrl),
	};
}

export function parseBaseline(text, url) {
	let data;
	try {
		data = JSON.parse(text);
	} catch (error) {
		throw new DocsError(`The published baseline at ${url} is not valid JSON: ${error.message}`, 'BASELINE_INVALID', {
			cause: error,
		});
	}

	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		throw new DocsError(`The published baseline at ${url} must be a JSON object.`, 'BASELINE_INVALID');
	}
	return data;
}
