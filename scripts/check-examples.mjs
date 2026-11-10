#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tutorialPath = join(root, 'src', 'content', 'docs', 'start', 'first-app.md');
const exampleRoot = join(root, 'examples', 'notes');

// The tutorial teaches these files; the example is the canonical source.
const files = [
	['src/main.py', 'src/main.py'],
	['meson.build', 'meson.build'],
	['io.github.yourname.Notes.yml', 'io.github.yourname.Notes.yml'],
	['data/io.github.yourname.Notes.desktop', 'data/io.github.yourname.Notes.desktop'],
	['data/io.github.yourname.Notes.metainfo.xml', 'data/io.github.yourname.Notes.metainfo.xml'],
	['data/io.github.yourname.Notes.svg', 'data/io.github.yourname.Notes.svg'],
];

function blocks(markdown) {
	const found = new Map();
	for (const match of markdown.matchAll(/```[^\n]*title="([^"]+)"\n([\s\S]*?)\n```/g)) {
		if (!files.some(([title]) => title === match[1])) continue;
		if (found.has(match[1])) {
			found.set(match[1], null);
			continue;
		}
		found.set(match[1], match[2].replace(/\r\n/g, '\n').trimEnd());
	}
	return found;
}

function normalise(text) {
	return text.replace(/\r\n/g, '\n').trimEnd();
}

function lineDiff(example, tutorial) {
	const a = example.split('\n');
	const b = tutorial.split('\n');
	const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));

	for (let i = a.length - 1; i >= 0; i -= 1) {
		for (let j = b.length - 1; j >= 0; j -= 1) {
			table[i][j] =
				a[i] === b[j]
					? table[i + 1][j + 1] + 1
					: Math.max(table[i + 1][j], table[i][j + 1]);
		}
	}

	const lines = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		if (a[i] === b[j]) {
			i += 1;
			j += 1;
		} else if (table[i + 1][j] >= table[i][j + 1]) {
			lines.push(`- ${String(i + 1).padStart(4)}  ${a[i]}`);
			i += 1;
		} else {
			lines.push(`+ ${String(j + 1).padStart(4)}  ${b[j]}`);
			j += 1;
		}
	}
	while (i < a.length) {
		lines.push(`- ${String(i + 1).padStart(4)}  ${a[i]}`);
		i += 1;
	}
	while (j < b.length) {
		lines.push(`+ ${String(j + 1).padStart(4)}  ${b[j]}`);
		j += 1;
	}
	return lines;
}

const tutorial = readFileSync(tutorialPath, 'utf8');
const found = blocks(tutorial);
const failures = [];

for (const [title, relative] of files) {
	const block = found.get(title);
	if (block === null) {
		failures.push(`${title}: duplicate titled code block in the tutorial`);
		continue;
	}
	if (block === undefined) {
		failures.push(`${title}: missing titled code block in the tutorial`);
		continue;
	}

	const example = normalise(readFileSync(join(exampleRoot, relative), 'utf8'));
	if (block === example) continue;

	failures.push(`${relative}: tutorial block and example file differ`);
	const diff = lineDiff(example, block);
	const limit = 120;
	console.error(`\n${relative}`);
	console.error('  --- examples/notes (canonical)');
	console.error('  +++ src/content/docs/start/first-app.md');
	for (const line of diff.slice(0, limit)) console.error(`  ${line}`);
	if (diff.length > limit) {
		console.error(`  ... ${diff.length - limit} more differing line(s)`);
	}
}

if (failures.length > 0) {
	console.error(`\nTutorial/example check failed (${failures.length} issue(s)):`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(`Tutorial/example check OK: ${files.length} file(s) match examples/notes.`);
