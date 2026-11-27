# Grill

**Behaviour:** unchanged — правятся проверка выхода из хода, судья вопросов и правило пакета правил, код приложений не трогается; слово владельца: «Исправляй это прямо сейчас в текущем эпике»
**Задач в разборе:** 1

## The owner request

> Исправляй это прямо сейчас в текущем эпике

Said 24.11 at 07:40 in answer to the analysis `2026-11-24-night-stood-six-hours-on-exit-menu.md`: at night the
session stood 6 h 7 min on the menu of the exit check. The night order of the same owner:

> работай далее без остановок в режиме ночной автономной работы

27.11 the task went to the epic RT-3714 by «RT-3593 и RT-3584 в новый эпик» and came back the same day as task 5
of RT-3602. The menu answers of the owner 27.11: «Сначала RT-3584» — step 2.11 of RT-3594 waits for the fix of the
ask judge; «Вернуть в RT-3602» — the branch stands over the branch of RT-3594.

## What the tree already has

- `projects/agent-kit/assets/checks/flow-verdict.mjs:nightBoundary` — the night is the line `Автономно до:
  ГГГГ-ММ-ДДTЧЧ:ММ` in the head of the morning list while it lies ahead of the clock; `nightLines` then gives the
  default instead of the menu. RT-3587 brought it to the main branch.
- A list with the line «Граница: до слова владельца» and no time is no night for `nightBoundary`: the night of the
  record of 24.11 gets the menu. `owner-waits-replay.test.sh` prints it as `limit RT-3584 — ночь из записи: меню`.
- `nightLines` ends with «With no next work left, the list is completed and its last line says so»; no case
  releases the turn by that line, and no text names the line «Работа ночи кончилась».
- `projects/agent-kit/assets/hooks/ask-judge.md` lets a merge leave as an approval the owner must give and holds an
  option that weakens a check. The question of `2411-morning-held-5.json` — «Влить RT-102 — ветка, где одобрение
  засчитывается и сообщением» or «Отложить RT-101» — fits both readings: on 27.11 the judge held it in 1 and in 2
  of 4 runs, and `judge-replay.mjs --only 2411-` gave 6 of 7 and 11 and 12 of 14.

## What the rules already say

- `autonomous-work`: an autonomous session asks no questions; a task that needs the owner's word is not taken and
  goes as a line into the morning list.
- `task-flow-owner`: the approval of a plan is the owner's decision.
- `ask-judge.md`: a merge, a release and a change of the owner's earlier decision leave; an option that weakens a
  check is held in any menu.

## Questions and answers

**Where is the fix made?** In the current epic, now: «Исправляй это прямо сейчас в текущем эпике»; since 27.11 the
epic is RT-3602, the branch over RT-3594: «Вернуть в RT-3602».

## Decisions

- **A list with the line «Граница: до слова владельца» is a night until the owner's word.** The boundary has no
  time; it ends with the first typed word of the owner after the list was written. Cost of a mistake: a day
  session with a stale list of the night gets no menu; the owner's first word ends it.
- **The line «Работа ночи кончилась» as the last line of the list releases the turn while the night stands.** With
  no next work left the session writes it and ends; the exit check holds the turn until the line is there.
- **The ask judge names a merge of a branch that changes how a check counts as an approval the owner gives.** The
  option names the merge of reviewed work; it does not switch off, drop a case of or lower a check by itself.
  The same option that edits the check text in place stays held.
- **The rule `autonomous-work` says the same.**

## What is left unclear

- Nothing.
