# Tasks

## 1. Add the feedback page

- [x] 1.1 Create `src/content/docs/reference/feedback.md` with what to report, required fields, the private-repository note, the handling loop, and links to User Documentation and the Style Guide; verify the page has no body H1.
- [x] 1.2 Add the page to the Reference sidebar after Style Guide; verify it appears in navigation.
- [x] 1.3 Add a `Feedback` link to `src/components/PageTitle.astro` next to the Markdown link; verify every content page renders it and the layout still works at narrow widths.

## 2. Add the issue form

- [x] 2.1 Create `.github/ISSUE_TEMPLATE/docs-feedback.yml` with page, section, quote, expected, actual, version/commit, target, reporter type, source, and a no-secrets checkbox; verify the YAML parses and the field IDs are unique.
- [x] 2.2 Create the `agent-report` label and confirm the `documentation` label exists; verify the form's labels resolve in the repository.

## 3. Add repository automation and agent guidance

- [x] 3.1 Create `.github/workflows/check-docs.yml` to run `npm run check:docs` on push and pull request with Node 22 and npm cache; verify the workflow YAML parses.
- [x] 3.2 Add the `gh issue create` protocol to `AGENTS.md` and the private-repository note to `README.md`; verify the commands and URLs match the repository.
- [x] 3.3 Add a feedback note to `ship/documentation.md` linking the page and the issue form; verify no duplicate feedback process is introduced.

## 4. Verify

- [x] 4.1 Run `npm run check:docs`; verify the feedback page builds, is indexed, and all internal links and anchors pass.
- [x] 4.2 Run `npm run check:quality -- --no-build`; verify Lighthouse remains at the existing thresholds.
- [x] 4.3 Validate the issue form and workflow YAML with Node; verify both parse without errors.
- [x] 4.4 Fix the MCP page test to use the system temp directory so the workflow runs on a clean runner; verify `npm run test:docs-mcp` passes.
- [x] 4.5 Commit and push; verify the repository is still private, the default branch is `main`, and the workflow passes on GitHub Actions.
