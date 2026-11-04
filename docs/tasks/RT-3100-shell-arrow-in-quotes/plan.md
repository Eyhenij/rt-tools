# Plan

**Task:** RT-3100 · **Branch:** RT-3100-shell-arrow-in-quotes
**Spec:** `docs/specs/agent-kit/edit-place/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/edit-place/`                              |
| Laws  | `docs/constitution/project-documentation.md`                    |
| Rules | `.claude/skills/agent-kit/`                                     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- An arrow inside single, double or back quotes gives no write target; `echo x > out` still gives
  `out`.
- The exam guard's refusal carries the path of the config.
- The spec names the rule, the binding and the scenario; the suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the edit-place spec
    2. Add the scenario lines to the write-path suite
- **Readiness sign:** the new lines fail on the old helper
- **Verified by:** `bash projects/agent-kit/tests/shell-write-paths.test.sh` — the new lines fail

### 2. The guards

- **Steps:**
    1. Drop the quoted arrow before the redirection parse and fix the exam refusal
    2. Build the package and lay it out
- **Readiness sign:** the suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/shell-write-paths.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3100-shell-arrow-in-quotes` — empty output

## What this work does not do

- The parse of the interpreter bodies.
