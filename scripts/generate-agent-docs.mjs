#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
const site = (config.match(/site:\s*'([^']+)'/)?.[1] ?? 'https://linux-desktop.guide').replace(/\/$/, '');

const sectionLabels = {
	targets: 'Targets',
	start: 'Start Here',
	platform: 'Platform',
	design: 'Design',
	engineering: 'Engineering',
	ship: 'Ship',
	reference: 'Reference',
};

const sectionOrder = ['targets', 'start', 'platform', 'design', 'engineering', 'ship', 'reference'];

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	bulletListMarker: '-',
	emDelimiter: '_',
	strongDelimiter: '**',
});
turndown.use(gfm);

turndown.addRule('expressiveCode', {
	filter: (node) =>
		node.nodeName === 'PRE' && Boolean(node.parentElement?.closest('.expressive-code')),
	replacement: (_content, node) => {
		const language = node.getAttribute('data-language') || '';
		const lines = [...node.querySelectorAll('.ec-line')].map((line) => line.textContent ?? '');
		const code = (lines.length ? lines.join('\n') : node.textContent ?? '').replace(/\n+$/, '');
		return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
	},
});

function walk(dir) {
	const entries = [];
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		const stat = statSync(path);
		if (stat.isDirectory()) entries.push(...walk(path));
		else if (name === 'index.html') entries.push(path);
	}
	return entries;
}

function oneLine(value, max = 220) {
	const normalized = value.replace(/\s+/g, ' ').trim();
	if (normalized.length <= max) return normalized;
	const cut = normalized.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length)}…`;
}

function yaml(value) {
	return JSON.stringify(value);
}

const pages = [];

for (const file of walk(dist).sort()) {
	const rel = relative(dist, file).split(sep).join('/');
	const slug = rel === 'index.html' ? 'index' : rel.replace(/\/index\.html$/, '');
	if (slug === '404' || slug === 'index') continue;

	const html = readFileSync(file, 'utf8');
	const { document } = parseHTML(html);
	const content = document.querySelector('.sl-markdown-content');
	if (!content) continue;

	for (const node of content.querySelectorAll(
		'.sl-anchor-link, .expressive-code .copy, .expressive-code figcaption, button, script, style'
	)) {
		node.remove();
	}

	const title =
		document.querySelector('.page-header h1')?.textContent?.trim() ||
		document.querySelector('h1')?.textContent?.trim() ||
		slug;
	const description =
		document.querySelector('.page-lede')?.textContent?.trim() ||
		document.querySelector('.hero .tagline')?.textContent?.trim() ||
		'';
	const sectionLabel =
		document.querySelector('.page-eyebrow')?.textContent?.trim() ||
		(slug === 'index' ? 'Overview' : sectionLabels[slug.split('/')[0]] || 'Documents');

	const body = turndown
		.turndown(content.innerHTML)
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	const url = slug === 'index' ? `${site}/` : `${site}/${slug}/`;

	const markdown = [
		'---',
		`title: ${yaml(title)}`,
		`description: ${yaml(oneLine(description))}`,
		`url: ${yaml(url)}`,
		`section: ${yaml(sectionLabel)}`,
		'---',
		'',
		`# ${title}`,
		'',
		description ? `> ${oneLine(description)}` : '',
		'',
		body,
		'',
	]
		.filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
		.join('\n');

	const output = join(dist, slug === 'index' ? 'index.md' : `${slug}.md`);
	mkdirSync(dirname(output), { recursive: true });
	writeFileSync(output, markdown, 'utf8');

	pages.push({ slug, title, description: oneLine(description, 180), sectionLabel, url });
}

pages.sort((a, b) => {
	if (a.slug === 'index') return -1;
	if (b.slug === 'index') return 1;
	const aSection = sectionOrder.indexOf(a.slug.split('/')[0]);
	const bSection = sectionOrder.indexOf(b.slug.split('/')[0]);
	if (aSection !== bSection) return aSection - bSection;
	return a.title.localeCompare(b.title);
});

const bySection = new Map();
for (const page of pages) {
	if (page.slug === 'index') continue;
	const key = page.slug.split('/')[0];
	if (!bySection.has(key)) bySection.set(key, []);
	bySection.get(key).push(page);
}
for (const list of bySection.values()) list.sort((a, b) => a.title.localeCompare(b.title));

const indexLines = [
	'# Linux Desktop Guide',
	'',
	'> A practical field guide to building fast, accessible, deeply integrated native apps for the Linux desktops that matter, with a curated target matrix, a default stack for each target, and a shared quality bar.',
	'',
];

for (const key of sectionOrder) {
	const list = bySection.get(key);
	if (!list?.length) continue;
	indexLines.push(`## ${sectionLabels[key]}`, '');
	for (const page of list) {
		indexLines.push(
			`- [${page.title}](${site}/${page.slug}.md): ${page.description || 'Documentation page.'}`
		);
	}
	indexLines.push('');
}

indexLines.push('## Optional', '');
indexLines.push(`- [Full text](${site}/llms-full.txt): The complete guide in one Markdown file.`);
indexLines.push(`- [Baseline](${site}/reference/baseline.md): The validated version set and review date.`);
indexLines.push('');

writeFileSync(join(dist, 'llms.txt'), indexLines.join('\n'), 'utf8');

const fullLines = [
	'# Linux Desktop Guide — Full Text',
	'',
	'> A practical field guide to building fast, accessible, deeply integrated native apps for the Linux desktops that matter, with a curated target matrix, a default stack for each target, and a shared quality bar.',
	'',
	`Canonical site: ${site}/`,
	'',
];

for (const page of pages) {
	fullLines.push('---', '', `# ${page.title}`, '', `URL: ${page.url}`, '');
	if (page.description) fullLines.push(`> ${page.description}`, '');
	const file = join(dist, page.slug === 'index' ? 'index.md' : `${page.slug}.md`);
	const text = readFileSync(file, 'utf8');
	const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
	const withoutTitle = body.replace(/^# .*\n+/, '').replace(/^> .*\n+/, '');
	fullLines.push(withoutTitle, '');
}

writeFileSync(join(dist, 'llms-full.txt'), fullLines.join('\n'), 'utf8');

console.log(`Generated ${pages.length} Markdown pages, llms.txt, and llms-full.txt.`);
