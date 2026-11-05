# Plan

**Task:** RT-3096 · **Branch:** RT-3096-plugin-browser-drivers
**Spec:** `docs/specs/agent-kit/browser-guards/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/browser-guards/`                          |
| Laws  | `docs/constitution/verifiability.md`                            |
| Rules | `.claude/skills/agent-kit/`                                     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- A call of the second and the third driver is refused both by the plain name and by the plugin
  name; a call of the pinned extension passes.
- The spec names the rule, the binding and the scenario; the suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the browser-guards spec
    2. Add the scenario lines to the driver guard suite
- **Readiness sign:** the new lines fail on the old guard
- **Verified by:** `bash projects/agent-kit/tests/browser-guard-drivers.test.sh` — the new lines fail

### 2. The guard

- **Steps:**
    1. Match the plugin names of the drivers in the guard
    2. Build the package and lay it out
- **Readiness sign:** the suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/browser-guard-drivers.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3096-plugin-browser-drivers` — empty output

## What this work does not do

- Other plugin tools than the two browser drivers.
