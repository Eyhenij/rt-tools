# Grill

Cargo: the analysis «2026-09-16-chain-prs-left-tasks-open-after-merge», tree `70f4a3ad0c32`, the
sign in the intake `e196c214-6e2d-4067-8faa-d1574f0ba427`; proposal 3.

## The owner request

> бери новый эпик — исправь все замечания и предложения из приёмника, которые ещё не обработаны

The task is the fourth of the epic RT-2146; its plan is `docs/plans/board-sees-main-and-chains.md`.

## What the tree already has

- Since RT-2066 the queue audit is silent about a PR whose base is not the main branch: the line
  «no run on the tip» stood on every task of every epic and advised moving the base, which is
  wrong for an epic. Scenario SC-AK-845 holds the silence per request.
- The analysis came from a tree with the former line: it named one consequence — no run — and the
  executor read it as knowledge about the run alone; the second consequence — the host closes no
  task on such a merge — was read by nobody.
- RT-2149 gave the PR body the way the task closes on such a base; the audit says nothing of it.

## What the rules already say

- Spec of the board audit: «A request whose base is not the main branch is not counted as lacking
  a run» — silence by request, the order of handing in.
- Rule `git-workflow`: the tip of an open PR without a run is seen by the audit unless the
  pipeline does not wake for its base.

## Questions and answers

None: the analysis names the proposal whole, and the owner's word is the epic.

## Decisions

- **The silence per request stays; both consequences are named once, by one line of the audit.**
  A line on every epic task would teach to skip the audit — that was RT-2066's reason. One
  summary line counts the open PRs with such a base and names what the base means for all of
  them: no run will come, and the host closes no task on their merge — the tree closes those by a
  pipeline of its own or by the hand. Not a divergence: the order of handing in.

## What is left unclear

- Nothing.
