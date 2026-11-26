# Grill

## The owner request

> Изучи досконально task flow и вынеси в предложение, что можно уменьшить по ресурсам и времени… Ты
> можешь внести в качестве метрики именно количество обращений к человеку. Оно должно свестись к
> минимуму.

The card RT-3696 is proposal П8 of the epic RT-3693, approved by the owner on 26.11 in one window
together with the plan of RT-3695: «П8 команда измерения (Recommended)».

## What the tree already has

- The epic plan `docs/plans/owner-touches.md` measures the contacts by a `jq` one-liner over
  `.claude/rt-kit/observations/*.jsonl` with `sort -u`: 250 contacts on 36 tasks, median 5, up to
  26.11 11:00 UTC.
- The events come from `projects/agent-kit/assets/hooks/record-turn.sh` → `checks/record-turn.mjs`,
  which reads the session record from an offset kept in a mark and appends `record-word`,
  `record-menu`, `record-ask`, `record-interrupt` lines; `checks/record-count.mjs` decides what a word
  of the owner is.
- The observation files carry repeated lines: 39 123 lines, 37 143 different; 27 extra `record-word`
  lines. The same queued message of RT-3526 stands up to 7 times with one moment and one session sign,
  and four times more with moments a millisecond apart. A queued message of 26.11 11:41:33 also stands
  in two journals — the continued session copies earlier entries into its new record.
- `pnpm run session:time` (`tools/session-time.mjs`) is the sample of a tree command that reads the
  journals and prints numbers only.

## What the rules already say

- A count that becomes the measure of the work is bounded by the declaration, not by the file
  (`task-flow-plan`).
- The rules package is edited through its sources (`agent-kit-source`).

**Tasks of the grill:** 1

**Behaviour:** unchanged — правятся счётчик наблюдений пакета правил и команда дерева, код приложения не трогается

## Questions and answers

No question went to the owner: two «recommended» answers in a row close the rest by assumption
(`task-flow-start`), and the card answers the six.

- **Does the task change the application's behaviour** — closed by assumption: no application code;
  tooling and the package's recorder.
- **Does it need an edit of a law or a rule** — closed by assumption: no law; the companion of the
  rule that names the recorder gets its line.
- **One task or several** — closed by the card: one.
- **What is not part of the task** — closed by assumption: the measures against the kinds of typed
  messages — they follow from the marking and go to the epic as the owner decides.
- **What will show that the task is closed** — closed by the card: the command on the same days gives
  the same median and a total without repeats, and the recorder no longer writes one word twice.
- **Is there a sample** — closed by exploration: `tools/session-time.mjs`.

## Decisions

- **The kinds of a typed message are told by patterns of words, in memory, and only the kind leaves**
  — no text of the conversation reaches a file (`record-turn.sh`, «WHAT IS KEPT»). Rejected: a model
  call per message — cost and a network call for a count.

## What is left unclear

- Whether the repeats within one session come from two hook runs reading the same offset at once or
  from the record itself — the first stage reproduces it before the fix.
