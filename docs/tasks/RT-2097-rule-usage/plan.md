# Plan

**Task:** RT-2097 · **Branch:** RT-2097-rule-usage
**Behaviour:** unchanged — the owner ordered the closing of the epic: main merged in, the branches cleaned; the renumbering of five scenarios changes no behaviour of the product

## Task footprint

| What  | Where                                                                                      |
| ----- | ------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/observations/cargo/` — the scenarios and the spec name five numbers  |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/project-documentation.md`              |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/spec-driven/`, `.claude/skills/task-flow/` |
| Code  | `projects/agent-kit/src/lib/observations-cargo.spec.ts` — the titles of five tests         |

## What counts as done

- The epic branch carries the tip of main, and the push gate lets it through.
- No scenario identifier is taken twice: `npm run check:specs` prints no `divergences` line.
- The PR of the epic into main is open, ready, with the owner as the reviewer.

## Stages

### 1. Main merged in, the scenario numbers set apart

- **What is done:** `origin/main` merged into the epic branch; the cargo scenarios take `SC-AK-1099`…`SC-AK-1103` in the scenarios, the spec and the test titles.
- **Readiness sign:** `check-specs` prints no `divergences` line; the agent-kit tests are green.
- **Verified by:** `node tools/check-specs.mjs` — no line starting with `check-specs: divergences`; `pnpm exec nx test @rt-tools/agent-kit` — `Tests … passed`.

### 2. The folder taken apart, the branch sent, the PR of the epic opened

- **What is done:** the record `docs/archive/RT-2097-rule-usage-line.md`, the folder removed by the last commit, the push, the PR into main.
- **Readiness sign:** the push goes through the gate; the PR is open with the base `main`.
- **Verified by:** `gh pr view <number> --json baseRefName,isDraft` — `main`.

## What this work does not do

- It does not touch the discard-guard scenarios: their numbers are already in main.
- It does not merge the PR of the epic: a person presses that.
