# Plan

**Task:** RT-3095 · **Branch:** RT-3095-dispatch-one-json
**Spec:** `docs/specs/agent-kit/dispatch/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/dispatch/`                                |
| Laws  | `docs/constitution/project-documentation.md`                    |
| Rules | `.claude/skills/agent-kit/`                                     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- Two guards answering one event give one JSON object: both contexts in `additionalContext`, the
  event name in `hookEventName`, plain text in the context too.
- A single guard's answer is given out unchanged.
- The spec names the rule, the binding and the scenario; the suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the dispatch spec
    2. Add the scenario lines to the dispatcher suite
- **Readiness sign:** the new lines fail on the old dispatcher
- **Verified by:** `bash projects/agent-kit/tests/dispatch.test.sh` — the new lines fail

### 2. The dispatcher

- **Steps:**
    1. Merge the answers of several branches into one object
    2. Build the package and lay it out
- **Readiness sign:** the suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/dispatch.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3095-dispatch-one-json` — empty output

## What this work does not do

- The refusal path of the dispatcher.
