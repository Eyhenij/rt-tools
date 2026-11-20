# Grill

**Описание фичи:** не нужно — правка движка хода работы; код приложений не меняется.

## The owner request

> Починить движок отдельной задачей (Recommended)

The owner's answer of 20.11.2026 to the question how to lift the refusal of the PR gate on RT-3420.
The question said: at the rerun before the PR the engine takes the progress as it stood before the
first commit that marks a step done, and four check replacements lie in the same commit as the marks.
Four steps of thirteen did not match, although they matched in the live check. The task is row 27
of the plan of the epic RT-3302, card #3446.

## What the tree already has

- **The rerun before the PR.** `projects/agent-kit/assets/checks/flow-step.mjs:runBeforePull` puts a
  taken-apart folder back from the history. For each done step it writes the progress as it stood
  before the first commit that marks the step done, because a check that reads the progress saw it so.
- **The replacement of a check.** A line of the progress «Проверка шага N.M заменена: `команда` →
  ожидание» replaces the check of the plan. `replacedCheck` reads it from the progress file on disk.
  The scenario `SC-AK-1739` holds the rule of the version before the first mark.
- **The case of RT-3420.** The replacements and the marks of its steps came in one commit. The version
  before it has no replacement lines, so the rerun measured the original checks: four steps gave
  «exit 1, 0» and the gate refused the PR with «steps re-measured 13, matched 8».
- **Why the plan checks needed replacing.** `grep -c` answers 0 with the exit code 1, and the engine
  does not take a non-zero exit for the number 0. A check of the plan with such a pipe cannot match.
- **The description.** `docs/specs/agent-kit/turn-guards/flow-script/step-mark/` holds the rule «On
  the final rerun a check sees the progress as it stood before the first commit that marks its step
  done», its binding and the scenarios up to `SC-AK-1740`.

## What the rules already say

- The rule `task-flow-plan`: the plan is not edited after it is written; a step check is replaced by
  a decision of the progress. A replacement is therefore the lawful way to repair a check.
- The rule `spec-driven`: a scenario number is issued once; the next free number is `SC-AK-1794`.

## Questions and answers

**How to lift the refusal of the PR gate on RT-3420?**
Починить движок отдельной задачей (Recommended)

## Decisions

- **The rerun takes the replacement lines from the last version of the progress and the rest of the
  progress from the version before the first mark.** A replacement is the owner's decision about the
  check, not a part of the work the check measures, so a check that reads the progress still sees it
  as it stood. Rejected: taking the last version whole — a step that reads the progress would see
  every step done and the scenario `SC-AK-1739` would break. Rejected: rewriting the history of
  RT-3420 — the owner chose the fix of the engine.
- **The fix goes to the epic branch directly.** The branch of RT-3420 has no PR and cannot get one
  until this fix is merged, so a branch stacked on it would wait for itself. Спросить было некого:
  владелец выбрал отдельную задачу, а основание цепочки названо в вопросе. Цена ошибки: если
  владелец решит иначе, ветка пересаживается на RT-3420 одной командой.

## What is left unclear

- Whether other tasks of the chain hit the same case. A plan check that cannot match is repaired
  by a replacement, and every replacement written in the commit of the marks does; this fix covers
  all of them.
