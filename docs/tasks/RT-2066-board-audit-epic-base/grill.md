# Grill

The work has no cargo record behind it: it arose from the task #2038 the same day and is a
consequence of it.

## The owner request

> бери все жалобы и предложения из приёмника, верифицируй их по соотвтевию общему направлению
> развития пакетов, заведи эпик и под задачи и бери в работу

And, about the order of handing in, the word that created this consequence:

> не нужно триггерить ci в ветку эпика, открывай пр в ветки эпика сразу ready, ci нужно триггерить
> только на мерж в main

The twelfth row of the epic plan `docs/plans/cargo-intake.md`.

## What the tree already has

- `projects/agent-kit/assets/checks/board-pull-state.github.mjs` — the branch that judges a PR
  whose base is not the main branch. It reports a discrepancy and advises moving the base to the
  main branch once the lower request is merged. Its copy in this tree is `tools/board-pull-state.mjs`.
- The branch was written for a chain of requests, where the base really does move to the main
  branch after the lower one merges. The order of an epic is different: the base of a task request
  is the epic branch and stays so to the merge.
- `.github/workflows/ci.yml` — the trigger is narrowed to `main` by the task #2038, so a request
  into an epic branch gets no run at all, lawfully.
- `docs/specs/agent-kit/board/` — the spec of the work queue audit, prefix `SC-AK-8xx`.

## What the rules already say

- `rules/git-workflow.github.md` — a PR the pipeline does not wake for opens ready; the base of a
  task request is the epic branch, and only the request of the epic itself is based on the main
  branch.
- `rules/deploy-flow.github.md` — which PRs the pipeline wakes for is named by the tree, and it
  sets the order of handing in.
- `rules/testing.md` — a check's known list names itself and explains itself; a line is not added
  to it for a red check.

## Questions and answers

The owner was not asked: the answer stands in the rules and in their word about the order of
handing in, quoted above.

## Decisions

- **A request that gets no run because of its base is not a discrepancy** — reason: after #2038
  that is the accepted order for every task of an epic, and a line printed on every such request
  makes the audit noisy exactly where everything is right. Rejected: leaving the line and
  reconciling it by eye — the audit is read to find what to fix, and a permanent line teaches to
  skip it.
- **The advice to move the base to the main branch leaves the epic case** — reason: for a task of
  an epic it is wrong outright; the base stays the epic branch to the merge.

## What is left unclear

- Whether the check should read the pipeline file itself to learn which bases wake a run. For this
  tree the answer is not needed: the trigger names the main branch, and the audit already knows the
  name of the main branch.
