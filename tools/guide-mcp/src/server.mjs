import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DocsError } from '../../docs-core/errors.mjs';
import { SECTION_ORDER } from '../../docs-core/sections.mjs';
import { Cache } from './cache.mjs';
import {
	SERVER_NAME,
	SERVER_VERSION,
	cacheEnabled,
	resolveBaseUrl,
	resolveCacheDir,
} from './config.mjs';
import { SiteClient } from './site.mjs';
import { GuideStore } from './store.mjs';

if (process.argv.includes('--version')) {
	console.log(`${SERVER_NAME} ${SERVER_VERSION}`);
	process.exit(0);
}
if (process.argv.includes('--help')) {
	console.log(`${SERVER_NAME} ${SERVER_VERSION}`);
	console.log('Read-only MCP server for the published Linux Desktop Guide.');
	console.log('Speaks MCP over stdio. Configure LDG_SITE_URL to read another base URL.');
	process.exit(0);
}

const READ_ONLY = Object.freeze({
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: true,
});

let baseUrl;
try {
	baseUrl = resolveBaseUrl();
} catch (error) {
	console.error(`[guide-mcp] ${error.message}`);
	process.exit(1);
}

const cache = cacheEnabled() ? new Cache({ directory: resolveCacheDir() }) : null;
const client = new SiteClient({ baseUrl, cache });
const store = new GuideStore({ client, baseUrl });

const server = new McpServer(
	{ name: SERVER_NAME, version: SERVER_VERSION },
	{
		instructions:
			'Read-only documentation for the published Linux Desktop Guide. Call search_docs first, then get_page with a returned slug. list_pages shows the published index. get_related recommends the next page. get_baseline returns the validated platform data. Results include fetchedAt and stale; stale means the network failed and the cached copy was returned.',
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

function respond(handler) {
	return async (args) => {
		try {
			return textResult(await handler(args));
		} catch (error) {
			if (error instanceof DocsError) return errorResult(error.message);
			console.error('[guide-mcp] unexpected error:', error);
			return errorResult('The published guide server could not complete this request. See the MCP server logs.');
		}
	};
}

server.registerTool(
	'search_docs',
	{
		title: 'Search the published guide',
		description:
			'Search the published Linux Desktop Guide. Returns ranked pages with a canonical slug, section, absolute URL, score, matching headings, and an excerpt. Pass a returned slug to get_page. The result includes fetchedAt and stale.',
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
	respond(({ query, limit, section }) => store.search({ query, limit, section })),
);

server.registerTool(
	'get_page',
	{
		title: 'Read a published page',
		description:
			'Read one published Linux Desktop Guide page as Markdown. Accepts canonical slugs such as start/why-linux, with an optional leading slash, trailing slash, or .md suffix. Rejects path traversal and unknown pages. The baseline page points to get_baseline. The result includes fetchedAt and stale.',
		inputSchema: {
			slug: z.string().min(1).describe('Canonical page slug, for example platform/flatpak-portals.'),
		},
		annotations: READ_ONLY,
	},
	respond(({ slug }) => store.page(slug)),
);

server.registerTool(
	'list_pages',
	{
		title: 'List published pages',
		description:
			'List the published Linux Desktop Guide pages grouped by section, in the order of the published llms.txt index. That order is alphabetical within a section, not the sidebar order. Use this when you do not know a slug or want the table of contents.',
		inputSchema: {
			section: z
				.enum(SECTION_ORDER)
				.optional()
				.describe('Return only pages from this section.'),
		},
		annotations: READ_ONLY,
	},
	respond(({ section }) => store.list({ section })),
);

server.registerTool(
	'get_related',
	{
		title: 'Find related published pages',
		description:
			'Recommend related published Linux Desktop Guide pages for a slug, based on published links, section, and text similarity. Use after reading a page to find the next useful topic.',
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
	respond(({ slug, limit }) => store.related(slug, limit)),
);

server.registerTool(
	'get_baseline',
	{
		title: 'Read the published platform baseline',
		description:
			'Return the validated platform baseline published as reference/baseline.json: Ubuntu release and support windows, GNOME, GTK, libadwaita, Qt, KDE, toolchains, packaging runtimes, and site versions. Use this instead of guessing versions. The result includes fetchedAt and stale.',
		annotations: READ_ONLY,
	},
	respond(() => store.baseline()),
);

try {
	console.error(`[guide-mcp] reading ${baseUrl} (cache ${cache ? resolveCacheDir() : 'disabled'})`);
	await server.connect(new StdioServerTransport());
} catch (error) {
	console.error('[guide-mcp] failed to start:', error);
	process.exitCode = 1;
}
