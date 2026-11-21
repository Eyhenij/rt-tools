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
- **The count over every record on this machine.** 625 Bash calls start the run ahead, 525 of them
  in the background. After the set stand: `;` — 541, a pipe — 24, a newline — 2, `&&` — 2, nothing
  — 33, other forms — 23. The calls where a command after the set hides its code: 567 of 625.
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

- **A call that starts the run ahead and then a command whose code replaces the set's is refused.**
  The forms: `;`, a newline, `||` and a pipe after the set. Rejected: a fix of the script alone — it
  already exits with its verdict, and the call hides it.
- **`&&` after the set passes.** On red the commands after it do not run, and the call ends with the
  code of the set.
- **Redirections of the set's own output pass.** `> log 2>&1` keeps its code.
- **The refusal names the ready form:** `bash .claude/hooks/git-guard-push-ahead.sh > <log> 2>&1`,
  the Bash call with `run_in_background`, nothing after it; the verdict is read from the last line
  of the log.
- **The ready form goes into the refusal texts of the decision table that name the run ahead and
  into the pattern `task-delivery-loop-run`.**

## What is left unclear

- Whether a pipe under `set -o pipefail` keeps the code: the guard refuses a pipe always, the ready
  form needs none.
