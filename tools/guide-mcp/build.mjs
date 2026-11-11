#!/usr/bin/env node

import { chmod, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(fileURLToPath(import.meta.url));
const outfile = join(root, 'dist', 'server.mjs');
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

await mkdir(dirname(outfile), { recursive: true });
await build({
	entryPoints: [join(root, 'src', 'server.mjs')],
	outfile,
	bundle: true,
	platform: 'node',
	format: 'esm',
	target: 'node22',
	banner: { js: '#!/usr/bin/env node' },
	define: { __GUIDE_MCP_VERSION__: JSON.stringify(manifest.version) },
	legalComments: 'none',
	logLevel: 'warning',
});
await chmod(outfile, 0o755);
