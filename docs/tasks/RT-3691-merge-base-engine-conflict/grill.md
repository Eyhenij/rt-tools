# Grill

## The owner request

> Задача вне эпика от main

The owner's answer in the menu of 26.11 to the question: the merge of `main` into the epic branch RT-3602 is
refused, the guard of the work course lets a conflict in the engine files through only in a task whose plan
names them, and the delivery guard does not let a task branch be taken before the merge. The chosen option
said: a task outside the epic on the proposal sent to the intake, the branch from `main`, the plan names the
file of the guard, two review rounds, a package release; then `main` goes into the epic and RT-3674 is taken.

## What the tree already has

- `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProtected` refuses an edit of a path of
  `GUARD_SETTINGS.protectedPaths` unless the approved plan of the branch names it in a row marked «(правится)».
  `judgeCall` sends every Edit and Write of such a path there; `judgeShell` refuses a shell write into it, and
  `git checkout` is no reader in `GIT_READERS`.
- `projects/agent-kit/assets/checks/flow-guard-run.mjs:guardContext` builds the context of the guard: the
  branch, the plan, the marks; it knows nothing of a merge in progress.
- The 26.11 merge of `origin/main` into `RT-3602-owner-stop-holds` left 8 conflicts. In the package source only
  `projects/agent-kit/assets/checks/task-flow-script.mjs` (one line of `USAGE`); the laid-out
  `tools/task-flow-script.mjs`, `tools/task-flow/flow.js`, `tools/task-flow/flow.md`, `tools/decision-table.json`,
  `.claude/skills/task-flow/pitfalls-2.md`, `.claude/rt-kit/defaults/turn-map.md`, and the owner's
  `.claude/rt-kit/assignments.md`. Both the edit and `git checkout --theirs` of the source were refused.
- `projects/agent-kit/assets/checks/flow-guard.mjs` has 496 lines against the code limit of 500.
- The suite of the guard: `projects/agent-kit/tests/flow-step-guard.test.sh`. The proposal of 26.11 lies in
  `.claude/rt-kit/proposals/2026-11-26-RT-3674-main-into-epic-engine-conflict.md` and is sent.

## What the rules already say

- `git-workflow`: «The main branch is merged into the epic branch, and the epic branch into the branches of its
  tasks — while the work runs, not before the hand-over.» A merge needing repairs goes into the epic branch
  alone, the repairs into the task branch.
- `task-flow-plan`: the description and the engine are edited only by an approved plan naming them; the reason
  is that an edit there changes the judging of every session.

## Questions and answers

No question is asked: the owner chose the path in the menu, and the proposal names the rule and its scenarios.

## Decisions

- **A merge of a reviewed base lets the resolution of a conflict through.** The base is reviewed when the
  merged head is an ancestor of the remote main branch or of a remote epic branch an epic plan of the tree
  names. Rejected: any merge — a branch nobody reviewed would carry an engine edit past the plan.
- **A resolution is a choice of a side or an edit whose every line stands in one of the two sides.** A line
  that is in neither side is refused as before. Rejected: the text of one side only — the 26.11 `USAGE` line
  holds the words of both sides, and its new line would still be refused; it is fixed in a task branch.
- **The judging lives in a module of its own.** `flow-guard.mjs` has 4 lines of room.

## What is left unclear

- Whether the package is released before RT-3674: the release follows this task by the owner's menu answer.
