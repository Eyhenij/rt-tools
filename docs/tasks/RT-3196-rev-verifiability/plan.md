# Plan

**Task:** RT-3196 · **Branch:** RT-3196-rev-verifiability
**Behaviour:** unchanged — the owner ordered a revision of the package texts, «По семьям законов, правки сразу»; application code is not touched

## Points

- **A:** the texts of the verifiability family were edited one finding at a time. The rules graph
  report names 26 articles of the family held by memory: testing 14 of 42, browser-verification
  12 of 23; one pair of repeats names a text of the family.
- **This task reaches:** every divergence and gap of the family is fixed in the package texts or
  has a named owner: a task or a law question to the owner.
- **Sign:** the archive record of RT-3196 lists every finding with how it was closed; `pnpm run
agent-kit:check`, `npm run check:specs`, `npm run check:spec-coverage` exit 0.
- **Milestone G of the epic:** a new package version on npm carries the revised texts, and the
  rules graph report after the revision is shorter than before it.
- **Metric:** articles of the family held by memory in `projects/agent-kit/rules-graph/REPORT.md`,
  baseline 26, should not grow; pairs of repeats in the package, baseline 16, should not grow.

## Task footprint

| What     | Where                                                                     |
| -------- | ------------------------------------------------------------------------- |
| Law      | `projects/agent-kit/assets/laws/verifiability.md` — read only             |
| Rules    | `projects/agent-kit/assets/rules/` — testing, browser-verification        |
| Patterns | `projects/agent-kit/assets/patterns/` — testing-_, browser-verification-_ |
| Bindings | `.claude/skills/<rule>/implementation.md`, `docs/specs/agent-kit/`        |

## What counts as done

- Every finding of the role and of the binding comparison is in the archive record with how it
  was closed.
- `pnpm run agent-kit:check`, `npm run check:specs`, `npm run check:spec-coverage` exit 0.

## Stages

### 1. Findings

- **Steps:**
    1. Run the role rules-reviewer over the whole family
    2. Compare rule articles with the companion bindings and hook code
    3. Write the findings list into the progress with a decision for each
- **Readiness sign:** every finding in the progress has a decision: fix here, task, or law question.
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
- **Readiness sign:** the gate is green.
- **Verified by:** `npm run graph:rules` — prints «0 unlinked».

## What this work does not do

- Does not edit a law article without the owner's answer in this task.
- Does not review other families: they have their own tasks.
