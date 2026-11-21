# Grill

**Описание фичи:** не нужно — правка движка хода работы пакета правил; код приложений не меняется.

## The owner request

> обязан сам следить за проверками и ci

The owner's word of 21.11.2026. The CI run 44884048830 on the epic's PR #3472 into main went red,
and the owner saw it before the session did. The card RT-3467 asks: after the push and the PR the
turn exit guard reads the CI run of the branch's last commit.

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

None. The card names the cases and the sign; the owner's word orders the CI to be watched.

## Decisions

- **A running CI run holds the stop unless a background watch of that run runs.** The watch is a
  background command naming the run id; its notice wakes the session when the run ends. Without it a
  released turn leaves the red run to the owner, as on 21.11.
- **A red run holds the stop until a call after it names the run id.** The move — reading the run —
  is always open, so the hold is no dead end, and one run gives one refusal when the session reads it.
- **A silent host releases.** The session cannot read what the host does not answer; the release is
  journalled like the other silent cases.

## What is left unclear

- Several workflows on one head sha: the run of the PR pipeline is taken; others are not judged.
