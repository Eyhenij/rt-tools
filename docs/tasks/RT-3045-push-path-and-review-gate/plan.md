# Plan

**Task:** RT-3045 · **Branch:** RT-3045-push-path-and-review-gate
**Behaviour:** unchanged — an edit of rule texts only, no application code; decided by the owner's
epic grill of 03.11.2026.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-gate/spec.md` — compared, not edited                                                                                           |
| Laws  | `docs/constitution/delivery.md` — read, not edited                                                                                                            |
| Rules | `projects/agent-kit/assets/rules/git-workflow.github.md`, laid out to `.claude/skills/git-workflow/SKILL.md`; `.claude/skills/git-workflow/implementation.md` |
| Code  | none                                                                                                                                                          |

## What counts as done

- The rule holds three articles: a push only by the path the push guard stands on; a review of a
  foreign branch starts with the gate set run on its tip; without the git hook the set is run from
  the profile, whole, at the minute of the run.
- Each of the three has a binding line in `.claude/skills/git-workflow/implementation.md`.
- The laid-out copy matches the source, and the rule stays under its length limits.

## Stages

### 1. Articles of the rule

- **Steps:**
    1. Write the three articles in the package source of the rule
    2. Lay the rule out by `pnpm run agent-kit:sync`
- **Readiness sign:** the laid-out copy matches the package
- **Verified by:** `pnpm run agent-kit:check` — the line «разложенное сходится с пакетом»

### 2. Bindings of the articles

- **Steps:**
    1. Write the three binding lines in the companion of the rule
    2. Run the spec audit
- **Readiness sign:** the audit names no article of `git-workflow` without a line
- **Verified by:** `pnpm run check:specs` — exit code 0

### 3. Checks of the tree

- **Steps:**
    1. Run the length and glossary checks
    2. Run the gate set from the profile function whole
- **Readiness sign:** no check is red
- **Verified by:** `node tools/check-file-size.mjs` — the line «longer than the limit 0»

## What this work does not do

- A single command that runs the gate set whole. It would be code with its own tests; filed as a
  finding next to the epic plan.
- The guard of the terminal tab: done by RT-3044.
