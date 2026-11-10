#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, 'src', 'data', 'baseline.json');

const required = {
  ubuntu: ['release', 'codename', 'standard_support_end', 'pro_support_end', 'legacy_support_end'],
  desktop: ['gnome', 'gtk', 'libadwaita', 'session'],
  qt: ['version', 'kde_frameworks', 'plasma'],
  toolchains: ['python', 'gcc', 'llvm'],
  packaging: ['flatpak_runtime', 'kde_runtime', 'snap_base'],
  site: ['astro', 'starlight', 'node'],
};

const errors = [];

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`Could not read ${path}: ${error.message}`);
  process.exit(1);
}

for (const [group, keys] of Object.entries(required)) {
  if (!baseline[group] || typeof baseline[group] !== 'object') {
    errors.push(`missing object: ${group}`);
    continue;
  }
  for (const key of keys) {
    if (!baseline[group][key]) errors.push(`missing value: ${group}.${key}`);
  }
}

for (const key of ['validated_on', 'review_due']) {
  if (!isIsoDate(baseline[key])) errors.push(`${key} must be an ISO date (YYYY-MM-DD)`);
}

if (isIsoDate(baseline.validated_on) && isIsoDate(baseline.review_due)) {
  if (Date.parse(baseline.review_due) <= Date.parse(baseline.validated_on)) {
    errors.push('review_due must be after validated_on');
  }
}

if (errors.length > 0) {
  console.error('Baseline validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Baseline OK: Ubuntu ${baseline.ubuntu.release}, GTK ${baseline.desktop.gtk}, libadwaita ${baseline.desktop.libadwaita}, Qt ${baseline.qt.version}`);
