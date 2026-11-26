# Grill

## The owner request

> ты … не останавливался, каждый раз когда я нажимал "стоп" - ты выкидывал строку "Стою. Жду вашего слова." и продолжал работу несмотря на нажатый "стоп"

> почему ты продолжаешь работать после "стоп"?

The owner's words of 24.11 written into the epic plan `docs/plans/owner-stop-holds.md`; the plan was approved by
the owner on 24.11, and the epic was given to this copy by the menu answer of 26.11 «Бери RT-3602». The card
RT-3674: a `Monitor` that prints a line for every step of a command wakes the turn on every line; on 24.11 after Esc
14 such lines from the queue woke the turns. The card asks to refuse such a `Monitor` when the end of that command
comes as a notice anyway.

## What the tree already has

- The `Monitor` of 24.11, started at 03:53:52 as task `b7v5izrbm`: `tail -n 0 -f <tasks/bx106og2k.output> | grep
  --line-buffered -E 'push ahead:|green in|red|…'`. It follows the output file of the background push set
  `bx106og2k`, whose end comes as a notice by itself. Its lines `+ green in 37s: …`, `✗ red in 1s: …` stood in the
  queue from 03:54:04 on.
- The record of 23.11 05:03 has the second form: a `while true` loop that prints the last step line of
  `${TMPDIR:-/tmp}/push-ahead-rt-tools.log` each time it changes, while the push set writes that log in the
  background. The 22.11 15:58 form waits by `until grep -q … ; do sleep 5; done` and prints one line after the loop.
- In 20 records of the project the `Monitor` calls that follow the output of an own background task or the log it
  writes are mostly push sets and test runs. A poll of a PR's checks or a timer (`sleep 600; echo tick`) follows no
  background task of the session.
- `projects/agent-kit/assets/task-flow/source/session.mjs:eventsOf` gives `background` events with `task`, `output`
  (the output file the host named) and `command`, `backgroundEnd` events for a notice and for `TaskStop`, and
  `monitor` events. A background task is alive while no `backgroundEnd` of its id came.
- `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh` (RT-3673) is the model: a cheap shell filter, then the
  engine by `node … stop-call` with a time limit, then `rt_decide` with a row of
  `projects/agent-kit/assets/checks/decision-table.json`, FAIL-OPEN. A hook is bound to its event by its
  `# rt-hook:` line; `projects/agent-kit/tests/hooks-kind.test.sh` demands the declaration, `FAIL-OPEN`, the reason,
  the lawful moves, `rt_hook_read`, a suite and a spec.
- The last scenario number is SC-AK-2016.

## What the rules already say

- The epic table «Точки», row «B (задача 3)»: a `Monitor` that prints a line for every step of a command whose end
  comes as a notice anyway is refused. Sign: cases of the hook.
- The epic table «Решение», row «Бюджет»: new dependencies 0, new hooks 2. RT-3673 added
  `owner-stop-call-guard.sh`; this hook is the second.
- The epic row «Время»: a record of 173 MB reads 0.8 s a call, so a cheap filter goes before `node`.

## Questions and answers

No question is asked: the epic plan names what is refused and by what it is judged, and the design is the executor's.

## Decisions

- **«A line for every step» is read from the command text.** It follows a file (`tail` with `-f`, `-F` or
  `--follow`), or a loop prints inside its body by `echo` or `printf` not followed by `break` or `exit`. A wait that
  prints after the loop — `until grep -q …; do sleep …; done; tail -3 …` — prints once and passes.
- **«Its end comes as a notice anyway» is read from the record.** The command names the output file of a live own
  background task, or a file that the command of a live own background task writes by `>`, `>>` or `tee`. A poll of
  a PR, a timer and a log no own task writes pass: their end comes by no notice.
- **The refusal names the task and the lawful move.** The end of `<task>` comes as a notice; the file is read after
  it, or one line at the end is waited for by `until grep -q`.

## What is left unclear

- A file named by a path built at run time (`$(basename "$PWD")`) the text match does not see: the cost is a pass,
  named in the spec.
