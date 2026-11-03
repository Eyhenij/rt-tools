# Plan

**Task:** RT-3092 · **Branch:** RT-3092-push-gate-ahead
**Spec:** `docs/specs/agent-kit/push-gate-ahead/spec.md`
**Behaviour:** unchanged — the push guard of the agent layer, no application code. Подтверждено владельцем: «убедись что меры подходящие и оптимальные и делай все».

## Task footprint

| What  | Where                                                                                        |
| ----- | -------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`, `docs/specs/agent-kit/spec.md`                      |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md`                        |
| Rules | `.claude/skills/git-workflow/`                                                               |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/`, `.claude/rt-kit/project.sh` |

## What counts as done

- A stacked branch counts its set against the branch it was created from.
- A check that passed on the same tree and base is not run again on a clean working copy.
- A heavy step of a tree that opted in is not run inside the guard: the guard refuses at once and
  names the command that runs it ahead, and after that command the push passes from the marks.
- The guard scenarios are green, and the layout matches the package.

## Stages

### 1. The base and the marks

- **Steps:**
    1. A helper next to the guard: the base from the branch reflog, the mark key, reading and writing a mark
    2. The guard takes the base and the marks from the helper
- **Readiness sign:** the guard suite is green with the new scenarios
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — the last line names no failure

### 2. The heavy steps ahead

- **Steps:**
    1. The command that runs the whole set ahead and writes the marks
    2. The guard refuses a heavy step without a mark where the tree opted in
    3. The tree profile opts in
- **Readiness sign:** a heavy step without a mark is refused at once, and passes after the command
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — the last line names no failure

### 3. The spec, the layout and the checks

- **Steps:**
    1. The subdomain spec with scenarios and binding
    2. The layout of the package into the tree
    3. The hook suite, the spec check and the layout audit
- **Readiness sign:** all three are green
- **Verified by:** `pnpm run agent-kit:check` — exits with zero

## What this work does not do

- It does not shorten the heavy steps themselves: the showcase snapshots stay about 23 minutes.
- It does not change what the pipeline runs.
