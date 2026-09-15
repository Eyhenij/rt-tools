# Grill

Cargo: the analysis «2026-09-10-merge-without-a-run-stopped-the-deploy», tree `70f4a3ad0c32`, the
sign in the intake `998af703-6ae5-4818-a66c-710d36163799`; proposals 2 and 3.

## The owner request

> бери новый эпик — исправь все замечания и предложения из приёмника, которые ещё не обработаны

The task is the first of the epic RT-2146; its plan is `docs/plans/board-sees-main-and-chains.md`.

## What the tree already has

- The queue audit asks the hosting about the tip of an open PR (`runsOnHead`, `verdictOnHead`,
  `evictedOnHead`) and about the rollout (`deployLag`, `lastDeploy`); a run of the main branch it
  never asks.
- A run pushed out of the queue is told from a fallen one by its step count — `evictedOnHead`
  already does that for a PR tip; the analysis names the same sign for a merge run.
- The pipeline of this tree wakes on `pull_request` alone: `gh run list --branch main` shows only
  hand-started runs here. In the consumer tree the pipeline runs on a push to main, and that is
  where the red stood for a day and a half.

## What the rules already say

- Rule `testing`: red has an assigned action — first the output of the step. The article speaks
  of a run the executor opened; nobody opened this one.
- Rule `deploy-flow`: a divergence of production from the main branch is visible by the queue
  audit — by the last successful rollout. A red main run without a rollout step is not that.

## Questions and answers

None: the analysis names the proposals whole, and the owner's word is the epic.

## Decisions

- **The audit reads the last run of the pipeline on the main branch and names two states.** Red
  — the merges on top go out unchecked; cancelled with zero steps — pushed out of the queue, the
  merge was never checked. A green or a running one is silence.
- **A tree whose pipeline does not wake on a push to main is told so out loud.** Silence would
  read as «main is green»; the audit reads the trigger from the pipeline file and says the run
  was not checked.

## What is left unclear

- Nothing.
