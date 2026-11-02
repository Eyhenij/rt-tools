# Plan

**Task:** RT-3036 · **Branch:** RT-3036-pr-base-refresh
**Behaviour:** unchanged — a text of the rules layer, no application code. The owner asked for it: «обнови гит флоу правила чтобы правильно открывать пр».

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/patterns/spec.md`                                                                                            |
| Laws  | `docs/constitution/delivery.md` — read, not edited                                                                                 |
| Rules | `.claude/skills/git-workflow-pr/`, `.claude/skills/git-workflow-commit/`                                                           |
| Code  | `projects/agent-kit/assets/patterns/git-workflow-pr.github.md`, `projects/agent-kit/assets/patterns/git-workflow-commit.github.md` |

## What counts as done

- The PR pattern names the match of the PR's commit count against the branch comparison after a
  push with a merge of the base, and the call that makes the host recount.
- The commit pattern names the tie of a local branch to the branch of the PR it continues, and the
  push into it by name.
- The laid-out copies match the package sources, and the package checks are green.

## Stages

### 1. Both patterns name the steps

- **Steps:**
    1. The PR pattern gets the count match and the recount call
    2. The commit pattern gets the tie to the PR branch
    3. The package is built and laid out
- **Readiness sign:** the laid-out copies carry both paragraphs, the audit finds no divergence.
- **Verified by:** `pnpm run agent-kit:check` — exit 0, no divergence lines.

### 2. The texts pass the tree's checks

- **Steps:**
    1. The spec, description and size checks run
    2. The package test suite runs
- **Readiness sign:** every check exits 0.
- **Verified by:** `node tools/check-file-size.mjs` — exit 0, both patterns under 330 lines and 24 000 characters.

## What this work does not do

- No new guard or check that matches the PR count by itself: the owner asked for the rules.
- PR #3014 is not touched: its count was already fixed by the recount call on 2 November 2026.
