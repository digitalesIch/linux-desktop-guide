export class DocsError extends Error {
	constructor(message, code = 'DOCS_ERROR', options) {
		super(message, options);
		this.name = 'DocsError';
		this.code = code;
	}
}
