# Plan

**Task:** RT-3088 · **Branch:** RT-3088-spec-length-before-merge
**Behaviour:** unchanged — a text of a package pattern; no application code, no spec rule binds the paragraph.

## Task footprint

| What  | Where                                 |
| ----- | ------------------------------------- |
| Specs | `docs/specs/agent-kit/patterns/`      |
| Laws  | `docs/constitution/work-conduct.md`   |
| Rules | `.claude/skills/task-flow/`           |
| Code  | `projects/agent-kit/assets/patterns/` |

## What counts as done

- The closing pattern says the domain spec is measured before the merge of an agreement and before a
  direct edit adds a rule or a scenario, and a spec over the limit is split by a separate commit
  first.
- The package is built and laid out; the layout audit matches.

## Stages

### 1. The pattern

- **Steps:**
    1. Edit the "When to use" item and the length paragraph of the closing pattern
    2. Build the package and lay it out
- **Readiness sign:** the laid-out copy carries the new paragraph and matches the package
- **Verified by:** `pnpm run agent-kit:check` — the laid-out matches

### 2. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3088-spec-length-before-merge` — empty output

## What this work does not do

- A check that measures the spec at the edit itself.
- The scenario parser of RT-3086.
