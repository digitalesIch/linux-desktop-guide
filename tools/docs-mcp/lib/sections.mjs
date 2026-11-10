export const SERVER_NAME = 'linux-desktop-guide-docs';
export const SERVER_VERSION = '1.0.0';

export const SECTION_LABELS = Object.freeze({
	targets: 'Targets',
	start: 'Start Here',
	platform: 'Platform',
	design: 'Design',
	engineering: 'Engineering',
	ship: 'Ship',
	reference: 'Reference',
});

export const SECTION_ORDER = Object.freeze(Object.keys(SECTION_LABELS));

export const EXCLUDED_SLUGS = new Set(['404']);
