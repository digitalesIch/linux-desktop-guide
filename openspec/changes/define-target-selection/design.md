# Design

## Context

See `proposal.md`. Linux has no single vendor that defines a platform. The guide cannot change that, but it can define a small, defensible set of development targets and make the choice for the reader. The selection must be repeatable: another maintainer should be able to re-run the evidence collection and reach a similar result.

## Goals / Non-Goals

**Goals:**

- A published criteria catalog with weights and evidence sources.
- A target matrix derived from those criteria, not from preference.
- A clear role for every target: reference, validation, or compatibility.
- A reproducible development environment per reference target.
- A review cycle that removes targets when they stop meeting the gates.

**Non-Goals:**

- Cover every distribution or desktop.
- Rank distributions for their own sake.
- Treat popularity as quality.
- Promise support for rolling or niche targets.
- Replace the existing platform, design, engineering, or ship chapters.

## Decisions

### 1. Two-stage selection

First select the **desktop/platform stacks** that matter (for example GNOME/GTK and KDE/Qt), then select the **distribution representatives** for each stack. This prevents a matrix of every distro × desktop combination.

Stack criteria:

- adoption among Linux desktop users;
- momentum in releases, contributors, and upstream adoption;
- toolkit/HIG maturity, Wayland, portals, Flatpak, AppStream, accessibility;
- coverage of the major native stacks.

Distribution criteria:

- adoption proxies;
- release cadence and support window;
- official developer environment (containers, VMs, CI images, toolchains);
- platform quality and packaging integration;
- role fit (LTS, current, stable, rolling).

### 2. Criteria and starting weights

| Criterion | Weight | What it answers |
| --- | --- | --- |
| Adoption / popularity | 25% | Where are the users? |
| Momentum | 25% | Is the platform growing and maintained? |
| Developer environment | 20% | Can a developer reproduce a good setup? |
| Platform quality | 20% | Does it meet the native standard? |
| Longevity / support | 10% | Will it still be viable in two years? |

Coverage and role are portfolio gates, not weighted criteria. The weights are a starting point, documented so they can be challenged; they are not a claim of scientific precision.

### Scoring rubric

Score each criterion from 0 to 3:

| Score | Meaning |
| --- | --- |
| 0 | Absent, contradicted, or unverified |
| 1 | Weak or ad hoc |
| 2 | Adequate and documented |
| 3 | Strong and independently verifiable |

Record the evidence, source URL, check date, and confidence next to each score. A weighted total is a sorting aid, not the final decision: the matrix must also satisfy the coverage gates and role fit.

Sub-metrics to check:

- **Adoption:** Steam Hardware Survey distro share; Fedora countme; Debian popcon; Arch pkgstats; default/preinstall presence; DistroWatch page hits only as a weak proxy.
- **Momentum:** releases in the last 12 months; active contributors and reviewers; foundation or corporate backing; roadmap activity; upstream adoption; security response.
- **Developer environment:** official container/VM/CI images; toolchain and SDK freshness; documentation; reproducible builds; CI runner availability.
- **Platform quality:** Wayland default; portals; Flatpak/AppStream; accessibility stack; HIG/toolkit maturity; sandboxing and security.
- **Longevity:** support window; LTS/stable policy; upgrade path; governance and funding.

### 3. Evidence, not market-share theatre

Use primary sources and label proxies:

- Steam Hardware Survey for distro share (gaming bias);
- Fedora countme, Debian popcon, Arch pkgstats (opt-in; platform-specific);
- DistroWatch page hits (weak proxy; never call it installs or market share);
- official release notes, support schedules, governance pages, and foundation reports;
- official container/VM/CI images and toolchain documentation;
- Flathub/AppStream/portal/accessibility evidence;
- OpenSSF Scorecard and Reproducible Builds where relevant.

Every metric gets a source URL, a check date, and a confidence note. Missing data is written as "not verified", not estimated.

### 4. Roles, not a flat ranking

- **Reference target:** highest overall evidence and quality; gets the full golden path and documentation.
- **Validation target:** same stack, different release model; used in CI/QA, not a second full tutorial.
- **Compatibility target:** older or conservative base; documents caveats and migration paths.

The final matrix is a portfolio decision: a high score does not automatically make a target a reference target if it does not add coverage.

### 5. Coverage constraints

The matrix must include:

- at least one GNOME/GTK target and one KDE/Qt target;
- at least one LTS/stable target and one current/rolling target;
- at least one deb-based and one rpm-based distribution;
- no target that lacks Wayland, portals, Flatpak, AppStream, or a maintained accessibility stack.

The constraints are gates, not popularity signals.

### 6. Apple-level documentation structure

Borrow the clarity and opinionation of a vendor platform guide without making another OS the comparison point:

1. platform/target overview;
2. design language and HIG per target;
3. technology and stack guides;
4. tutorials and sample code;
5. distribution and updates;
6. reference baselines and quality signals.

For each reference target, publish a **development environment spec**: distro image, pinned packages, toolkit versions, Flatpak runtime, and the commands to reproduce it. The distro cannot be changed, but the development environment can be defined.

### 7. Machine-readable matrix

Store the selected matrix in `src/data/targets.json`. The data records each target's role, stack, release model, base, support window, scores, evidence sources, and review date. `scripts/check-targets.mjs` validates dates, scores, weights, source URLs, roles, and the coverage gates, and `check:docs` runs it before the build.

The page remains the human-readable explanation; the JSON is the auditable source for the matrix. The docs MCP and agent-doc generator include the `targets` section so the target pages are searchable and downloadable like the rest of the guide.

### 8. Review cadence

Re-check the matrix every six months or at each Ubuntu/Fedora release, whichever comes first. Record the review date. Remove or demote a target when it fails a gate, loses maintenance, or no longer adds coverage.

## Risks / Trade-offs

- **Popularity data is noisy** → use multiple proxies, confidence notes, and never present a single ranking as truth.
- **Weights are subjective** → publish them, keep them adjustable, and require a rationale for every selected target.
- **Too many targets** → cap the reference set; use validation and compatibility roles for the rest.
- **Matrix becomes stale** → review dates and a removal rule.
- **The guide becomes a distro comparison** → keep the focus on building quality apps; the matrix is a means, not the product.
