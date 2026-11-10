#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readBaseline } from '../tools/docs-mcp/lib/baseline.mjs';
import { ASTRO_CONFIG_PATH, DOCS_ROOT, PROJECT_ROOT } from '../tools/docs-mcp/lib/config.mjs';
import { loadPages } from '../tools/docs-mcp/lib/pages.mjs';
import { SERVER_NAME, SERVER_VERSION } from '../tools/docs-mcp/lib/sections.mjs';

const outputPath = join(PROJECT_ROOT, 'workers', 'docs-mcp', 'src', 'generated', 'docs.json');
const { pages } = loadPages({ docsRoot: DOCS_ROOT, sidebarPath: ASTRO_CONFIG_PATH });

const corpus = {
	generatedAt: new Date().toISOString(),
	server: { name: SERVER_NAME, version: SERVER_VERSION },
	pageCount: pages.length,
	pages: pages.map((page) => ({
		slug: page.slug,
		title: page.title,
		description: page.description,
		section: page.section,
		sectionLabel: page.sectionLabel,
		body: page.body,
		plain: page.plain,
		headings: page.headings.map(({ depth, text }) => ({ depth, text })),
		links: page.links,
		wordCount: page.wordCount,
		source: page.source,
	})),
	baseline: readBaseline(),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(corpus, null, 2)}\n`);

console.log(`Generated ${pages.length} pages for the remote MCP at ${outputPath}`);
