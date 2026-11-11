function normalizeBase(value) {
	if (!value || value === '/') return '/';
	return `/${String(value).replace(/^\/+|\/+$/g, '')}`;
}

const site = (process.env.SITE_URL ?? 'https://digitalesich.github.io').replace(/\/$/, '');

export const SITE_URL = site;
export const BASE_PATH = normalizeBase(process.env.BASE_PATH ?? '/linux-desktop-guide');
export const BASE_URL = BASE_PATH === '/' ? '/' : `${BASE_PATH}/`;
