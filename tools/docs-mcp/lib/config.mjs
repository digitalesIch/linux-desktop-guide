import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const libraryDirectory = dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = resolve(libraryDirectory, '..', '..', '..');
export const DOCS_ROOT = join(PROJECT_ROOT, 'src', 'content', 'docs');
export const BASELINE_PATH = join(PROJECT_ROOT, 'src', 'data', 'baseline.json');
export const ASTRO_CONFIG_PATH = join(PROJECT_ROOT, 'astro.config.mjs');

export const SERVER_NAME = 'linux-desktop-guide-docs';
export const SERVER_VERSION = '1.0.0';

export const SECTION_LABELS = Object.freeze({
	targets: 'Targets',
	start: 'Start Here',
	platform: 'Platform',
	design: 'Design',
	engineering: 'Engineering',
	ship: 'Ship',
	reference: 'Reference',
});

export const SECTION_ORDER = Object.freeze(Object.keys(SECTION_LABELS));

export const EXCLUDED_SLUGS = new Set(['404']);
