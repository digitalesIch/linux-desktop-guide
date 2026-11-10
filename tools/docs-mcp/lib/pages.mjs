import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { EXCLUDED_SLUGS, SECTION_LABELS, SECTION_ORDER } from './sections.mjs';
import { DocsError } from './errors.mjs';
import {
	countWords,
	extractHeadings,
	extractLinks,
	markdownToPlain,
	splitFrontmatter,
} from './text.mjs';

const SLUG_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KNOWN_SECTIONS = new Set(SECTION_ORDER);

export function walkMarkdownFiles(root) {
	const files = [];

	const visit = (directory) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const path = join(directory, entry.name);
			if (entry.isDirectory()) visit(path);
			else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path);
		}
	};

	visit(root);
	return files.sort();
}

/**
 * A cheap change detector: relative path, mtime, and size for every source.
 */
export function sourceSignature(root) {
	return walkMarkdownFiles(root)
		.map((path) => {
			const name = relative(root, path).split(sep).join('/');
			try {
				const stat = statSync(path);
				return `${name}:${stat.mtimeMs}:${stat.size}`;
			} catch {
				return `${name}:missing`;
			}
		})
		.join('|');
}

export function slugFromFile(root, path) {
	const slug = relative(root, path)
		.split(sep)
		.join('/')
		.replace(/\.md$/, '');
	if (slug === 'index') return null;
	return slug.endsWith('/index') ? slug.slice(0, -'/index'.length) : slug;
}

/**
 * Canonicalize a page slug and reject anything that could become a path.
 */
export function normalizeSlug(input) {
	if (typeof input !== 'string') {
		throw new DocsError('Page slug must be a string.', 'INVALID_SLUG');
	}

	let slug = input.trim();
	if (!slug) throw new DocsError('Page slug must not be empty.', 'INVALID_SLUG');

	if (slug.startsWith('docs://page/')) slug = slug.slice('docs://page/'.length);
	else if (slug.startsWith('docs://')) slug = slug.slice('docs://'.length);

	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(slug)) {
		throw new DocsError(`Invalid page slug "${input}".`, 'INVALID_SLUG');
	}

	if (slug.includes('\\')) {
		throw new DocsError(`Invalid page slug "${input}": backslashes are not allowed.`, 'INVALID_SLUG');
	}

	slug = slug.replace(/^\/+/, '').replace(/\/+$/, '');
	slug = slug.replace(/\/+$/, '');
	if (slug.endsWith('.md')) slug = slug.slice(0, -3);
	slug = slug.replace(/\/+$/, '');

	if (!slug) throw new DocsError('Page slug must identify a page.', 'INVALID_SLUG');

	const segments = slug.split('/');
	if (segments.some((segment) => !SLUG_SEGMENT.test(segment))) {
		throw new DocsError(
			`Invalid page slug "${input}". Use a canonical slug such as start/why-linux.`,
			'INVALID_SLUG',
		);
	}

	if (!KNOWN_SECTIONS.has(segments[0])) {
		throw new DocsError(
			`Invalid page slug "${input}". The first segment must be one of: ${SECTION_ORDER.join(', ')}.`,
			'INVALID_SLUG',
		);
	}

	return slug;
}

export function pageUrl(slug) {
	return `/${slug}/`;
}

export function markdownUrl(slug) {
	return `/${slug}.md`;
}

function readSidebarOrder(path) {
	const order = new Map();
	if (!path) return order;

	try {
		const source = readFileSync(path, 'utf8');
		for (const match of source.matchAll(/slug:\s*['"]([^'"]+)['"]/g)) {
			if (!order.has(match[1])) order.set(match[1], order.size);
		}
	} catch {
		// The sidebar is an ordering hint, not a requirement.
	}

	return order;
}

function linkToSlug(href, bySlug) {
	let path;
	try {
		path = decodeURIComponent(href);
	} catch {
		path = href;
	}

	path = path.split('#')[0].split('?')[0];
	if (!path.startsWith('/')) return null;

	try {
		const slug = normalizeSlug(path);
		return bySlug.has(slug) ? slug : null;
	} catch {
		return null;
	}
}

function comparePages(a, b) {
	const sectionA = SECTION_ORDER.indexOf(a.section);
	const sectionB = SECTION_ORDER.indexOf(b.section);
	if (sectionA !== sectionB) return sectionA - sectionB;
	if (a.order !== b.order) return a.order - b.order;
	return a.title.localeCompare(b.title);
}

/**
 * Load every guide page. Only Markdown files are indexed; the 404 page is
 * excluded because it is not part of the guide.
 */
export function loadPages({ docsRoot, sidebarPath } = {}) {
	if (!docsRoot) throw new DocsError('A docs root is required.', 'NO_DOCS_ROOT');

	const sidebarOrder = readSidebarOrder(sidebarPath);
	const files = walkMarkdownFiles(docsRoot);
	const pages = [];

	for (const file of files) {
		const slug = slugFromFile(docsRoot, file);
		if (!slug || EXCLUDED_SLUGS.has(slug)) continue;

		const source = readFileSync(file, 'utf8');
		const { data, body } = splitFrontmatter(source, relative(docsRoot, file));
		const headings = extractHeadings(body);
		const plain = markdownToPlain(body);
		const section = slug.split('/')[0] ?? 'root';
		const title =
			typeof data.title === 'string' && data.title.trim()
				? data.title.trim()
				: headings.find((heading) => heading.depth === 1)?.text || slug;
		const description = typeof data.description === 'string' ? data.description.trim() : '';
		const contentPath = relative(dirname(docsRoot), file).split(sep).join('/');

		pages.push({
			slug,
			title,
			description,
			section,
			sectionLabel: SECTION_LABELS[section] ?? section,
			body,
			plain,
			headings,
			links: extractLinks(body),
			wordCount: countWords(plain),
			order: sidebarOrder.get(slug) ?? Number.MAX_SAFE_INTEGER,
			source: `src/content/${contentPath}`,
		});
	}

	const bySlug = new Map(pages.map((page) => [page.slug, page]));

	for (const page of pages) {
		page.links = [...new Set(page.links.map((href) => linkToSlug(href, bySlug)).filter(Boolean))].filter(
			(slug) => slug !== page.slug,
		);
	}

	pages.sort(comparePages);
	return { pages, bySlug: new Map(pages.map((page) => [page.slug, page])) };
}

export function pageSummary(page) {
	return {
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.sectionLabel,
		url: pageUrl(page.slug),
	};
}

export function pageResult(page) {
	return {
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.sectionLabel,
		url: pageUrl(page.slug),
		markdownPath: markdownUrl(page.slug),
		source: page.source,
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
