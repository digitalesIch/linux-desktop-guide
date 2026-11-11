import { SECTION_ORDER } from './sections.mjs';
import { DocsError } from './errors.mjs';

const SLUG_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KNOWN_SECTIONS = new Set(SECTION_ORDER);

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

/**
 * Resolve a Markdown link to an indexed slug.
 */
export function linkToSlug(href, bySlug) {
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
