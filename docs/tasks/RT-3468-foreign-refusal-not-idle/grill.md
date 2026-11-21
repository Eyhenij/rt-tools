# Grill

**Описание фичи:** не нужно — правка движка хода работы пакета правил; код приложений не меняется.

## The owner request

> обязан сам следить за проверками и ci

The owner's word of 21.11.2026; the task is row 6 of the plan of the epic RT-3471. The card
(issue #3468): on 21.11 the stop hook `git-guard-draft-ready` refused a stop and asked to lift the
draft #3453. Another session led that PR, and touching it was forbidden. The next stop with no call
was read as idle, and the turn exit guard named the owner's menu «отложить / стоп». The card asks:
only a refusal whose move the session can make counts as idle; a refusal about a foreign PR or a
foreign branch holds no turn or is named in one line, with no menu. The sign: a suite scenario — a
stop refused by the draft check about a foreign PR, then a stop with no call — gives no owner's
menu.

## What the tree already has

- **The source of the session.** `projects/agent-kit/assets/task-flow/source/session.mjs` gives a
  refusal event `{ kind: 'refusal', text }` for every «Stop hook feedback» entry, whichever stop
  hook wrote it. The event does not say which hook refused.
- **The idle measure.** `projects/agent-kit/assets/task-flow/measure/session.mjs:idle` answers true
  when the last of the refusals, calls and menus is a refusal and no background task runs or waits
  unread. `checks/flow-verdict.mjs:menuCause` turns it into the owner's menu.
- **The texts of the refusals.** The engine refuses by «BLOCKED by turn-exit-guard: {reason}» (row
  of the decision table). The draft check writes «BLOCKED by git-guard-draft-ready: …»; the model
  check of a turn writes «BLOCKED by turn-judge: …».
- **The draft check is the tree's own hook,** `.claude/hooks/git-guard-draft-ready.sh`. Its second
  tier judges every open draft of the machine account, the drafts of other sessions included, and
  it lets a repeated approach on the same turn through by itself.

## What the rules already say

- The description of the exit guard: «When another check refused the same step twice for the same
  reason, or the executor stopped again with no call after a refusal, the one move is the owner's
  menu.»
- The rule `turn-conduct`: a stop names a move the session can make; the guards keep a dead end out.

## Questions and answers

No question was put to the owner: the card names the cause, the condition and the sign.

## Decisions

- **A stop counts as idle only after a refusal of the engine itself.** The refusal event carries the
  name of the hook from «BLOCKED by <name>»; the idle measure counts the last refusal only when it is
  the turn exit guard's. A refusal of another stop hook is that hook's word: the engine judges the
  stop by the scenario and names the move of the state, not the owner's menu. Спросить было некого:
  заход автономный, владелец велел решать самому. Цена ошибки: одно условие в мере простоя и её
  сценарии.
- **A refusal with no name of a hook counts as the engine's.** An old record or a hook that names
  nothing keeps today's behaviour; the menu still breaks a series of the engine's own refusals.
- **The draft check is not changed.** It is the tree's own hook and already lets a repeated approach
  through; a narrower second tier — drafts of branches this session pushed — is a separate edit of a
  tree file. Цена ошибки: отказ о чужом черновике остаётся одним отказом за ход, без меню.

## What is left unclear

- Whether the second tier of the draft check should judge only the drafts of branches the session
  pushed. The finding goes next to the epic plan.
