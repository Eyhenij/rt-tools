# Plan

**Task:** RT-2148 · **Branch:** RT-2148-session-main-run
**Behaviour:** unchanged — владелец: правка пакета правил, его хука и описания; кода приложений нет

## Task footprint

| What  | Where                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| Code  | `projects/agent-kit/assets/checks/main-run.github.mjs` (new), `projects/agent-kit/assets/hooks/main-run-context.sh` (new) |
| Tests | `projects/agent-kit/tests/checks-main-run.test.sh`, `projects/agent-kit/tests/main-run-context.test.sh` (new)             |
| Specs | `docs/specs/agent-kit/turn-entry/{spec,scenarios,implementation}.md`                                                      |
| Rules | `.claude/skills/task-flow/SKILL.md` via the package source `rules/task-flow.md`; the companion next to it                 |

## What counts as done

- One command prints one line about the last run of the main branch: none, running, green, red,
  pushed out — and says out loud when the run was not read: no pipeline file, a pipeline asleep on
  a push, no network.
- The session start prints that line into the context at all four launches and never refuses the
  launch.
- The rule `task-flow` names the reading as the first action of a session and the step after every
  known merge; the spec of the turn entry has the rule, two scenarios and the bindings.

## Stages

### 1. The reading command

- **What is done:** `main-run.github.mjs` among the checks — one line by the verdict of
  `lastMainRun`, the trigger by `pipelineWakesOnPush`; the suite `checks-main-run.test.sh` on the
  gh stub of the board suite covers every line.
- **Readiness sign:** the suite prints every line of the command.
- **Verified by:** `bash projects/agent-kit/tests/checks-main-run.test.sh | tail -1` — «0 провалов».

### 2. The start hook

- **What is done:** `main-run-context.sh` on `SessionStart startup|resume|compact|clear` — finds
  the checks directory by the tree config, calls the command, prints its line as context; silent
  where there is no node or no command laid out. The suite `main-run-context.test.sh`.
- **Readiness sign:** the suite is green; the layout puts the hook and the command into this tree.
- **Verified by:** `bash projects/agent-kit/tests/main-run-context.test.sh | tail -1` — «0 провалов»; `pnpm run agent-kit:check | tail -1` — «сходится».

### 3. The rule and the spec

- **What is done:** the article and the `Requires` line in `rules/task-flow.md`, the binding in the
  companion; the rule, scenarios SC-AK-1105 and SC-AK-1106 and the bindings in
  `docs/specs/agent-kit/turn-entry/`.
- **Readiness sign:** the specs check counts two more covered scenarios and no divergence.
- **Verified by:** `npm run check:specs | grep check-specs:` — «scenarios 1589 — covered 1441» (before: 1587 — 1439).

## What this work does not do

- It does not touch the audit's own findings: RT-2147.
- It does not touch the PR body and the finding about a base other than main: RT-2149, RT-2150.
