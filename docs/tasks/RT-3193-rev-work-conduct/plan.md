# Plan

**Task:** RT-3193 · **Branch:** RT-3193-rev-work-conduct
**Behaviour:** unchanged — the owner ordered a revision of the package texts, «По семьям законов, правки сразу»; application code is not touched

## Points

- **A:** the texts of the work-conduct family were edited one finding at a time and never read
  together. The rules graph report names 61 articles of the family that the companion marks «Not
  checked» or «Not carried out», and the pipeline `feature.js` that no package text names.
- **This task reaches:** every divergence and gap of the family found by the reviewer role and by
  the comparison with the bindings is either fixed in the package texts or has a named owner: a
  task in the queue or a law article as text for the owner.
- **Sign:** the archive record of RT-3193 lists every finding with how it was closed; `pnpm run
agent-kit:check`, `npm run check:specs`, `npm run check:spec-coverage` exit 0; the rules graph
  report no longer lists `feature.js` among resources nothing links to.
- **Milestone G of the epic:** a new package version on npm carries the revised texts, and the
  rules graph report after the revision is shorter than before it.
- **Metric:** articles of the family held by memory in `projects/agent-kit/rules-graph/REPORT.md`,
  baseline 61 (turn-conduct 27, task-flow 23, status-report 7, epic-flow 4, turn-entry 0), should
  not grow; resources nothing links to, baseline 1, should fall to 0.

## Task footprint

| What     | Where                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Law      | `projects/agent-kit/assets/laws/work-conduct.md` — read only, articles go to the owner as text              |
| Rules    | `projects/agent-kit/assets/rules/` — task-flow, epic-flow, turn-conduct, turn-entry, status-report          |
| Patterns | `projects/agent-kit/assets/patterns/` — task-flow-*, epic-flow-declare, turn-entry-map, status-report-table |
| Pitfalls | `projects/agent-kit/assets/pitfalls/` — task-flow, turn-conduct                                             |
| Bindings | `.claude/skills/<rule>/implementation.md`, `docs/specs/agent-kit/`                                          |
| Graph    | `projects/agent-kit/rules-graph/`                                                                           |

## What counts as done

- Every finding of the role and of the binding comparison is in the archive record with how it
  was closed.
- No package text of the family contradicts another text of the family on the findings found.
- `feature.js` is named by the rule `task-flow`.
- `pnpm run agent-kit:check`, `npm run check:specs`, `npm run check:spec-coverage` exit 0.

## Stages

### 1. Findings

- **Steps:**
    1. Run the role rules-reviewer over the whole family
    2. Compare rule articles with the companion bindings and hook code
    3. Write the findings list into the progress with a decision for each
- **Readiness sign:** every finding in the progress has a decision: fix here, task, or law text.
- **Verified by:** `node tools/check-work-steps.mjs` — exits 0.

### 2. Fixes

- **Steps:**
    1. Edit the package texts by the findings
    2. Build the package and lay out the tree
    3. File tasks for findings that need code or another law
- **Readiness sign:** the laid-out copies match the package, specs are whole.
- **Verified by:** `pnpm run agent-kit:check` — prints «разложенное сходится с пакетом»;
  `npm run check:spec-coverage` — prints «every resource the package carries is spoken of by a spec».

### 3. Closing

- **Steps:**
    1. Rebuild the rules graph and its report
    2. Run the push gate
    3. Take the task folder apart into the archive
- **Readiness sign:** the report has no resource nothing links to, the gate is green.
- **Verified by:** `npm run graph:rules` — prints «0 unlinked».

## What this work does not do

- Does not edit the law in the branch: a law article goes to the owner as text.
- Does not change hook or check behaviour, except a divergence between a rule statement and its
  executor, with its own scenario.
- Does not review other families: they have tasks RT-3194–RT-3209.
