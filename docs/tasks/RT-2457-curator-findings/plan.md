# Plan

**Task:** RT-2457 · **Branch:** RT-2457-curator-findings
**Behaviour:** unchanged — rules, guards, checks and the pipeline settings change, no application code; the owner's word: «Все семь»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What     | Where                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package  | `projects/agent-kit/assets/agents/`, `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/hooks/`, `projects/agent-kit/assets/checks/` |
| Tests    | `projects/agent-kit/tests/`                                                                                                                      |
| Pipeline | `.github/workflows/ci.yml`                                                                                                                       |
| Rules    | `.claude/skills/ui-component-tests-visual/SKILL.md`, `.claude/skills/testing/implementation.md`, `.claude/skills/doc-style/implementation.md`    |

## What counts as done

- All seven findings stand in their places.
- Lifting the draft of a PR named by number judges the folder of that PR's branch.
- The pipeline and the local snapshot gate use different shot containers.
- The package is laid out again, and the layout audit matches.

## Stages

### 1. Texts of the package

- **Steps:**
    1. Add the room in the target to the two review roles
    2. Ask for a measurement before an article in spec-driven
    3. Rewrite the expiry article in doc-style and its companion line
- **Readiness sign:** the layout audit matches
- **Verified by:** `pnpm run agent-kit:check` — the laid-out matches the package

### 2. The folder guard

- **Steps:**
    1. Give the head branch in the PR state
    2. Judge the folder of the named PR's branch
    3. Write the scenarios
    4. Lay out the guard
- **Readiness sign:** every scenario passes
- **Verified by:** `pnpm run agent-kit:hooks` — the output names no failure

### 3. Texts and settings of the tree

- **Steps:**
    1. Give the pipeline its own shot container
    2. Add the two traps to the snapshot pattern
    3. Add the bare type check note to the testing companion
- **Readiness sign:** the path check names no divergence
- **Verified by:** `node tools/check-doc-paths.mjs` — no divergences

### 4. Closing

- **Steps:**
    1. Run the full suite
    2. Take the task folder apart into the archive
- **Readiness sign:** the suite is green and the folder is gone from the branch
- **Verified by:** `pnpm run check:all` — every project passes

## What this work does not do

- Moving the archive age check out of the push gate into the pipeline of the main branch: a
  change of the default set of every tree, a task of its own.
