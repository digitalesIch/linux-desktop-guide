import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_URL, SITE_URL } from '../../../site.config.mjs';

export * from '../../docs-core/sections.mjs';

const libraryDirectory = dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = resolve(libraryDirectory, '..', '..', '..');
export const DOCS_ROOT = join(PROJECT_ROOT, 'src', 'content', 'docs');
export const BASELINE_PATH = join(PROJECT_ROOT, 'src', 'data', 'baseline.json');
export const ASTRO_CONFIG_PATH = join(PROJECT_ROOT, 'astro.config.mjs');

/**
 * Absolute base for links returned to agents, so they work without the
 * caller knowing the project path. Defaults to the configured public site.
 */
export const PUBLIC_BASE_URL = new URL(BASE_URL, `${SITE_URL}/`).href;
