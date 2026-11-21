# Grill

**Описание фичи:** не нужно — правка движка хода работы и проверки конца хода; код приложений не меняется.

## The owner request

> пиздуй разбирайся что сломано в проверках и хуках и исправляй, ты ебаная тупорылая мразь обязан сам следить за проверками и ci

The owner's word of 21.11.2026, after the session ended a turn while its push set was red and
unread. The card (issue #3463): when a background task of the session ended after the last call,
the turn-exit guard names the owner's menu «отложить / стоп» as the one move. The owner chose
«стоп», the turn ended, the red result of the push set stayed unread. The card asks: the move is to
read the output of that task; the menu is not offered at that minute.

## What the tree already has

- **The guard.** `projects/agent-kit/assets/hooks/turn-exit-guard.sh` asks the engine for a verdict
  at every stop and prints its refusal.
- **The engine.** `projects/agent-kit/assets/checks/flow-verdict.mjs:holdReason` writes the refusal;
  `menuCause` names the menu when `measure.session.idle` is true.
- **The measurers.** `projects/agent-kit/assets/task-flow/measure/session.mjs`: `idle` is true when
  the last of the refusals, calls and menus is a refusal and no background task runs; `waiting`
  releases a stop while a task runs.
- **The record.** `projects/agent-kit/assets/task-flow/source/session.mjs:eventsOf` gives the end of
  a task as an event the moment its notice is queued, before the notice reaches the session.
- **The scenario.** `SC-AK-1763` in
  `docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` asserts «задача кончилась —
  простой, как раньше»: an ended task gives the menu. The suite is
  `projects/agent-kit/tests/turn-exit-guard.test.sh`.
- **The replay of 21.11.** The record of the session cut at 01:20:13 holds the start of the task at
  01:19:05, a refusal of the draft guard, and the end of the task at 01:20:00. The engine on it gives
  «The previous refusal named a move, and no call followed it. The one move is the owner's menu».

## What the rules already say

- The rule `turn-conduct`: a turn ends with work, a question or a handover; a stop with a background
  task running is a wait.
- The rule `task-flow`: a refusal by state names the mandatory action of that state.

## Questions and answers

None. The card names the condition and the sign; the owner's word orders the fix.

## Decisions

- **An ended task the session has not read is a move of its own, not idleness.** A task counts as
  unread when its end stands after the last call of a tool: the notice reaches the session only
  when the turn goes on, and a call is the first sign the session went on. The refusal names the
  task and its output and says the menu is not offered while it is unread. Владелец здесь, а
  карточка называет условие. Цена ошибки: если чтение итога надо считать по другому признаку,
  меняется один измеритель.
- **`SC-AK-1763` loses its case «задача кончилась — простой».** The case asserted the very behaviour
  the card removes; a new scenario `SC-AK-1797` names the new move.
- **The menu stays for the true idle stop.** A refusal followed by no call and no ended task still
  gives the menu, as before.

## What is left unclear

- Whether the notice of an ended task can reach the session without any call in between. The
  measurer then waits for the next call; the refusal still names the task, so nothing is lost.
