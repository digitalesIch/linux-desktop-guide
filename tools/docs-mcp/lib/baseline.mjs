import { readFileSync } from 'node:fs';
import { BASELINE_PATH } from './config.mjs';
import { DocsError } from '../../docs-core/errors.mjs';

export function readBaseline(path = BASELINE_PATH) {
	let source;
	try {
		source = readFileSync(path, 'utf8');
	} catch (error) {
		throw new DocsError(`Could not read baseline data at ${path}: ${error.message}`, 'BASELINE_UNAVAILABLE', {
			cause: error,
		});
	}

	try {
		const data = JSON.parse(source);
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			throw new Error('expected a JSON object');
		}
		return data;
	} catch (error) {
		throw new DocsError(`Could not parse baseline data at ${path}: ${error.message}`, 'BASELINE_INVALID', {
			cause: error,
		});
	}
}
