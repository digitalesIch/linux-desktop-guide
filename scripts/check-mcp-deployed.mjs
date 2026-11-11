#!/usr/bin/env node

/**
 * Verify the published MCP contract with the built guide server.
 *
 * Usage:
 *   npm run check:mcp -- https://digitalesich.github.io/linux-desktop-guide/
 *   DEPLOY_URL=https://example.com/ npm run check:mcp
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const input = process.argv[2] ?? process.env.DEPLOY_URL;
if (!input) {
	console.error('Usage: npm run check:mcp -- <base-url>');
	console.error('   or: DEPLOY_URL=<base-url> npm run check:mcp');
	process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bundle = join(root, 'tools', 'guide-mcp', 'dist', 'server.mjs');
if (!existsSync(bundle)) {
	console.error('The guide MCP bundle is missing. Run npm run build:guide-mcp first.');
	process.exit(1);
}

const base = input.endsWith('/') ? input : `${input}/`;
const transport = new StdioClientTransport({
	command: process.execPath,
	args: [bundle],
	cwd: root,
	env: { ...process.env, LDG_SITE_URL: base, LDG_NO_CACHE: '1' },
	stderr: 'pipe',
});
transport.stderr?.on('data', (chunk) => process.stderr.write(chunk));

const client = new Client({ name: 'guide-mcp-deployed-check', version: '1.0.0' });
const errors = [];

async function call(name, args = {}) {
	const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 30_000 });
	if (result.isError) throw new Error(`${name}: ${result.content?.[0]?.text ?? 'tool error'}`);
	if (result.content?.[0]?.type !== 'text') throw new Error(`${name}: unexpected content`);
	return JSON.parse(result.content[0].text);
}

try {
	await client.connect(transport);

	const list = await call('list_pages');
	if (!(list.count >= 30)) errors.push(`list_pages returned only ${list.count} pages`);
	if (!Array.isArray(list.sections) || list.sections.length === 0) errors.push('list_pages returned no sections');
	if (!list.sections[0]?.pages?.[0]?.url?.startsWith(base)) {
		errors.push('list_pages did not return absolute URLs under the deployed base');
	}

	const search = await call('search_docs', { query: 'flatpak portals', limit: 3 });
	if (!search.results?.length) errors.push('search_docs returned no results');
	if (!search.results?.some((entry) => entry.slug.includes('flatpak'))) {
		errors.push('search_docs did not find the Flatpak page');
	}

	const page = await call('get_page', { slug: 'start/why-linux' });
	if (!page.content || page.content.length < 500) errors.push('get_page returned too little content');
	if (!page.url?.startsWith(base)) errors.push('get_page did not return an absolute URL under the deployed base');

	const baseline = await call('get_baseline');
	if (typeof baseline.ubuntu?.release !== 'string') errors.push('get_baseline did not return an Ubuntu release');

	if (errors.length > 0) {
		console.error('Published MCP check failed:');
		for (const error of errors) console.error(`- ${error}`);
		process.exitCode = 1;
	} else {
		console.log(
			`Published MCP OK: ${list.count} pages, search, page retrieval, and baseline at ${base}.`,
		);
	}
} catch (error) {
	console.error(`Published MCP check failed: ${error.message}`);
	process.exitCode = 1;
} finally {
	await client.close().catch(() => {});
}
