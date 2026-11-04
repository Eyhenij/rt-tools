# Plan

**Task:** RT-3086 · **Branch:** RT-3086-scenario-long-prefixes
**Spec:** `docs/specs/agent-kit/checks/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                            |
| ----- | ---------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/checks/`                                   |
| Laws  | `docs/constitution/project-documentation.md`                     |
| Rules | `.claude/skills/spec-driven/`                                    |
| Code  | `projects/agent-kit/assets/checks/`, `projects/agent-kit/tests/` |

## What counts as done

- A scenario heading with a prefix of up to ten letters is parsed by default, and a test reference
  of the same width is read.
- The width is a key of the checks settings.
- A table row beginning with a scenario number is named as a discrepancy.
- The spec names the rule, the binding and the scenario; the specs suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the checks spec
    2. Add the scenario lines to the specs suite
- **Readiness sign:** the new lines fail on the old check
- **Verified by:** `bash projects/agent-kit/tests/checks-specs.test.sh` — the new lines fail

### 2. The check

- **Steps:**
    1. Build the heading and the reference from the width setting and name a table row
    2. Build the package and lay it out
- **Readiness sign:** the specs suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/checks-specs.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3086-scenario-long-prefixes` — empty output

## What this work does not do

- This tree's `tools/spec-next-id.mjs`.
- Reading table rows as scenarios.
