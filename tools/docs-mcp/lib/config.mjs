import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export * from './sections.mjs';

const libraryDirectory = dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = resolve(libraryDirectory, '..', '..', '..');
export const DOCS_ROOT = join(PROJECT_ROOT, 'src', 'content', 'docs');
export const BASELINE_PATH = join(PROJECT_ROOT, 'src', 'data', 'baseline.json');
export const ASTRO_CONFIG_PATH = join(PROJECT_ROOT, 'astro.config.mjs');
