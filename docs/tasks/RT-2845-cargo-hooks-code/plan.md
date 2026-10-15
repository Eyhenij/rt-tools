# Plan

**Task:** RT-2845 · **Branch:** RT-2845-cargo-hooks-code
**Spec:** `docs/specs/agent-kit/dispatch/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/dispatch/`, `docs/specs/agent-kit/rule-gate/`, `docs/specs/agent-kit/delivery-epic/`, `docs/specs/agent-kit/epic-stop/`, `docs/specs/agent-kit/specs-entry/`, `docs/specs/agent-kit/board/`                                                                                                                                                                                                                   |
| Laws  | none                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Rules | none edited; the laid-out copies come from `pnpm run agent-kit:sync`                                                                                                                                                                                                                                                                                                                                                                |
| Code  | `projects/agent-kit/assets/hooks/dispatch.sh`, `projects/agent-kit/assets/hooks/skill-gate-rearm.sh`, `projects/agent-kit/assets/defaults/shell.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh`, `projects/agent-kit/assets/hooks/epic-stop-guard.sh`, `projects/agent-kit/assets/checks/task-new.github.mjs`, `projects/agent-kit/assets/checks/spec-anchors.mjs`, their tests under `projects/agent-kit/tests/` |

## What counts as done

- A refusal of a branch reaches the executor in the error stream too, proved by a test that splits
  the two streams; or the record is shown not reproducible and nothing is changed.
- The re-arm hook names the rules the session had loaded and asks to load them in one turn.
- An interpreter with code in an argument counts as a write only when the code holds a write call.
- The delivery guard takes the main branch as the base once the epic is merged into it.
- The epic stop refusal says up to which call a declared new epic needs the bypass line.
- `task:new` names a missing label with the list of existing ones before creating anything.
- A binding cell with a path-like token that lost its colon is refused.
- `pnpm run agent-kit:hooks` and `pnpm run agent-kit:check` pass.

## Stages

### 1. Refusals reach the executor

- **Steps:**
    1. Reproduce the symptom: split stdout and stderr in the dispatcher test and call a refusing branch with code 2.
    2. If the text is lost, write the refusal to the error stream too and keep the output stream as it was.
    3. Add the scenario to the dispatch spec and the test.
- **Readiness sign:** the dispatch test names a refusal in the error stream.
- **Verified by:** `bash projects/agent-kit/tests/dispatch.test.sh` — no `FAIL` line.

### 2. The re-arm hook names the loaded rules

- **Steps:**
    1. Read the unique rule names from the record before it is removed.
    2. Put them into the context line with the one-turn instruction.
    3. Add the scenario and test for an empty and a missing record.
- **Readiness sign:** the hook output carries the list.
- **Verified by:** `bash projects/agent-kit/tests/skill-gate-rearm.test.sh` — no `FAIL` line.

### 3. A read by an interpreter is not a write

- **Steps:**
    1. Make a code argument a write only when the code holds a write call.
    2. Name the new price in the header of the file.
    3. Add the scenarios and extend the test.
- **Readiness sign:** `node -e` reading a manifest passes, a heredoc and a write call still count.
- **Verified by:** `bash projects/agent-kit/tests/shell-write-paths.test.sh` — no `FAIL` line.

### 4. A merged epic is not demanded as the base

- **Steps:**
    1. Read how the delivery guard finds the epic branch and where it faults.
    2. Take the main branch as the base when the epic tip is reachable from the remote main branch.
    3. Add the scenario and the check of the base on the host.
- **Readiness sign:** the guard lets a task PR with the main branch as the base through for a merged epic.
- **Verified by:** `bash projects/agent-kit/tests/guard-epic-base.test.sh` — no `FAIL` line.

### 5. The small refusals

- **Steps:**
    1. Name the end of the bypass line for a new epic in the epic stop refusal.
    2. Check labels against the repository list in `task:new`.
    3. Refuse a path-like token without a colon in a binding cell.
    4. Add the scenarios and tests of the three.
- **Readiness sign:** each refusal names what to fix.
- **Verified by:** `bash projects/agent-kit/tests/epic-stop-guard.test.sh`, `bash projects/agent-kit/tests/task-new-queue.test.sh` and `bash projects/agent-kit/tests/checks-specs.test.sh` — no `FAIL` line.

### 6. Layout and gate

- **Steps:**
    1. Lay the package out into the tree and rebuild.
    2. Run the checks of the package and the tree.
- **Readiness sign:** the layout audit is clean.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0.

## What this work does not do

- The port logic of the dev-server guard: it needs a design of its own.
- The texts of rules and patterns: tasks RT-2846 and RT-2847.
