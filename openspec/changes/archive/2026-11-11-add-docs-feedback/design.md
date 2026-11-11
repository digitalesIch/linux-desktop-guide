# Design

## Context

GitHub Pages serves static files. The guide's feedback loop therefore cannot use a form POST, a serverless function, request logs, or a database. GitHub Issues is the one write-capable system already attached to the repository, and it can be reached from a static page by a normal link.

The repository is private for now. A private repository means only collaborators can open issues; a public reader who follows the link will be asked to sign in and will not have access. The UI must say this plainly.

## Goals / Non-Goals

**Goals:**

- Give readers one obvious place to report a documentation defect.
- Capture the fields an owner needs to reproduce and fix the defect.
- Keep the site deployable to GitHub Pages with no server.
- Give agents a structured reporting path that does not write to the MCP server.
- Run the existing offline documentation gate on every push and pull request.

**Non-Goals:**

- Aggregate analytics or anonymous voting.
- A public feedback channel while the repository is private.
- Automatic issue creation from the site.
- Changing the docs MCP server's read-only contract.
- Adding a third-party analytics or form service.

## Decisions

### 1. GitHub Issues is the transport

A link to `issues/new?template=docs-feedback.yml` works from any static page. The issue form enforces the fields. No JavaScript, cookie, or backend is required.

### 2. One feedback page, linked from every page header

The feedback page is the canonical explanation. The header link is deliberately small and sits next to the Markdown link, so it does not compete with the content. A footer widget would require a larger Starlight override and more layout risk.

### 3. The private-repository limitation is part of the UI

The page says that the repository is private during development and that external readers cannot open an issue yet. When the repository becomes public, the same link starts working without a code change. The alternative — hiding the link until launch — would leave the loop untestable.

### 4. Agents report, humans publish

An agent can run `gh issue create` against the repository or hand the report to its operator. It must not edit the page without review. The docs MCP server remains read-only; adding a write tool would break the server's contract and make the feedback path harder to audit.

### 5. Repository automation, not site runtime

`check-docs.yml` runs `npm run check:docs` on GitHub Actions. This is compatible with Pages because it runs in the repository, not in the deployed site. A scheduled run can be added later if the maintainers want drift detection; it is not required for the first version.

### 6. No analytics by default

Pagefind search runs in the browser. Zero-result queries are visible only to that reader. The guide can offer a prefilled report link later, but it must not add a tracker just to count misses. Aggregate search feedback would require an external service and a privacy decision.

## Risks / Trade-offs

- **Private repository:** the feedback link is only useful to collaborators until the repository is public. This is explicitly documented.
- **Public issues:** once public, reports and email addresses may be visible. The form tells reporters not to include secrets or personal data.
- **Issue-form drift:** the form fields and the feedback page can diverge. The page links to the form, and the form is the source of truth for required fields.
- **No automatic aggregation:** maintainers must read issues. That is the cost of a static, privacy-respecting site.
