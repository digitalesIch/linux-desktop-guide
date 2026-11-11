/**
 * Prefix root-relative links and assets in Markdown with the Astro base path.
 * Starlight handles its own navigation; this covers links written in content.
 */
export function rehypeBaseLinks({ base }) {
	const prefix = !base || base === '/' ? '' : base.replace(/\/$/, '');

	return (tree) => {
		const visit = (node) => {
			if (node?.type === 'element' && node.properties) {
				for (const attribute of ['href', 'src']) {
					const value = node.properties[attribute];
					if (
						typeof value === 'string' &&
						value.startsWith('/') &&
						!value.startsWith('//') &&
						prefix &&
						!value.startsWith(`${prefix}/`) &&
						value !== prefix
					) {
						node.properties[attribute] = `${prefix}${value}`;
					}
				}
			}
			for (const child of node?.children ?? []) visit(child);
		};

		visit(tree);
	};
}
