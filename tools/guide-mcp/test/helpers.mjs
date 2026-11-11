import { mkdtemp } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const fixtures = join(testDirectory, 'fixtures');
export const projectRoot = resolve(testDirectory, '..', '..', '..');

const routes = [
	'llms.txt',
	'llms-full.txt',
	'start/why-linux.md',
	'start/choose-stack.md',
	'platform/flatpak-portals.md',
	'reference/baseline.json',
];

async function readRoute(route, baseUrl) {
	const text = await readFile(join(fixtures, route), 'utf8');
	return text.replaceAll('__BASE__', baseUrl);
}

export async function makeTempCache() {
	return mkdtemp(join(tmpdir(), 'guide-mcp-cache-'));
}

export async function startFixtureServer() {
	let baseUrl = '';
	const requests = [];

	const server = createServer(async (request, response) => {
		requests.push({ path: request.url, headers: request.headers });

		const pathname = new URL(request.url, baseUrl || 'http://127.0.0.1/').pathname;
		const route = pathname.replace(/^\/+/, '');
		if (!routes.includes(route)) {
			response.writeHead(404, { 'content-type': 'text/plain' });
			response.end('not found');
			return;
		}

		const body = await readRoute(route, baseUrl);
		const etag = `"fixture-${Buffer.byteLength(body)}-${route.length}"`;
		if (request.headers['if-none-match'] === etag) {
			response.writeHead(304, { etag });
			response.end();
			return;
		}

		const contentType = route.endsWith('.json')
			? 'application/json'
			: route.endsWith('.md')
				? 'text/markdown; charset=utf-8'
				: 'text/plain; charset=utf-8';
		response.writeHead(200, { 'content-type': contentType, etag, 'cache-control': 'max-age=0' });
		response.end(body);
	});

	await new Promise((resolveListen) => {
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			baseUrl = `http://127.0.0.1:${port}/`;
			resolveListen();
		});
	});

	return {
		baseUrl,
		requests,
		close: () => new Promise((resolveClose) => server.close(resolveClose)),
	};
}

export async function startServer({ entry = 'src/server.mjs', baseUrl, cacheDir, env = {} }) {
	const transport = new StdioClientTransport({
		command: process.execPath,
		args: [resolve(testDirectory, '..', entry)],
		cwd: projectRoot,
		env: {
			...process.env,
			LDG_SITE_URL: baseUrl,
			LDG_CACHE_DIR: cacheDir,
			...env,
		},
		stderr: 'pipe',
	});

	let stderr = '';
	transport.stderr?.on('data', (chunk) => {
		stderr += chunk.toString();
	});

	const client = new Client({ name: 'guide-mcp-test', version: '1.0.0' });
	try {
		await client.connect(transport);
	} catch (error) {
		await transport.close().catch(() => {});
		throw error;
	}

	return {
		client,
		stderr: () => stderr,
		close: async () => {
			await client.close();
		},
	};
}

export function text(result) {
	if (result.content?.[0]?.type !== 'text') {
		throw new Error(`unexpected tool result: ${JSON.stringify(result)}`);
	}
	return result.content[0].text;
}

export function json(result) {
	return JSON.parse(text(result));
}
