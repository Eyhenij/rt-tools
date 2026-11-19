# Grill

**Описание фичи:** не нужно — правка движка хода работы и его описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 19 of the plan of the epic RT-3302.
The card (issue #3420) comes from the review of RT-3276 by the role `goal-critic`. The menu of a
refusal offers the owner the option «сделаю сам». The owner's order of 19.11 says the agent does
all the work on code, tasks and implementation, and a person finishes nothing for it. The card
asks: the menu no longer offers the owner to take the step, and the scenarios that stand on the
option are rewritten.

## What the tree already has

- **The words of the menu.** `projects/agent-kit/assets/task-flow/flow.js` names
  `menu: ['отложить RT-N', 'сделаю сам', 'стоп']`; the description `flow.md` is generated from it.
- **The text of a refusal.** `projects/agent-kit/assets/checks/flow-verdict.mjs` tells what each
  answer does: «сделаю сам» marks the row of the task «шаг владельца «сделаю сам»» and takes the
  next task.
- **The shortcut of the guard.** `projects/agent-kit/assets/checks/flow-guard.mjs` holds
  `SELF_OPTION`. An edit that sets «шаг владельца» on a row of the epic plan needs the owner's
  window; when the owner's last word begins with «сделаю сам», the edit passes without the window.
- **The row state «шаг владельца».** `measure/epic-text.mjs` reads it, and the next task of the
  epic skips such a row. The state is reached two ways: by the shortcut above and by the owner's
  window on the edit of the row.
- **The texts.** The option is named in `hooks/ask-judge.md`, `rules/turn-conduct.md` (the text
  and the diagram), `defaults/turn-map.md`, and in the description of the check: the mission, the
  flow script, its exit part and its replay part.
- **The scenarios.** `SC-AK-1445` — the menu carries three options. `SC-AK-1469` — the option
  blocks the task by the owner's step. `SC-AK-1518` — the menu is read from the words. The replay
  fixtures 1455, 1460 and 1470 and the replay library carry the option in the text of a menu.
  `SC-AK-1389` and `SC-AK-1746` use the phrase only as the quote inside a row «шаг владельца».

## What the rules already say

- The law of work conduct and the rule `turn-conduct`: a turn does not end while work is left that
  the executor can do; a step that is truly the owner's goes to them as one menu.
- The rule `spec-driven`: a scenario number is issued once and never reused; a deleted scenario
  takes its test with it.

## Questions and answers

None. The owner's order of 19.11 already answers the product question: the owner takes no step of
the work on themselves.

## Decisions

- **The menu of a refusal carries two options: «отложить RT-N» and «стоп».** The card asks for it
  in these words. Rejected: a third option under another name — any wording of «the owner does
  the step» repeats what the order forbids.
- **The shortcut by the owner's word «сделаю сам» goes out of the guard.** With no option in the
  menu nothing can call it. Спросить было некого: заход автономный. Цена ошибки: одна ветка
  проверки и её сценарий возвращаются одной правкой.
- **The row state «шаг владельца» stays.** It is still reached by the owner's window on the edit
  of the row, and `SC-AK-1389` and `SC-AK-1746` hold it. The card speaks of the menu, not of the
  state. Спросить было некого: заход автономный. Цена ошибки: если владелец решит убрать и
  состояние, это правка измерителя плана эпика и двух сценариев — отдельная задача.
- **`SC-AK-1469` is deleted with its test, its number stays empty.** `SC-AK-1445` is rewritten to
  two options; the fixtures and the replay library lose the option from the menu text.

## What is left unclear

- Whether a record of a past session that holds a menu of three options still replays the same
  way. The replay suite answers it at the first stage.
