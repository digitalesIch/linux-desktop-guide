#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readBaseline } from './lib/baseline.mjs';
import { ASTRO_CONFIG_PATH, DOCS_ROOT, SECTION_ORDER, SERVER_NAME, SERVER_VERSION } from './lib/config.mjs';
import { DocsError } from '../docs-core/errors.mjs';
import { DocsStore } from './lib/store.mjs';

const READ_ONLY = Object.freeze({
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: false,
});

const store = new DocsStore({
	docsRoot: DOCS_ROOT,
	sidebarPath: ASTRO_CONFIG_PATH,
});

const server = new McpServer(
	{ name: SERVER_NAME, version: SERVER_VERSION },
	{
		instructions:
			'Read-only offline documentation for the Linux Desktop Guide. Call search_docs first for a topic, then get_page with a returned slug. Use list_pages to browse the guide, get_related after reading a page, and get_baseline for validated Ubuntu, GNOME, GTK, libadwaita, Qt, and packaging versions. All tools read local sources and never modify them.',
	},
);

function textResult(value) {
	return {
		content: [
			{
				type: 'text',
				text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
			},
		],
	};
}

function errorResult(message) {
	return {
		isError: true,
		content: [{ type: 'text', text: message }],
	};
}

function respond(handler, { refresh = true } = {}) {
	return async (args) => {
		try {
			if (refresh) store.ensureFresh();
			return textResult(await handler(args));
		} catch (error) {
			if (error instanceof DocsError) return errorResult(error.message);
			console.error('[docs-mcp] unexpected error:', error);
			return errorResult('The documentation server could not complete this request. See the MCP server logs.');
		}
	};
}

server.registerTool(
	'search_docs',
	{
		title: 'Search documentation',
		description:
			'Search the Linux Desktop Guide. Start here when you need a topic, API, or workflow. Returns ranked pages with a canonical slug, section, URL, score, matching headings, and an excerpt. Pass a returned slug to get_page to read the full Markdown.',
		inputSchema: {
			query: z
				.string()
				.trim()
				.min(1)
				.describe('Words or a question, for example "flatpak portals screen capture".'),
			limit: z
				.number()
				.int()
				.min(1)
				.max(25)
				.default(8)
				.describe('Maximum number of results (1-25, default 8).'),
			section: z
				.enum(SECTION_ORDER)
				.optional()
				.describe('Limit results to one guide section.'),
		},
		annotations: READ_ONLY,
	},
	respond(({ query, limit, section }) => store.searchDocs({ query, limit, section })),
);

server.registerTool(
	'get_page',
	{
		title: 'Read a documentation page',
		description:
			'Read one Linux Desktop Guide page as Markdown. Accepts canonical slugs such as start/why-linux, with an optional leading slash, trailing slash, or .md suffix. Rejects path traversal and unknown pages. Read-only.',
		inputSchema: {
			slug: z.string().min(1).describe('Canonical page slug, for example platform/flatpak-portals.'),
		},
		annotations: READ_ONLY,
	},
	respond(({ slug }) => store.getPage(slug)),
);

server.registerTool(
	'list_pages',
	{
		title: 'List documentation pages',
		description:
			'List indexed Linux Desktop Guide pages grouped by section, in the guide sidebar order. Use this when you do not know a slug or want the full table of contents.',
		inputSchema: {
			section: z
				.enum(SECTION_ORDER)
				.optional()
				.describe('Return only pages from this section.'),
		},
		annotations: READ_ONLY,
	},
	respond(({ section }) => store.listPages({ section })),
);

server.registerTool(
	'get_related',
	{
		title: 'Find related documentation',
		description:
			'Recommend related Linux Desktop Guide pages for a slug, based on internal links, section, and text similarity. Use after reading a page to find the next useful topic.',
		inputSchema: {
			slug: z.string().min(1).describe('Canonical page slug, for example platform/xdg.'),
			limit: z
				.number()
				.int()
				.min(1)
				.max(12)
				.default(5)
				.describe('Maximum number of recommendations (1-12, default 5).'),
		},
		annotations: READ_ONLY,
	},
	respond(({ slug, limit }) => store.getRelated(slug, limit)),
);

server.registerTool(
	'get_baseline',
	{
		title: 'Read the platform baseline',
		description:
			'Return the validated platform baseline from src/data/baseline.json: Ubuntu release and support windows, GNOME, GTK, libadwaita, Qt, KDE, toolchains, packaging runtimes, and site versions. Use this instead of guessing versions.',
		annotations: READ_ONLY,
	},
	respond(() => readBaseline(), { refresh: false }),
);

try {
	console.error(`[docs-mcp] indexed ${store.pages.length} pages from ${DOCS_ROOT}`);
	await server.connect(new StdioServerTransport());
} catch (error) {
	console.error('[docs-mcp] failed to start:', error);
	process.exitCode = 1;
}
