# Plan

**Task:** RT-2230 · **Branch:** RT-2230-epic-end-releases-turn
**Behaviour:** unchanged — правятся только пакет правил `projects/agent-kit/` и описание его домена; приложений работа не касается, владелец завёл её эпиком по правилам.

## Task footprint

| What  | Where                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/exit/` — spec, implementation, scenarios                                                                            |
| Laws  | `docs/constitution/work-conduct.md` — read, not edited                                                                                                |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `.claude/skills/turn-conduct/implementation.md`                                                    |
| Code  | `projects/agent-kit/assets/hooks/turn-exit-guard.sh`, `turn-exit-epic.sh`, `turn-exit-patterns.sh`, `projects/agent-kit/tests/turn-exit-epic.test.sh` |

## What counts as done

- Under an epic whose table is read and prints no unfinished task, the exit guard releases the turn whatever the tier. An empty turn, a second pass and waiting for a word all pass. An epic that cannot be read releases nothing, and the turn is judged as before.
- The epic is still read once per turn and only on the way to a refusal.
- The exit spec carries the statement, its binding and scenario SC-AK-1129. SC-AK-1119 promises the former behaviour for the unreadable epic alone. The rule says in words that on `main` the turn is judged as before.
- The package tests, `check:specs`, `agent-kit:check` and the file-size check are green.

## Stages

### 1. The end of an epic releases the turn inside the refusal

- **What is done:** `rt_te_epic_left` in `turn-exit-epic.sh` records whether the reading succeeded. `rt_te_epic_over` moves there from `turn-exit-patterns.sh` and answers by the cache: read and empty. `rt_te_deny` in `turn-exit-guard.sh` leaves with zero when it is true. The line that lifted `awaits_word` alone goes away. Tests: SC-AK-1129 — under a closed epic an empty turn, a second pass, a handover by hand and waiting for a word pass. SC-AK-1119 retitled: an unreadable table and no table keep the former behaviour, an empty turn is refused.
- **Readiness sign:** the epic suite grows and stays green; the guard stays within the code limit.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-epic.test.sh` — the last line reads `N ok, 0 провалов` with N above 28 (today 28).

### 2. The spec names the statement, the binding and the scenario

- **What is done:** the exit spec gets the statement «The end of an epic read from the table releases the whole turn on the way to a refusal». The open-epic statement loses the words about a closed epic. The binding goes to `turn-exit-epic.sh:rt_te_epic_over`. Scenario SC-AK-1129 is added, SC-AK-1119 is reworded to the unreadable epic, a history line is written.
- **Readiness sign:** the spec audit finds no statement without binding and no scenario without a test.
- **Verified by:** `npm run check:specs` — exit code 0, no line about `turn-guards/exit`.

### 3. The rule says the main branch is judged as before, the layout matches

- **What is done:** the article «The end of an epic is a stop…» in `turn-conduct.md` gets the sentence that on the main branch the epic is not read and the turn is judged as before. The rule stays under 24 000 characters. The companion line in `.claude/skills/turn-conduct/implementation.md` is rewritten. `pnpm run agent-kit:sync` lays out the copies.
- **Readiness sign:** the laid-out copies match the sources and no file is over the limit.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0; `node tools/check-file-size.mjs` — `longer than the limit 0`.

## What this work does not do

- Reading the epic number on `main` from the last merge — outside the epic, waits for the owner's word.
- The waiting guard: it already releases the end of an epic.
- The epic table and the board audit.
