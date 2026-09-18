# Plan

**Task:** RT-2229 · **Branch:** RT-2229-exit-guard-knows-epic-branch
**Behaviour:** unchanged — правятся только пакет правил `projects/agent-kit/` и описание его домена; приложений работа не касается, владелец завёл её эпиком по правилам.

## Task footprint

| What  | Where                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/exit/` — spec, implementation, scenarios                                                   |
| Laws  | `docs/constitution/work-conduct.md` — read, not edited                                                                       |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `.claude/skills/turn-conduct/implementation.md`                           |
| Code  | `projects/agent-kit/assets/hooks/turn-exit-epic.sh`, `turn-exit-guard.sh`, `projects/agent-kit/tests/turn-exit-epic.test.sh` |

## What counts as done

- A turn on a branch named by the header line of an epic plan in `plansDir` is not refused by the tier «work taken and not begun»; a task branch without a folder is refused as before.
- The exit spec carries the statement, its binding and a scenario; the rule article about a taken task names the epic branch.
- The package tests, `check:specs`, `agent-kit:check` and the file-size check are green.

## Stages

### 1. The guard reads the epic branch from the epic plan

- **What is done:** `rt_te_epic_branch` in `turn-exit-epic.sh` reads `plansDir` from `.claude/rt-kit/checks.json` (default `docs/plans`). It looks for the current branch in backticks in a plan header line. The tier «taken and not begun» in `turn-exit-guard.sh` is skipped when it is true. Test SC-AK-1127 in `turn-exit-epic.test.sh`: a plan naming the branch releases, a plan naming another branch does not.
- **Readiness sign:** the epic suite grows by the new scenario and stays green.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-epic.test.sh` — the last line reads `N ok, 0 провалов` with N above 25 (today 25).

### 2. The spec names the statement, the binding and the scenario

- **What is done:** the exit spec gets the statement «A branch named by the header of an epic plan is an epic branch, and the tier of the taken task does not judge it». Next to it: the binding to `turn-exit-epic.sh:rt_te_epic_branch`, scenario SC-AK-1127, a history line, the term «epic branch» in the terminology.
- **Readiness sign:** the spec audit finds no statement without binding and no scenario without a test.
- **Verified by:** `npm run check:specs` — exit code 0, no line about `turn-guards/exit`.

### 3. The rule article names the epic branch, the layout matches

- **What is done:** the article «A taken task is not yet begun work…» in `turn-conduct.md` gets the sentence about the epic branch, and the rule stays under 24 000 characters. The companion line in `.claude/skills/turn-conduct/implementation.md` is rewritten with the new text. `pnpm run agent-kit:sync` lays out the copies.
- **Readiness sign:** the laid-out copies match the sources and no file is over the limit.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0; `node tools/check-file-size.mjs` — `longer than the limit 0`.

## What this work does not do

- The end of an epic releasing the whole turn — task RT-2230 of the same epic.
- Reading the epic number on `main` — outside the epic, waits for the owner's word.
