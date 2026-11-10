# Remote docs MCP (Cloudflare Worker)

Read-only MCP access to the Linux Desktop Guide over Streamable HTTP. The site stays on GitHub Pages; this Worker is the remote endpoint for agents that cannot run the local stdio server.

## Endpoint

- MCP: `/mcp`
- Health: `/health`
- Discovery: `/`

The Worker is stateless. Every request gets a fresh `McpServer` and `WebStandardStreamableHTTPServerTransport`; no session state is stored.

## Tools

The Worker exposes the same five tools as `tools/docs-mcp`:

- `search_docs`
- `get_page`
- `list_pages`
- `get_related`
- `get_baseline`

All tools are read-only, non-destructive, idempotent, and closed-world. The Worker does not write data, create issues, or call another origin.

## Content

The corpus is generated from the repository, not fetched from the website:

```bash
npm run worker:corpus
```

This reads `src/content/docs` and `src/data/baseline.json` and writes `src/generated/docs.json`. The generated file is not committed. Regenerate and redeploy after a guide change.

## Local development

```bash
npm install
npm run worker:corpus
npm run worker:dev
```

`wrangler dev` serves on `http://localhost:8787` by default. Check:

```bash
curl http://localhost:8787/health
```

## Validate without deploying

```bash
npm run worker:check
```

This generates the corpus and runs `wrangler deploy --dry-run`. It does not contact Cloudflare and does not need an API token.

## Deploy

```bash
npx wrangler login
npm run worker:deploy
```

The first deployment uses the `workers.dev` hostname from `wrangler.toml`. To use a custom domain, create the DNS record, uncomment the route, and redeploy:

```toml
routes = [{ pattern = "mcp.linux-desktop.guide", custom_domain = true }]
```

## Rate limiting and abuse

The content is public and read-only, so the main risk is request volume. Add a Cloudflare rate-limiting rule for the Worker hostname before announcing the endpoint. Do not add write tools or secrets to the Worker.

## Client configuration

Use the deployed `/mcp` URL as a remote MCP server. For OpenCode, the server entry uses the remote transport shape:

```jsonc
{
  "mcp": {
    "servers": {
      "docs-remote": {
        "type": "remote",
        "url": "https://mcp.linux-desktop.guide/mcp"
      }
    }
  }
}
```

Replace the URL with the `workers.dev` hostname until the custom domain is active. Keep the local `docs` server for offline work.

## Verification

```bash
npm run worker:check
npm run test:docs-mcp
npm run check:docs
```

The GitHub Actions workflow runs the Worker dry-run on every push and pull request.
