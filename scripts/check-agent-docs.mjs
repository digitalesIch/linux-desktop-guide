#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_URL } from '../site.config.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const docsRoot = join(root, 'src', 'content', 'docs');
const dist = join(root, 'dist');
const basePrefix = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '');

function walk(dir) {
	const files = [];
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		const stat = statSync(path);
		if (stat.isDirectory()) files.push(...walk(path));
		else if (/\.mdx?$/.test(name)) files.push(path);
	}
	return files;
}

const expected = walk(docsRoot)
	.map((file) => relative(docsRoot, file).split(sep).join('/'))
	.map((file) => file.replace(/\.mdx?$/, ''))
	.filter((slug) => slug !== '404' && slug !== 'index')
	.map((slug) => (slug.endsWith('/index') ? slug.slice(0, -'/index'.length) : slug));

const errors = [];
const llmsPath = join(dist, 'llms.txt');
const fullPath = join(dist, 'llms-full.txt');

if (!existsSync(llmsPath)) errors.push('dist/llms.txt is missing');
if (!existsSync(fullPath)) errors.push('dist/llms-full.txt is missing');

let llms = '';
if (existsSync(llmsPath)) {
	llms = readFileSync(llmsPath, 'utf8');
	const h1Count = llms.split('\n').filter((line) => /^# /.test(line)).length;
	if (h1Count !== 1) errors.push(`llms.txt must contain exactly one H1, found ${h1Count}`);
	if (!llms.startsWith('# Linux Desktop Guide')) errors.push('llms.txt must start with the site H1');
	for (const slug of expected) {
		if (!llms.includes(`/${slug}.md`)) errors.push(`llms.txt is missing /${slug}.md`);
		const mdPath = join(dist, slug === 'index' ? 'index.md' : `${slug}.md`);
		if (!existsSync(mdPath)) errors.push(`Missing generated page: ${mdPath}`);
	}

	for (const match of llms.matchAll(/\]\((https?:\/\/[^)]+\.md)\)/g)) {
		const urlPath = new URL(match[1]).pathname;
		const pathname = (
			basePrefix && urlPath.startsWith(`${basePrefix}/`)
				? urlPath.slice(basePrefix.length + 1)
				: urlPath.replace(/^\//, '')
		);
		if (!existsSync(join(dist, pathname))) {
			errors.push(`llms.txt link target is missing: /${pathname}`);
		}
	}

	if (!llms.includes('## Optional')) errors.push('llms.txt is missing the Optional section');
}

if (existsSync(fullPath)) {
	const full = readFileSync(fullPath, 'utf8');
	if (full.length < 10000) errors.push('llms-full.txt looks too small');
	for (const slug of expected) {
		const mdPath = join(dist, slug === 'index' ? 'index.md' : `${slug}.md`);
		if (!existsSync(mdPath)) continue;
		const title = readFileSync(mdPath, 'utf8').match(/^# (.+)$/m)?.[1];
		if (title && !full.includes(title)) errors.push(`llms-full.txt is missing title: ${title}`);
	}
}

if (existsSync(join(dist, '404.md'))) errors.push('dist/404.md should not be generated');

const baselineSourcePath = join(root, 'src', 'data', 'baseline.json');
const baselineDistPath = join(dist, 'reference', 'baseline.json');
if (!existsSync(baselineDistPath)) {
	errors.push('dist/reference/baseline.json is missing');
} else {
	try {
		const source = JSON.parse(readFileSync(baselineSourcePath, 'utf8'));
		const published = JSON.parse(readFileSync(baselineDistPath, 'utf8'));
		if (JSON.stringify(source) !== JSON.stringify(published)) {
			errors.push('dist/reference/baseline.json diverges from src/data/baseline.json');
		}
	} catch (error) {
		errors.push(`dist/reference/baseline.json is invalid JSON (${error.message})`);
	}
}

if (errors.length) {
	console.error('Agent docs validation failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`Agent docs OK: ${expected.length} Markdown pages, llms.txt, llms-full.txt, and reference/baseline.json.`,
);
