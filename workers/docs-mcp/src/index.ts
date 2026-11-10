import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import corpus from './generated/docs.json';
import { createDocsApi, DocsError } from './core.mjs';
import { SERVER_NAME, SERVER_VERSION, SECTION_ORDER } from '../../../tools/docs-mcp/lib/sections.mjs';

const api = createDocsApi(corpus.pages, corpus.baseline);

const READ_ONLY = Object.freeze({
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: false,
});

const CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version',
	'Access-Control-Expose-Headers': 'mcp-session-id, mcp-protocol-version',
	'Access-Control-Max-Age': '86400',
};

function withCors(response: Response): Response {
	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(CORS_HEADERS)) headers.set(name, value);
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Referrer-Policy', 'no-referrer');
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

function json(value: unknown, status = 200): Response {
	return withCors(Response.json(value, { status }));
}

function textResult(value: unknown) {
	return {
		content: [
			{
				type: 'text' as const,
				text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
			},
		],
	};
}

function errorResult(message: string) {
	return {
		isError: true,
		content: [{ type: 'text' as const, text: message }],
	};
}

function respond(handler: (args: any) => unknown) {
	return async (args: any) => {
		try {
			return textResult(await handler(args));
		} catch (error) {
			if (error instanceof DocsError) return errorResult(error.message);
			console.error('[docs-mcp-remote] unexpected error:', error);
			return errorResult('The documentation server could not complete this request.');
		}
	};
}

function createServer() {
	const server = new McpServer(
		{ name: SERVER_NAME, version: SERVER_VERSION },
		{
			instructions:
				'Read-only documentation for the Linux Desktop Guide, served from a Cloudflare Worker. Call search_docs first for a topic, then get_page with a returned slug. Use list_pages to browse the guide, get_related after reading a page, and get_baseline for validated Ubuntu, GNOME, GTK, libadwaita, Qt, and packaging versions. No tool writes data or calls another service.',
		},
	);

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
				limit: z.number().int().min(1).max(25).default(8).describe('Maximum number of results (1-25, default 8).'),
				section: z.enum(SECTION_ORDER).optional().describe('Limit results to one guide section.'),
			},
			annotations: READ_ONLY,
		},
		respond(({ query, limit, section }) => api.searchDocs({ query, limit, section })),
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
		respond(({ slug }) => api.getPage(slug)),
	);

	server.registerTool(
		'list_pages',
		{
			title: 'List documentation pages',
			description:
				'List indexed Linux Desktop Guide pages grouped by section, in the guide sidebar order. Use this when you do not know a slug or want the full table of contents.',
			inputSchema: {
				section: z.enum(SECTION_ORDER).optional().describe('Return only pages from this section.'),
			},
			annotations: READ_ONLY,
		},
		respond(({ section }) => api.listPages({ section })),
	);

	server.registerTool(
		'get_related',
		{
			title: 'Find related documentation',
			description:
				'Recommend related Linux Desktop Guide pages for a slug, based on internal links, section, and text similarity. Use after reading a page to find the next useful topic.',
			inputSchema: {
				slug: z.string().min(1).describe('Canonical page slug, for example platform/xdg.'),
				limit: z.number().int().min(1).max(12).default(5).describe('Maximum number of recommendations (1-12, default 5).'),
			},
			annotations: READ_ONLY,
		},
		respond(({ slug, limit }) => api.getRelated(slug, limit)),
	);

	server.registerTool(
		'get_baseline',
		{
			title: 'Read the platform baseline',
			description:
				'Return the validated platform baseline from src/data/baseline.json: Ubuntu release and support windows, GNOME, GTK, libadwaita, Qt, KDE, toolchains, packaging runtimes, and site versions. Use this instead of guessing versions.',
			annotations: READ_ONLY,
		},
		respond(() => api.getBaseline()),
	);

	return server;
}

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return withCors(new Response(null, { status: 204 }));
		}

		if (url.pathname === '/health') {
			return json({
				status: 'ok',
				name: SERVER_NAME,
				version: SERVER_VERSION,
				pages: api.pageCount,
				generatedAt: corpus.generatedAt,
				tools: ['search_docs', 'get_page', 'list_pages', 'get_related', 'get_baseline'],
			});
		}

		if (url.pathname === '/') {
			return json({
				name: SERVER_NAME,
				version: SERVER_VERSION,
				mcp: '/mcp',
				health: '/health',
			});
		}

		if (url.pathname !== '/mcp') {
			return json({ error: 'Not found' }, 404);
		}

		const transport = new WebStandardStreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
			enableJsonResponse: true,
		});
		const server = createServer();
		await server.connect(transport);
		const response = await transport.handleRequest(request);
		return withCors(response);
	},
};
