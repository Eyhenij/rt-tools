# Grill

## The owner request

> ты … не останавливался, каждый раз когда я нажимал "стоп" - ты выкидывал строку "Стою. Жду вашего слова." и продолжал работу несмотря на нажатый "стоп"

> почему ты продолжаешь работать после "стоп"?

> Бери RT-3602

The first two are the owner's words of 24.11 written into the epic plan `docs/plans/owner-stop-holds.md`; the
plan was approved by the owner on 24.11. The third is the menu answer of 26.11 that gave the epic to this copy.

## What the tree already has

- `projects/agent-kit/assets/task-flow/source/owner.mjs:last` gives the owner's last word: typed, queued, the
  Esc mark or the chosen options. Nothing gives the words in order with their time.
- `projects/agent-kit/assets/task-flow/measure/owner.mjs` judges only the last word: `saidStop` by
  `flow-data.mjs:saysStop`, `interrupted` by the Esc mark. Any next word of the owner lifts the stop.
- `saysStop` judges the opening of the message: «не двигайся дальше … пока не скажу» and «Остановить работу» are
  no stop; «хватит тупить, чини» is a stop, though it orders work.
- `projects/agent-kit/assets/task-flow/measure/ci.mjs:hold` drops the hold only after Esc; after a stop word a red
  or a running run still holds the turn.
- The second judges: `projects/agent-kit/assets/hooks/turn-judge.md` and `projects/agent-kit/assets/rules/turn-conduct.md`
  say a stop holds until the owner writes again; `.claude/hooks/git-guard-draft-ready.sh` does not read the stop at
  all; `projects/agent-kit/assets/checks/flow-forecast.mjs` replays the same two measures.
- The record forms, counted over two session records of 22–24.11: 715 queued messages, 73 Esc marks, 23 refusals of a
  call, each followed by the Esc mark for a tool use. `/stop` was found once, as a queued message of 24.11 at 03:56:51.
- The suites: `projects/agent-kit/tests/turn-exit-guard.test.sh` — 340 ok, 0 failures on 26.11, 23 s;
  `projects/agent-kit/tests/turn-replay.test.sh`. The last scenario number in `docs/specs` is SC-AK-1978.

## What the rules already say

- The epic plan names the transitions, the words `words.resume`, the modules, the bounds and the budget of new hooks:
  its tables «Переходы» and «Решение» are the answers, and the owner approved them.
- The archive record of RT-3592 names what that task left: «не двигайся дальше» does not stop, a new message lifts
  the stop, «хватит тупить, чини» releases the turn. These are the first-round findings the epic plan moves here.

## Questions and answers

No question is asked: every decision of this task is written in the approved epic plan.

## Decisions

- **The stop is a state walked over the owner's words in order.** The epic table «Переходы» is the transition table.
  Rejected: more words in `words.stop` — the next message would still lift the stop.
- **The release cases `stopWord` and `interrupted` keep their names and logs.** Both read one walk: the stop stands
  and was set by a word, or by Esc. The turn map, its check and the forecast keep their names.
- **`чини` joins `words.resume`.** The table row «хватит тупить, чини» resumes the work, and the plan list lacks it.
- **`/stop` from the queue sets the stop.** It has a case of its own.

## What is left unclear

- Whether the host calls the prompt hook on a background notice: task RT-3673 checks it first; it does not touch the
  walk of this task.
