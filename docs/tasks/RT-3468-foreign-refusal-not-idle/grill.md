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

The roles `goal-critic` and `product-strategist` read the plan of 21.11. Both showed it reaches
neither point B of the epic nor the milestone. The decisions below replace the matching ones above.
Спросить было некого: заход автономный.

- **The idle measure judges every refusal of a stop after the last call or menu, not the last one.**
  The model check of a turn answers after the dispatcher: in 19 stops of the records the order is
  «engine, then `turn-judge`». With the last refusal alone the engine's series loses its menu, and
  only the words of the model check stop the series. Цена ошибки: один цикл и один сценарий.
- **A refusal with the prefix «Agent hook condition was not met:» and no name is the model check's,
  not the engine's.** 227 of 262 refusals of the model check in November carry no name; counted as
  the engine's, they keep the menu the task removes. Only a refusal with no name and no prefix
  keeps today's behaviour. Цена ошибки: одно выражение.
- **The second tier of the draft check lets through a draft whose branch is checked out in another
  working copy.** The epic plan gives `git-guard-draft-ready` to this task alone (point B and the
  table of checks). The draft of #3453 refused the session six times on 21.11, and on 20.11 the
  check gave a dead end of three refusals. A draft left by its own session is still caught: after
  the session moves to the next branch, no copy holds the old one. Rejected: the table of copy
  assignments — the owner writes it, and it lags. Цена ошибки: правка одного хука дерева и набор.
- **When the previous refusal was another check's, the verdict adds one line naming it.** The card
  asks that a foreign refusal be named in one line; the bare move of the state says nothing about
  the draft.
- **Refusals of calls by another check twice for one reason (`forbidden`) are not changed.** The
  card names a foreign branch too; that part stays open and is named in the PR. Цена ошибки: меню
  на переходе в чужую ветку остаётся до отдельной задачи.

## What is left unclear

- Whether the 20-minute bound of a background run, after which it no longer holds the menu, should
  grow: on 20.11 the push set ran 24 and 37 minutes. The finding goes next to the epic plan.
