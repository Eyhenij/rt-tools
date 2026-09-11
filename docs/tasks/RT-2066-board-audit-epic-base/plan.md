# Plan

**Task:** RT-2066 · **Branch:** RT-2066-board-audit-epic-base
**Behaviour:** unchanged — the work edits the work queue audit and the texts around it; no
application code is touched, and the owner said in their own words what the order of handing in is.

## Task footprint

| What  | Where                                                                                        |
| ----- | -------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/board/`                                                                |
| Rules | `.claude/skills/git-workflow/`                                                               |
| Code  | `projects/agent-kit/assets/checks/board-pull-state.github.mjs`, `tools/board-pull-state.mjs` |
| Tests | `projects/agent-kit/tests/checks-board.test.sh`                                              |
| Plan  | `docs/plans/cargo-intake.md` — row 12 of the makeup                                          |

## What counts as done

- A request whose base is not the main branch is not counted a discrepancy for having no run: that
  is the accepted order, and the audit says nothing about it.
- The advice to move the base to the main branch is gone: for a task of an epic the base stays the
  epic branch to the merge.
- A request into the main branch without a run is judged as before, by the line about a lost event.
- The spec, the scenario and the probes say the same as the check.

## Stages

### 1. The audit stops counting such a request a discrepancy

- **What is done:** the branch about a base other than the main one in
  `projects/agent-kit/assets/checks/board-pull-state.github.mjs` reports nothing and returns; the
  copy `tools/board-pull-state.mjs` gets the same, and the comment above it names the new reason.
- **Readiness sign:** the audit of this tree prints no line about a base for an open request, and
  a request into the main branch is still judged by the line about a lost event.
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh` — 80 probes without
  failures before the edit, and the probes of SC-AK-845 are rewritten in stage 2.

### 2. The spec, the scenario and the probes

- **What is done:** the rule item of `docs/specs/agent-kit/board/spec.md`, the scenario SC-AK-845
  and the binding in the companion are rewritten to the new behaviour; the three probes of the
  scenario in `projects/agent-kit/tests/checks-board.test.sh` judge silence instead of the line.
- **Readiness sign:** the scenario number stays, its text names silence, and the probes assert it.
- **Verified by:** `npm run check:specs` — the `board` area has no divergences.

### 3. Delivery: layout, checks, the makeup

- **What is done:** the package is built and laid out, the whole check set is run, row 12 of the
  epic plan says the state, the folder is taken apart into the description of the past and the PR
  opens ready, since its base is the epic branch.
- **Readiness sign:** the laid-out files match the package and the checks are green.
- **Verified by:** `pnpm run agent-kit:check && npm run check:specs && npm run check:docs && node tools/check-file-size.mjs`
  — every one of the four says no divergences.

## What this work does not do

- It does not teach the check to read the pipeline file. Which bases wake a run is a question of
  its own, and this tree does not need the answer: its trigger names the main branch.
- It does not touch the lines of the audit about a lag, a conflict or a draft: they judge other
  things and this order does not move them.
