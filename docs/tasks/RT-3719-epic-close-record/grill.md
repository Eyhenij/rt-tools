# Grill

**Behaviour:** unchanged — правятся только план эпика и файл его находок, код и правила не трогаются

## The owner request

The owner's words of 27.11 in a window, verbatim:

> Закрыть эпик как есть

The option said: the epic goes to the owner for the merge into the main branch with the three done
tasks and the records of the deferred ones; the milestone «не больше 2 обращений на задачу» is
written as not reached; the owner merges by the button.

Before it, three words of the owner the same day, each in a window: «Отложить RT-3698
(Recommended)», «Отложить RT-3699 (Recommended)», «Отложить RT-3700, собрать отчёт (Recommended)»;
and earlier «отложить RT-3697».

## What the tree already has

- **The epic plan** `docs/plans/owner-touches.md` on the epic branch shows RT-3701 «в работе» though
  it is merged (ea4897be9), and RT-3697–RT-3700 «впереди».
- **The deferral records** lie in local task branches only: RT-3697 in `RT-3697-no-repeat-windows`,
  RT-3698 in `RT-3698-plan-by-epic-word`, RT-3699 and RT-3700 in `RT-3699-epic-start-one-window`.
  None of them is pushed.
- **The measurer of the epic end** (`measure/epic.mjs:finished`) asks every row that is not
  «отложено» to have landed and the epic PR into main to stand.
- **The measurements** behind the deferrals: 3 of about 40 merges since 14.11 carry no sign of the
  window; the start of RT-3693 took one window; 18 windows before the plan on 26 tasks, 17 of them
  without one; since 21.11 220 typed messages, 112 window answers, 144 hook windows.

## What the rules already say

- `epic-flow`: the epic branch carries the plan and the merges of the tasks, no edits of its own; the
  owner's later words go into the epic plan that turn.
- `git-workflow-pr-body`: half of a task's work leaving by a PR starts with «Часть #N»; the deferred
  cards stay open.

**Tasks of the grill:** 1

## Questions and answers

No question was put: the owner's window answers above decide the work.

## Decisions

- **The epic plan names RT-3701 «влита» and RT-3697–RT-3700 «отложено», and the milestone as not
  reached with its reason.** — the owner's words. Rejected: merging the deferred task branches — they
  carry unapproved or unfinished work.
- **The findings file takes the four sections of the deferred tasks from their branches.** — they
  are the report the owner asked for. Rejected: a new report file — the findings file already is it.
- **The deferred cards go back to the backlog.** — the work waits for the owner's word, not for an
  executor.

## What is left unclear

- **The row of RT-3217** stands «вне эпика»; the end measurer may still ask its tip. Checked at the
  end of the stages by `node tools/task-flow-script.mjs measure`.
