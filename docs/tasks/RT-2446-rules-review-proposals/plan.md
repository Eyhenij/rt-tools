# Plan

**Task:** RT-2446 · **Branch:** RT-2446-rules-review-proposals
**Behaviour:** unchanged — the owner ordered the rules proposals applied: «применяй предложения по правилам»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What      | Where                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules     | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests-visual/`, `.claude/skills/testing/`, `.claude/skills/spec-driven/` |
| Package   | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/patterns/`, `projects/agent-kit/assets/hooks/`                                                                                                         |
| Tests     | `projects/agent-kit/tests/`                                                                                                                                                                                           |
| Overrides | `.claude/rt-kit/overrides/patterns/testing-e2e.md`                                                                                                                                                                    |

## What counts as done

- Every proposal of the seven reviews and of the incident analysis stands in its place, or the
  progress names why it was dropped.
- The package is laid out again, and the layout audit matches.
- A guard refuses the flag that skips the commit checks on `git commit` and `git push`, and lets the
  same commands through without it.

## Stages

### 1. Texts of this tree

- **Steps:**
    1. Edit the rule ui-component-tests: the order, the commands, three pitfalls and the cold part
    2. Edit the showcase rule and its companion: fonts in play, the themes pair
    3. Edit the styling rule and its companion: the token graph check
    4. Edit the re-take pattern, the testing companion and the spec-driven companion
    5. Append the address limit to the end-to-end override
- **Readiness sign:** the path check names no divergence
- **Verified by:** `node tools/check-doc-paths.mjs` — the output says no divergences

### 2. Texts of the package

- **Steps:**
    1. Edit the package rules spec-driven and doc-style
    2. Edit the package patterns task-flow-start, testing-e2e and git-workflow-commit
    3. Lay out the package
- **Readiness sign:** the layout audit matches
- **Verified by:** `pnpm run agent-kit:check` — the output says the laid-out matches the package

### 3. The guard

- **Steps:**
    1. Write the guard of the flag that skips the commit checks
    2. Write its scenarios
    3. Lay out the guard
- **Readiness sign:** every scenario passes, and the layout audit matches
- **Verified by:** `pnpm run agent-kit:hooks` — the output names no failure

### 4. Closing

- **Steps:**
    1. Run the full suite
    2. Take the task folder apart into the archive
- **Readiness sign:** the suite is green and the folder is gone from the branch
- **Verified by:** `pnpm run check:all` — every project passes

## What this work does not do

- A `typecheck` target for the receiver's libs on Vitest: the review named it a tooling gap, and it
  is a task of its own.
- Moving the themes pair of the showcase onto the wrapping row: a task of its own.
