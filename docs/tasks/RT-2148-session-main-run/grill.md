# Grill

Cargo: the analysis «2026-09-10-merge-without-a-run-stopped-the-deploy», tree `70f4a3ad0c32`, the
sign in the intake `998af703-6ae5-4818-a66c-710d36163799`; proposal 1.

## The owner request

> бери новый эпик — исправь все замечания и предложения из приёмника, которые ещё не обработаны

The task is the second of the epic RT-2146; its plan is `docs/plans/board-sees-main-and-chains.md`.

## What the tree already has

- The queue audit reads the last run of the main branch since RT-2147: `lastMainRun` and
  `pipelineWakesOnPush` in the run reading of the audit, two findings and one out-loud line.
- The session start is served by hooks on `SessionStart`: the work state by `task-context-load`,
  the handover and the turn map by the entry hooks; none of them asks the hosting.
- A hook calls a laid-out check by the directory named in the tree config — `epic-over.sh` does
  it for the epic table, and that is the sample.

## What the rules already say

- Rule `git-workflow`: one's own open PRs are reread in three places — before a push, on taking a
  task and after every known merge. The main run is named by nobody at those places.
- Rule `task-flow`: a session does not start work by itself; the state from the startup hook says
  what to do. The main run is not among what the start prints.

## Questions and answers

None: the analysis names the proposal whole, and the owner's word is the epic.

## Decisions

- **One command reads the main run, and two readers call it.** The audit found the state whole in
  RT-2147; here the same reading gets a command of its own that prints one line, and the start
  hook prints that line into the context. The rule names the same command after every known merge.
- **The start hook does not refuse the launch.** No node, no check laid out, no network — the hook
  stays silent or prints that the run was not read; a start that refuses leaves the owner without
  a session.

## What is left unclear

- Nothing.
