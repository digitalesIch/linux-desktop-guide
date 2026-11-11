/**
 * Hosts that are unreachable from the GitHub Actions network but are not broken.
 * The reason is kept next to the host so a future maintainer can re-check it.
 */
export const EXTERNAL_ALLOWLIST = new Map([
	[
		'doc.qt.io',
		'Qt documentation blocks automated requests from the CI network; checked manually and through the linked release pages.',
	],
	[
		'www.iso.org',
		'ISO returns 403 to automated requests; the standards pages are checked manually and linked from the resources and documentation pages.',
	],
]);

export function allowlistReason(url) {
	try {
		return EXTERNAL_ALLOWLIST.get(new URL(url).hostname);
	} catch {
		return null;
	}
}
