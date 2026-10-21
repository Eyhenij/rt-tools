# Plan

**Task:** RT-2929 · **Branch:** RT-2929-cargo-rules
**Behaviour:** unchanged — the owner ordered «разбери всё новое что есть в приёмнике»; this task edits rule and pattern texts of the package only, no code of an application or a check

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What       | Where                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules      | `projects/agent-kit/assets/rules/dependencies.md`, `projects/agent-kit/assets/rules/reuse-first.md`, `projects/agent-kit/assets/rules/testing.md`                                 |
| Patterns   | `projects/agent-kit/assets/patterns/dependencies-upgrade.md`, `projects/agent-kit/assets/patterns/reuse-first-extend.md`, `projects/agent-kit/assets/patterns/task-flow-start.md` |
| Cold part  | `projects/agent-kit/assets/pitfalls/task-flow.md`                                                                                                                                 |
| Companions | `.claude/skills/reuse-first/implementation.md`, `.claude/skills/testing/implementation.md`                                                                                        |

## What counts as done

- Each of the seven cases has its text in its resource: five as an article or a section of a rule
  or a pattern, the deferred suspicion as a pitfall under the existing article of `task-flow`.
- A new rule article has its line in the companion of this tree.
- The layout matches the package, the size check and the specs check are clean.

## Stages

### 1. The texts of the seven cases

- **Steps:**
    1. Append the skipped releases to the styling-package article of `dependencies`
    2. Add the strict install after a declaration edit to step 2 of `dependencies-upgrade`
    3. Add the consumer suite against the packed kit branch to `reuse-first-extend`
    4. Add the article about a foreign service logo to `reuse-first`
    5. Add the article about a build edit checked from scratch to `testing`
    6. Add what declaring an epic writes to `task-flow-start`
    7. Add the deferred suspicion to the cold part of `task-flow`
- **Readiness sign:** every case has its paragraph, and the size check names no resource.
- **Verified by:** `node tools/check-file-size.mjs` — the line «longer than the limit 0»

### 2. Bindings and layout

- **Steps:**
    1. Write the companion lines for the two new rule articles
    2. Lay out the package and run the checks
- **Readiness sign:** the layout check is clean and the specs check exits zero.
- **Verified by:** `pnpm run agent-kit:check` — the line «разложенное сходится с пакетом»

## What this work does not do

- Does not edit `turn-conduct`: it stands at the character limit, and the deferred suspicion is
  already required by the `task-flow` article about postponed work.
- Does not close the records in the intake: they are foreign, and the publisher closes them after
  the epic is merged into the main branch.
