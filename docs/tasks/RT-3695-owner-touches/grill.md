# Grill

## The owner request

> Заведи новый эпик и задача в нем. Мне нужно, чтобы ты ускорил рабочий процесс. Изучи досконально
> task flow и вынеси в предложение, что можно уменьшить по ресурсам и времени, какие шаги, либо что
> можно вообще пропустить. Например, какие-то подтверждения плана, либо еще что-то. Свести несколько
> подтверждений в одно со стороны человека, либо еще как-то другими способами ускорить процесс
> разработки и уменьшить количество обращений к человеку. Ты можешь внести в качестве метрики именно
> количество обращений к человеку. Оно должно свестись к минимуму. Это цель эпика, и бери этот эпик в
> работу, в это дерево.

## What the tree already has

- The epic RT-3624 «Простая правка доходит до слияния за полчаса», plan `docs/plans/delivery-speed.md`,
  is closed and merged into main on 26.11 (commit 107186a17). It measured active minutes per task and
  shipped the light path, the second round by risk, `--single`, the snapshots of touched stories and the
  command `pnpm run session:time`. It measured no contact with the owner: that metric is new.
- Its plan is the sample of this epic's shape: a measurement before the start, proposals the owner
  decides with the price of each, the points A, B per task and G.
- The pattern `task-flow-start` already closes the remaining grill questions by assumption after two
  «recommended» answers in a row; the rule `task-flow-owner` lets the owner be asked only for decisions
  and approvals.
- The table of assignments names the copy `rt-tools` on the closed RT-3624.

## What the rules already say

- A series of tasks is declared an epic with all its tasks at once; here the owner named the epic and
  one task in it, and the rest of the makeup is what the owner chooses from the proposal.
- The row of assignments is the owner's: the owner's words «бери этот эпик в работу, в это дерево» are
  that row.

**Tasks of the grill:** 1

## Questions and answers

No question went to the owner: the request answers the six, and each is closed below by assumption.

- **Does the task change the application's behaviour** — closed by assumption: no, the subject is the
  work process; the task writes a proposal and changes no code.
- **Does it need an edit of a law or a rule** — closed by assumption: not in this task. The proposals
  will edit laws and rules, and each is an owner's decision in the proposal.
- **One task or several** — closed by the request: «новый эпик и задача в нем». The epic's further
  tasks are the proposals the owner approves.
- **What is not part of the task** — closed by assumption: implementing the proposals.
- **What will show that the task is closed** — closed by the request: a proposal whose metric is the
  number of contacts with the owner, measured before the start, with the expected drop for each
  measure.
- **Is there a sample** — closed by exploration: the plan `docs/plans/delivery-speed.md`.

## Decisions

- **The metric of the epic is contacts with the owner per task** — the owner named it. Counted from the
  session journals: every question window, every answer to it and every message the owner typed.
  Rejected: active minutes alone — RT-3624 already moved them, and they do not show the owner's load.
- **The proposal is the plan of the epic, and the owner decides it in one window** — fewer contacts is
  the goal itself.

## What is left unclear

- Which proposals the owner approves: the window after the proposal.
