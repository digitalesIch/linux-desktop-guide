## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Documentation for agents

The public guide is published for agents as well as humans. After `npm run build`:

- `/llms.txt` — curated index of every page in Markdown.
- `/llms-full.txt` — the complete guide in one file.
- Append `.md` to a page route for a clean Markdown version, for example `/start/why-linux.md`.

Use `npm run check:baseline` and `npm run check:agent-docs` before releasing. Do not edit `dist/`; it is generated.
