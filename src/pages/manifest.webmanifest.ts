import type { APIRoute } from 'astro';
import { BASE_URL } from '../../site.config.mjs';

export const prerender = true;

export const GET: APIRoute = () => {
	const base = BASE_URL;
	const icon = (name: string, sizes: string, purpose: string) => ({
		src: `${base}icons/${name}`,
		sizes,
		type: 'image/png',
		purpose,
	});

	const manifest = {
		id: base,
		name: 'Linux Desktop Guide',
		short_name: 'Linux Guide',
		description:
			'A field guide to building fast, accessible, native apps for the Linux desktops that matter.',
		lang: 'en',
		dir: 'ltr',
		start_url: base,
		scope: base,
		display: 'standalone',
		display_override: ['standalone', 'minimal-ui'],
		orientation: 'any',
		background_color: '#ffffff',
		theme_color: '#ffffff',
		categories: ['books', 'education', 'developer'],
		prefer_related_applications: false,
		icons: [
			icon('icon-192.png', '192x192', 'any'),
			icon('icon-512.png', '512x512', 'any'),
			icon('icon-maskable-512.png', '512x512', 'maskable'),
		],
		shortcuts: [
			{
				name: 'Platform Targets',
				short_name: 'Targets',
				url: `${base}targets/`,
				icons: [icon('icon-192.png', '192x192', 'any')],
			},
			{
				name: 'The Native Standard',
				short_name: 'Standard',
				url: `${base}start/native-standard/`,
				icons: [icon('icon-192.png', '192x192', 'any')],
			},
			{
				name: 'The Quality Bar',
				short_name: 'Quality',
				url: `${base}ship/quality-bar/`,
				icons: [icon('icon-192.png', '192x192', 'any')],
			},
		],
	};

	return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
		headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
	});
};
