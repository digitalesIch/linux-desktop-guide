#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, 'src', 'data', 'targets.json');

const roles = new Set(['reference', 'validation', 'compatibility']);
const stackRoles = new Set([...roles, 'watch']);
const stacks = new Set(['gtk', 'qt', 'both']);
const bases = new Set(['deb', 'rpm', 'pacman']);
const releaseModels = new Set(['lts', 'stable', 'current', 'rolling']);
const scoreKeys = ['adoption', 'momentum', 'developer_environment', 'platform_quality', 'longevity'];

const errors = [];

function isDate(value) {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isUrl(value) {
	if (typeof value !== 'string') return false;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

let data;
try {
	data = JSON.parse(readFileSync(path, 'utf8'));
} catch (error) {
	console.error(`Could not read ${path}: ${error.message}`);
	process.exit(1);
}

for (const key of ['validated_on', 'review_due']) {
	if (!isDate(data[key])) errors.push(`${key} must be an ISO date (YYYY-MM-DD)`);
}
if (isDate(data.validated_on) && isDate(data.review_due)) {
	if (Date.parse(data.review_due) <= Date.parse(data.validated_on)) {
		errors.push('review_due must be after validated_on');
	}
}

const weights = data.weights ?? {};
const weightKeys = Object.keys(weights);
if (weightKeys.length !== scoreKeys.length || !scoreKeys.every((key) => key in weights)) {
	errors.push(`weights must define exactly: ${scoreKeys.join(', ')}`);
}
for (const key of scoreKeys) {
	if (typeof weights[key] !== 'number' || weights[key] < 0) errors.push(`weights.${key} must be a non-negative number`);
}
const weightSum = scoreKeys.reduce((sum, key) => sum + (Number(weights[key]) || 0), 0);
if (Math.abs(weightSum - 1) > 0.001) errors.push(`weights must sum to 1 (got ${weightSum})`);

function weighted(scores) {
	return Math.round(scoreKeys.reduce((sum, key) => sum + scores[key] * weights[key], 0) * 100) / 100;
}

function checkScores(item, label) {
	for (const key of scoreKeys) {
		const value = item.scores?.[key];
		if (!Number.isInteger(value) || value < 0 || value > 3) {
			errors.push(`${label}: scores.${key} must be an integer from 0 to 3`);
		}
	}
	if (item.scores && scoreKeys.every((key) => Number.isInteger(item.scores[key]))) {
		const expected = weighted(item.scores);
		if (Math.abs(item.weighted_score - expected) > 0.001) {
			errors.push(`${label}: weighted_score ${item.weighted_score} does not match computed ${expected}`);
		}
	}
}

function checkSources(item, label) {
	if (!Array.isArray(item.sources) || item.sources.length === 0) {
		errors.push(`${label}: at least one source is required`);
		return;
	}
	for (const source of item.sources) {
		if (!isUrl(source)) errors.push(`${label}: invalid source URL: ${source}`);
	}
}

const ids = new Set();
function checkId(item, label) {
	if (typeof item.id !== 'string' || item.id.length === 0) {
		errors.push(`${label}: id is required`);
		return;
	}
	if (ids.has(item.id)) errors.push(`${label}: duplicate id: ${item.id}`);
	ids.add(item.id);
}

if (!Array.isArray(data.stacks) || data.stacks.length === 0) errors.push('stacks must be a non-empty array');
for (const [index, stack] of (data.stacks ?? []).entries()) {
	const label = `stacks[${index}]`;
	checkId(stack, label);
	if (!stackRoles.has(stack.role)) errors.push(`${label}: invalid role ${stack.role}`);
	checkScores(stack, label);
	checkSources(stack, label);
}
const referenceStacks = (data.stacks ?? []).filter((stack) => stack.role === 'reference');
if (referenceStacks.length < 2) errors.push('at least two reference stacks are required');
if (!referenceStacks.some((stack) => stack.id === 'gnome-gtk')) errors.push('the GNOME/GTK stack must be a reference stack');
if (!referenceStacks.some((stack) => stack.id === 'kde-qt')) errors.push('the KDE/Qt stack must be a reference stack');

if (!Array.isArray(data.targets) || data.targets.length === 0) errors.push('targets must be a non-empty array');
for (const [index, target] of (data.targets ?? []).entries()) {
	const label = `targets[${index}] (${target.id ?? 'no id'})`;
	checkId(target, label);
	if (!roles.has(target.role)) errors.push(`${label}: invalid role ${target.role}`);
	if (!stacks.has(target.stack)) errors.push(`${label}: invalid stack ${target.stack}`);
	if (!bases.has(target.base)) errors.push(`${label}: invalid base ${target.base}`);
	if (!releaseModels.has(target.release_model)) errors.push(`${label}: invalid release_model ${target.release_model}`);
	if (!isDate(target.last_validated)) errors.push(`${label}: last_validated must be an ISO date`);
	checkScores(target, label);
	checkSources(target, label);
}

const referenceTargets = (data.targets ?? []).filter((target) => target.role === 'reference');
if (referenceTargets.length < 2) errors.push('at least two reference targets are required');
if (!referenceTargets.some((target) => target.stack === 'gtk')) errors.push('at least one reference target must use the GTK stack');
if (!referenceTargets.some((target) => target.stack === 'qt')) errors.push('at least one reference target must use the Qt stack');

const releaseModelsPresent = new Set((data.targets ?? []).map((target) => target.release_model));
if (![...releaseModelsPresent].some((model) => model === 'lts' || model === 'stable')) {
	errors.push('targets must include an LTS or stable release model');
}
if (![...releaseModelsPresent].some((model) => model === 'current' || model === 'rolling')) {
	errors.push('targets must include a current or rolling release model');
}
const basesPresent = new Set((data.targets ?? []).map((target) => target.base));
if (!basesPresent.has('deb')) errors.push('targets must include a deb-based distribution');
if (!basesPresent.has('rpm')) errors.push('targets must include an rpm-based distribution');

if (!Array.isArray(data.watch) || data.watch.length === 0) errors.push('watch must be a non-empty array');
for (const [index, item] of (data.watch ?? []).entries()) {
	const label = `watch[${index}] (${item.id ?? 'no id'})`;
	checkId(item, label);
	if (typeof item.reason !== 'string' || item.reason.length < 20) errors.push(`${label}: reason is required`);
	checkScores(item, label);
	checkSources(item, label);
}

if (errors.length > 0) {
	console.error('Target matrix validation failed:');
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(
	`Targets OK: ${referenceTargets.length} reference target(s), ${data.targets.length} total, ${data.watch.length} watch-list entr(ies), review due ${data.review_due}.`,
);
