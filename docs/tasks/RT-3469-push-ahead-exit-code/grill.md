# Grill

**Описание фичи:** не нужно — правка проверок пакета правил; код приложений не меняется.

## The owner request

> обязан сам следить за проверками и ci

The owner's word of 21.11.2026 at 02:01, said about the push set left unwatched; the CI half was
RT-3467. The card RT-3469 asks: a run ahead of the push set started in the background gives the
exit code of the set itself; a call where a command after the set hides its code is refused with
the ready form of the run.

## What the tree already has

- **The run ahead exits with its verdict.** `assets/hooks/git-guard-push-ahead.sh` ends with `exit
  0` on green, the number of red checks (at most 100) on red, and 3 when the run did not start.
- **The host reports the code of the last command of a call.** A background call whose command is
  `bash …/git-guard-push-ahead.sh > log 2>&1; echo "exit $?"; tail log` comes back as «exit code 0»
  over «push ahead: red». On 21.11 this session read such a notice twice; the red line of
  `check-glossary.mjs` stood in the log.
- **The count over every record on this machine, by call id.** 383 different calls start the run
  ahead; 625 is the count of their entries, a continued record repeats them. A command stands after
  the set in 340; 317 of them print `$?` of the set into the output, and the session reads the code
  there. In 15 the code is visible nowhere — a pipe `| tail` with no `$?`. The role
  `product-strategist` found 42 red results in the records and no case where a red one was read as
  green.
- **The ready form is named by four refusal texts of the decision table and by the pattern
  `task-delivery-loop-run`:** `bash .claude/hooks/git-guard-push-ahead.sh` in the background. None
  of them says that nothing may follow it.
- **No guard reads the shape of a call that starts the run ahead.** The guards of the push read the
  push call; `rerun-guard.sh` reads a rerun of a hosted run.

## What the rules already say

- The rule `git-workflow-push`: «Where neither the session's push guard nor the git hook fires, the
  set is run whole»; the run ahead writes the marks the push guard reads.
- The rule `testing`: «A broken guard lets the action through» — a new guard is FAIL-OPEN and names
  that in its header.
- The rule `turn-conduct`: the end of a run is learned from the return of a background command.

## Questions and answers

No question was put to the owner: the card names the refusal, its ready form and the sign of done,
and the measurement settles which forms hide the code.

## Decisions

- **A call is refused only when the code of the set is visible nowhere.** A tail after the set that
  prints no `$?`, a pipe with no `PIPESTATUS` or `pipefail`, `&` and `!` hide it; `$?` right after the
  set shows it. The role `product-strategist` counted the cost: a refusal of every tail adds 0,2–1,6
  refusals per hundred calls a day and lifts 21.11 (4,86) over the milestone; the narrow form adds
  about 0,02. Спросить было некого: заход автономный, владелец велел решать самому. Цена ошибки:
  одно правило в проверке и его сценарии, если владелец захочет отказ на любой хвост. Rejected: a
  fix of the script alone — it already exits with its verdict.
- **`&&` to the end of the call passes; a `;` after a chain of `&&` is judged.** On red the commands
  after `&&` do not run, but a `;` after them runs and ends the call with its own code.
- **Redirections of the set's own output pass.** `> log 2>&1` keeps its code.
- **A text that only names the script passes:** a heredoc, `printf` into a file, a quoted commit
  message, `bash -n`. A run inside `bash -c '…'` is judged by its inner text.
- **The refusal names the ready form:** `bash .claude/hooks/git-guard-push-ahead.sh > <log outside
  the tree> 2>&1`, the Bash call with `run_in_background`, nothing after it. The log lies outside the
  working copy: a file in the tree makes the copy dirty, and the set does not start. The verdict is
  the code of the notice and `grep '^push ahead:' <log>`; the last line of the log on red is the name
  of the red check.
- **The ready form goes into the 11 refusal texts of the decision table with `{ahead_cmd}`, the two
  texts of `git-guard-delivery-epic.sh` and the pattern `task-delivery-loop-run`.**
- **The scenarios go to the description of the run ahead,** `docs/specs/agent-kit/push-gate-ahead/`,
  not to the delivery gate.

## What is left unclear

- Whether a pipe under `set -o pipefail` keeps the code: the guard refuses a pipe always, the ready
  form needs none.
