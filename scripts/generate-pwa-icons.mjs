#!/usr/bin/env node

import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'src', 'assets', 'mark.svg'));
const outputDir = join(root, 'public', 'icons');
mkdirSync(outputDir, { recursive: true });

async function render(size, name, padding = 0) {
	const inner = Math.round(size * (1 - padding * 2));
	const mark = await sharp(source).resize(inner, inner).png().toBuffer();
	await sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: '#06100b',
		},
	})
		.composite([{ input: mark, gravity: 'center' }])
		.png({ compressionLevel: 9 })
		.toFile(join(outputDir, name));
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'icon-maskable-512.png', 0.1);
await render(180, 'apple-touch-icon.png', 0.1);

console.log('Generated PWA icons in public/icons.');
