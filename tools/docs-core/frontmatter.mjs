import { parse as parseYaml } from 'yaml';
import { DocsError } from './errors.mjs';

const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

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
