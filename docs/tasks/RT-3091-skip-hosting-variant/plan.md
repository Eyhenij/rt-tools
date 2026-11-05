# Plan

**Task:** RT-3091 · **Branch:** RT-3091-skip-hosting-variant
**Spec:** `docs/specs/agent-kit/texts/spec-checks/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                            |
| ----- | ---------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/texts/spec-checks/`                        |
| Laws  | `docs/constitution/project-documentation.md`                     |
| Rules | `.claude/skills/spec-driven/`                                    |
| Code  | `projects/agent-kit/assets/checks/`, `projects/agent-kit/tests/` |

## What counts as done

- A tree skipping the only pattern of a rule in a hosting variant gets no "has no pattern at all"
  line about that rule; a skip without a variant still counts as before.
- The spec names the rule, the binding and the scenario; the suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the spec-checks spec
    2. Add the scenario lines to the spec checks suite
- **Readiness sign:** the new line fails on the old check
- **Verified by:** `bash projects/agent-kit/tests/checks-specs.test.sh` — the new line fails

### 2. The check

- **Steps:**
    1. Cut the variant off the skipped pattern name
    2. Build the package and lay it out
- **Readiness sign:** the suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/checks-specs.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3091-skip-hosting-variant` — empty output

## What this work does not do

- The layout of variants itself.
