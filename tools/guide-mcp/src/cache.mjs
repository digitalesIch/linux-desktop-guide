import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function isValidEntry(entry, url) {
	return (
		entry &&
		typeof entry === 'object' &&
		entry.url === url &&
		typeof entry.body === 'string' &&
		Number.isFinite(entry.fetchedAt) &&
		(entry.etag === undefined || typeof entry.etag === 'string') &&
		(entry.lastModified === undefined || typeof entry.lastModified === 'string') &&
		(entry.contentType === undefined || typeof entry.contentType === 'string')
	);
}

/**
 * A small JSON cache keyed by request URL. Corrupt or foreign entries are
 * treated as misses, never as errors.
 */
export class Cache {
	constructor({ directory, enabled = true } = {}) {
		if (!directory) throw new Error('A cache directory is required.');
		this.directory = directory;
		this.enabled = enabled;
	}

	entryPath(url) {
		const digest = createHash('sha256').update(url).digest('hex').slice(0, 40);
		return join(this.directory, `${digest}.json`);
	}

	async read(url) {
		if (!this.enabled) return null;
		try {
			const entry = JSON.parse(await readFile(this.entryPath(url), 'utf8'));
			return isValidEntry(entry, url) ? entry : null;
		} catch {
			return null;
		}
	}

	async write(url, entry) {
		if (!this.enabled) return false;
		if (!isValidEntry(entry, url)) throw new Error(`Refusing to cache an invalid entry for ${url}`);

		await mkdir(this.directory, { recursive: true });
		const target = this.entryPath(url);
		const temp = `${target}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
		await writeFile(temp, JSON.stringify(entry), 'utf8');
		await rename(temp, target);
		return true;
	}
}
