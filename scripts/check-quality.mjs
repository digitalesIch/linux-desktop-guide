#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

// Representative pages: landing, tutorial, framework guide, design, packaging.
const pages = [
	{ path: '/', name: 'landing' },
	{ path: '/start/why-linux/', name: 'start' },
	{ path: '/targets/', name: 'targets' },
	{ path: '/engineering/gtk/', name: 'engineering' },
	{ path: '/design/accessibility/', name: 'design' },
	{ path: '/platform/packaging/', name: 'platform' },
];

// Accessibility, best practices, and SEO must be perfect. Performance has a
// floor because timing varies between machines; the observed range is 98-100.
const thresholds = {
	performance: 0.9,
	accessibility: 1,
	'best-practices': 1,
	seo: 1,
};

const mimeTypes = new Map([
	['.css', 'text/css; charset=utf-8'],
	['.html', 'text/html; charset=utf-8'],
	['.ico', 'image/x-icon'],
	['.jpeg', 'image/jpeg'],
	['.jpg', 'image/jpeg'],
	['.js', 'text/javascript; charset=utf-8'],
	['.json', 'application/json; charset=utf-8'],
	['.md', 'text/markdown; charset=utf-8'],
	['.png', 'image/png'],
	['.svg', 'image/svg+xml'],
	['.txt', 'text/plain; charset=utf-8'],
	['.webmanifest', 'application/manifest+json'],
	['.webp', 'image/webp'],
	['.woff', 'font/woff'],
	['.woff2', 'font/woff2'],
	['.xml', 'application/xml; charset=utf-8'],
]);

function build() {
	console.log('\n==> npm run build');
	const result = spawnSync('npm', ['run', 'build'], {
		cwd: root,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	if (result.status !== 0) {
		console.error('\ncheck:quality failed at: build');
		process.exit(result.status ?? 1);
	}
}

function resolveRequest(requestUrl) {
	const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
	let target = resolve(dist, `.${pathname}`);
	if (target !== dist && !target.startsWith(`${dist}${sep}`)) return null;

	if (existsSync(target) && statSync(target).isDirectory()) {
		target = join(target, 'index.html');
	} else if (!extname(target)) {
		const indexed = join(target, 'index.html');
		if (existsSync(indexed)) target = indexed;
	}

	if (!existsSync(target) || !statSync(target).isFile()) return null;
	return target;
}

function serve(request, response) {
	const file = resolveRequest(request.url ?? '/');
	if (!file) {
		response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		response.end('Not found');
		return;
	}

	const type = mimeTypes.get(extname(file)) ?? 'application/octet-stream';
	const headers = {
		'content-type': type,
		'cache-control': 'no-store',
		'x-content-type-options': 'nosniff',
	};
	let body = readFileSync(file);

	if (
		(type.startsWith('text/') || type.includes('javascript') || type.includes('json') || type.includes('xml')) &&
		(request.headers['accept-encoding'] ?? '').includes('gzip')
	) {
		body = gzipSync(body);
		headers['content-encoding'] = 'gzip';
		headers['vary'] = 'accept-encoding';
	}

	headers['content-length'] = body.length;
	response.writeHead(200, headers);
	response.end(body);
}

function formatScore(score) {
	return score === null || score === undefined ? 'n/a' : String(Math.round(score * 100));
}

function failingAudits(lhr, categoryId) {
	const category = lhr.categories[categoryId];
	if (!category) return [];
	return category.auditRefs
		.filter((ref) => ref.weight > 0)
		.map((ref) => ({ ref, audit: lhr.audits[ref.id] }))
		.filter(({ audit }) => audit && audit.score !== null && audit.score < 1)
		.map(({ ref, audit }) => ({
			id: ref.id,
			title: audit.title,
			score: audit.score,
			displayValue: audit.displayValue,
		}));
}

async function main() {
	if (!process.argv.includes('--no-build')) build();
	if (!existsSync(join(dist, 'index.html'))) {
		console.error('dist/ is missing. Run `npm run build` first or omit --no-build.');
		process.exit(1);
	}

	const server = createServer(serve);
	await new Promise((resolveListen, rejectListen) => {
		server.once('error', rejectListen);
		server.listen(0, '127.0.0.1', resolveListen);
	});
	const { port } = server.address();
	const origin = `http://127.0.0.1:${port}`;
	let chrome;

	try {
		chrome = await launch({
			chromeFlags: ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage'],
		});

		console.log(`\nLighthouse ${(await import('lighthouse/package.json', { with: { type: 'json' } })).default.version}`);
		console.log(`Serving ${dist} at ${origin}\n`);

		const results = [];
		for (const page of pages) {
			process.stdout.write(`Auditing ${page.path} ... `);
			const runner = await lighthouse(`${origin}${page.path}`, {
				port: chrome.port,
				output: 'json',
				logLevel: 'error',
				onlyCategories: Object.keys(thresholds),
			});
			if (!runner?.lhr) throw new Error(`Lighthouse returned no result for ${page.path}`);

			const scores = Object.fromEntries(
				Object.entries(runner.lhr.categories).map(([id, category]) => [id, category.score]),
			);
			results.push({ page, scores, lhr: runner.lhr });
			console.log(
				Object.entries(scores)
					.map(([id, score]) => `${id} ${formatScore(score)}`)
					.join(', '),
			);
		}

		const headers = ['Page', 'Perf', 'A11y', 'BP', 'SEO'];
		const rows = results.map(({ page, scores }) => [
			page.path,
			formatScore(scores.performance),
			formatScore(scores.accessibility),
			formatScore(scores['best-practices']),
			formatScore(scores.seo),
		]);
		const widths = headers.map((header, index) =>
			Math.max(header.length, ...rows.map((row) => row[index].length)),
		);
		const formatRow = (row) => row.map((cell, index) => cell.padEnd(widths[index])).join('  ');

		console.log(`\n${formatRow(headers)}`);
		console.log(widths.map((width) => '-'.repeat(width)).join('  '));
		for (const row of rows) console.log(formatRow(row));

		const failures = [];
		for (const { page, scores, lhr } of results) {
			for (const [category, minimum] of Object.entries(thresholds)) {
				const score = scores[category];
				if (score !== null && score >= minimum) continue;
				failures.push({ page, category, score, minimum, audits: failingAudits(lhr, category) });
			}
		}

		if (failures.length > 0) {
			console.error(`\ncheck:quality failed: ${failures.length} score(s) below threshold.`);
			for (const failure of failures) {
				console.error(
					`\n- ${failure.page.path} ${failure.category}: ${formatScore(failure.score)} (minimum ${formatScore(failure.minimum)})`,
				);
				for (const audit of failure.audits) {
					const value = audit.displayValue ? ` — ${audit.displayValue}` : '';
					console.error(`    ${audit.id}: ${audit.title}${value}`);
				}
			}
			process.exitCode = 1;
			return;
		}

		console.log(`\ncheck:quality passed (${results.length} page(s), Lighthouse).`);
	} finally {
		await chrome?.kill();
		await new Promise((resolveClose) => server.close(resolveClose));
	}
}

await main();
