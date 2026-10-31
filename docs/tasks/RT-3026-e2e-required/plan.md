# Plan

**Task:** RT-3026 · **Branch:** RT-3026-e2e-required
**Behaviour:** unchanged — the work edits the rules layer and a guard of the agent, no application code: «пиши себе в правила и гарды»

## Task footprint

| What   | Where                                         |
| ------ | --------------------------------------------- |
| Laws   | `docs/constitution/verifiability.md`          |
| Guards | `.claude/hooks/`, `.claude/rt-kit/project.sh` |

## What counts as done

- The laid-out law holds the section «End-to-end coverage of a change».
- Opening a PR from a branch that touches the entry module or the receiver without touching its
  end-to-end suite is refused, and the refusal names the suite.
- A commit body line `E2E-skip: <reason>` with a non-empty reason lets such a PR open.

## Stages

### 1. Law

- **Steps:**
    1. Append the section to the law override and lay it out
    2. Commit the law
- **Readiness sign:** the laid-out law holds the section, and the layout audit is clean.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0.

### 2. Guard

- **Steps:**
    1. Write the guard on opening a PR
    2. Write the guard scenarios
    3. Commit the guard
- **Readiness sign:** the scenarios cover a refusal, a pass with the suite touched and a pass with
  the skip line.
- **Verified by:** `bash .claude/hooks/tests/e2e-coverage-guard.test.sh` — every line `ok`.

## What this work does not do

- It does not write the missing end-to-end tests for past work.
