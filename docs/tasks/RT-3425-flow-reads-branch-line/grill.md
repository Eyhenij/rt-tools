# Grill

**Описание фичи:** не нужно — правка движка хода работы и его описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 23 of the plan of the epic RT-3302.
The card (issue #3425): after the epic branch is merged into the branch of a task, the engine of
the work flow rolls the task back from «папка-разобрана» to «этап-идёт», though the folder is
taken apart and the PR is open. It happened on 19.11 with RT-3276: the epic branch held an old
copy of its folder, where step 3.4 was not done yet. The engine takes the progress from the
newest commit by time that holds the file, and that is a commit of the merged epic branch, not a
commit of the branch itself. The exit check then holds the turn on a step done long ago. The card
asks: the last version of a task file is read along the first line of the branch, and a merged
base does not replace the progress of the task. The sign is a scenario of the engine: the branch
took the folder apart, then merged a base with the old folder; the state is not below
«папка-разобрана».

## What the tree already has

- **The history the engine reads.** `projects/agent-kit/assets/task-flow/source/git.mjs:open`
  lists the commits the main branch on the server does not hold, oldest first — every commit
  reachable from the tip, the commits a merge brought in among them.
- **The last version.** `lastVersion(path)` walks that list from the newest and returns the text
  of the first commit whose tree holds the file. A commit of a merged branch that still holds the
  folder answers before the commit of the branch that took the folder apart.
- **Who reads it.** Four measurers: the progress and the plan of a task (`measure/progress.mjs`),
  the grill (`measure/grill.mjs`), the agreement (`measure/agreement.mjs`), the footprint
  (`measure/footprint.mjs`). Each asks the working tree first and the history second, so the
  wrong answer comes exactly when the folder is no longer on disk — after it is taken apart.
- **The suites.** The double of the history in `projects/agent-kit/tests/flow-doubles.mjs` is a
  straight line of snapshots and cannot show a merge. The suites of the step guard and of the task
  flow guard build a real repository.
- **The classification of RT-3418** counted this class: 16 refusals at turn ends over 14–19.11
  where the engine named the wrong state.

## What the rules already say

- The description of the flow script: the history of a branch is the commits the main branch on
  the server does not hold, and a fact read from it stays true in later sessions.
- The rule `git-workflow`: the epic branch is merged into the branches of its tasks while the work
  runs. So a merge of the base into a task branch is an ordinary step, not a rare case.

## Questions and answers

None. The card names the cause, the condition and the sign.

## Decisions

- **The last version is read along the first line of the branch.** The walk follows the first
  parent of every commit: the commits made on the branch and the merges into it, not the commits a
  merge brought. The tree of a merge commit is the result the branch chose, so a file the branch
  removed stays removed. Спросить было некого: заход автономный. Цена ошибки: один довод в вызове
  истории и сценарий.
- **The list of commits other measurers read stays as it is.** What a branch added and changed is
  asked of every commit; this task changes only the choice of the last version. The scenario shows
  whether another reader gives the same roll-back; if it does, it is fixed here, by the same line.
- **The scenario runs on a real repository.** The double cannot hold a merge, and a double taught
  to hold one would prove the double, not the call of the history.

## What is left unclear

- Whether the first measurer that rolled RT-3276 back was the progress alone, or the oldest commit
  that added the folder took part as well. The scenario of the first stage answers it.
