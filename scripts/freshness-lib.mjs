/**
 * Compare configured source expectations with fetched page text.
 * The loader is injected so the same logic can run against the network or a fixture.
 */
export function normalizeSourceText(value) {
	return String(value)
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim();
}

export async function evaluateSources(sources, load, checkedAt = new Date().toISOString().slice(0, 10)) {
	const drift = [];
	const errors = [];
	const human = [];

	for (const source of sources ?? []) {
		if (source.mode === 'human') {
			human.push({
				source: source.id,
				url: source.url,
				fields: source.fields ?? [],
				reason: source.reason ?? 'Manual review required.',
			});
			continue;
		}

		let result;
		try {
			result = await load(source.url);
		} catch (error) {
			errors.push({
				source: source.id,
				url: source.url,
				status: 'ERR',
				fields: source.fields ?? [],
				error: error.message,
			});
			continue;
		}

		if (!result || result.status < 200 || result.status >= 300) {
			errors.push({
				source: source.id,
				url: source.url,
				status: result?.status ?? 'ERR',
				fields: source.fields ?? [],
				error: result?.error ?? 'Non-success status',
			});
			continue;
		}

		const text = normalizeSourceText(result.body ?? '').toLowerCase();
		for (const expected of source.expect ?? []) {
			if (!text.includes(String(expected).toLowerCase())) {
				drift.push({
					source: source.id,
					url: source.url,
					fields: source.fields ?? [],
					expected,
					status: result.status,
				});
			}
		}
	}

	return { checkedAt, drift, errors, human };
}
