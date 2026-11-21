# Grill

**Описание фичи:** не нужно — правка движка хода работы пакета правил; код приложений не меняется.

## The owner request

> обязан сам следить за проверками и ci

The owner's word of 21.11.2026 at 02:01, said about the push set left unwatched; the push set is
RT-3469, the CI is this task. The PR #3460 into main went red on 20.11 at 20:43 (run 44810853234),
no session record names that run, and the next push into the branch came 12 hours later. The card
RT-3467 asks: after the push and the PR the turn exit guard reads the CI run of the branch's last
commit.

## What the tree already has

- **The engine decides.** `turn-exit-guard.sh` runs `task-flow-script.mjs verdict`; the decision
  table only formats the refusal (`decision-table.json`, two rows of `turn-exit-guard.sh end_turn`).
- **The release cases.** `assets/task-flow/flow.js`: `background` releases a stop while a background
  task of the session runs, but only before `measure.pr.handed`. After the PR nothing reads CI.
- **The host adapter.** `assets/task-flow/source/host.mjs` reads cards, branches and PRs (with the
  head sha) and has no port for CI runs. The board checks already read runs by head sha:
  `checks/board-runs.github.mjs:verdictOnHead`, without the run id.
- **The session.** `source/session.mjs` gives `background` and `backgroundEnd` events; the command of
  a background task is in the `call` event with the same tool use id, not in the `background` event.
- **The tests.** `tests/turn-exit-guard.test.sh` (124 ok) runs measurers over doubles;
  `tests/flow-doubles.mjs:hostDouble` is the host double.

## What the rules already say

- The rule `turn-conduct`: a turn ends with a call or a menu; the guards keep a dead end out.
- The rule `testing`: a scenario sets the environment it needs itself.

## Questions and answers

- **Does a red run that ended after the owner's «стоп» hold the stop until it is read?** — «Да,
  красный читать и после «стоп» (Recommended)», by menu on 21.11. The stop word passes a running
  run and a fresh head, not a red attempt that ended after the word.

## Decisions

- **The CI hold is read before the release cases and before the menu cause.** The case «the
  scenario is over» releases the turn of a finished epic before anything reads CI, and a menu in
  place of the run would leave the run to the owner. Only the owner's stop word passes the hold.
- **The PRs judged are the open ones whose branch is current, the epic branch of the work, or one
  the session pushed in this record.** A push into an epic branch, or a task merged into it in the
  browser, moves the head of the epic's PR without any `gh pr create`; the current branch alone
  loses the PR of a branch the session left. Only bases in the pipeline's `pull_request` branches
  are judged: a PR into an epic branch gets no run here. The head is read past the adapter's cache.
- **A running run holds the stop unless a background watch of it runs.** The watch is an unrefused
  background task naming the run id or the PR number as a whole word, not yet ended. The watch only
  lifts the hold: the scenario's own cases decide the stop, so a session in «работа-отдана» takes the
  next task while CI runs.
- **A head pushed less than two minutes ago without a run holds the stop.** The run appears with a
  delay of the host; the window counts from the push, not from the PR.
- **A red run holds the stop until it is read.** A read is an unrefused call naming the run id after
  the end of that attempt, or a read of the output of the watch of that run; the watch call itself
  comes before the end and is no read. A cancelled, evicted, timed-out or failed-to-start run is red;
  a skipped run and runs of other workflow files hold nothing.
- **A silent host releases.** The session cannot read what the host does not answer; the release is
  journalled like the other silent cases.

## What is left unclear

- Several workflows on one head sha: the runs of the PR pipeline are taken; others are not judged.
