import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { EXCLUDED_SLUGS, SECTION_LABELS, SECTION_ORDER } from '../../docs-core/sections.mjs';
import { DocsError } from '../../docs-core/errors.mjs';
import { linkToSlug, markdownUrl, pageUrl } from '../../docs-core/slug.mjs';
import { splitFrontmatter } from '../../docs-core/frontmatter.mjs';
import {
	countWords,
	extractHeadings,
	extractLinks,
	markdownToPlain,
} from '../../docs-core/text.mjs';
import { PUBLIC_BASE_URL } from './config.mjs';

export { normalizeSlug, pageUrl, markdownUrl } from '../../docs-core/slug.mjs';
export { listPages, pageResult, pageSummary } from '../../docs-core/results.mjs';

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
			url: new URL(`${slug}/`, PUBLIC_BASE_URL).href,
			markdownUrl: new URL(`${slug}.md`, PUBLIC_BASE_URL).href,
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
