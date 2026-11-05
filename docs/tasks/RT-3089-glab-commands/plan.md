# Plan

**Task:** RT-3089 · **Branch:** RT-3089-glab-commands
**Spec:** `docs/specs/agent-kit/turn-claims/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-claims/`                             |
| Laws  | `docs/constitution/work-conduct.md`                             |
| Rules | `.claude/skills/turn-conduct/`                                  |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- The waiting guard counts `glab mr update --ready` and `glab ci status|view` as asking about the
  handed-over work.
- The turn-exit patterns recognise `glab mr create` as an opened request.
- The claim guard confirms the merge, the run and the request claims by `glab` commands.
- The rerun guard judges `glab ci retry <id>` and counts `glab ci trace <id>` as the read log.
- The spec names the rule, the binding and the scenario; the suites are green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the turn-claims spec
    2. Add the scenario lines to the four guard suites
- **Readiness sign:** the new lines fail on the old guards
- **Verified by:** `bash projects/agent-kit/tests/claim-guard.test.sh` — the new lines fail

### 2. The guards

- **Steps:**
    1. Add the glab forms to the four guards
    2. Build the package and lay it out
- **Readiness sign:** the four suites pass whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/rerun-guard.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3089-glab-commands` — empty output

## What this work does not do

- The Azure client forms.
