# Grill

Cargo: the analysis «2026-09-16-chain-prs-left-tasks-open-after-merge», tree `70f4a3ad0c32`, the
sign in the intake `e196c214-6e2d-4067-8faa-d1574f0ba427`; proposals 1 and 2.

## The owner request

> бери новый эпик — исправь все замечания и предложения из приёмника, которые ещё не обработаны

The task is the third of the epic RT-2146; its plan is `docs/plans/board-sees-main-and-chains.md`.

## What the tree already has

- The PR body sample of the pattern `git-workflow-pr` demands the line `Closes #<номер>` and is
  silent about a base other than the main branch.
- The chain pattern speaks of the base retarget after the lower merge, and its miss paragraph
  says «the task closes by its `Closes` line» — which is exactly what the host does not do there.
- The merge pattern rereads the PR body after a merge and says nothing of the task's state.
- This tree closes the task of a PR merged into any branch but main by its own pipeline
  `close-epic-tasks.yml` (RT-2143); the override on the commit pattern names it. A consumer tree
  without such a pipeline gets a false promise from the same line.

## What the rules already say

- Rule `git-workflow`: a task is closed by the merge, not by the column; the PR is attached to the
  task by the `Closes` line. Neither article says on which base the host reads the line.

## Questions and answers

None: the analysis names the proposals whole, and the owner's word is the epic.

## Decisions

- **The `Closes` line stays where the tree closes by the pipeline; elsewhere the task is named in
  words.** The sample says which of the two the tree has, and the body says it too: a reader of
  the PR sees how the task closes without knowing the tree.
- **The cleanup step after a chain merge closes what is left open by hand, with a comment naming
  the PR.** The state of the task is asked by a command, not assumed from the merge.

## What is left unclear

- Nothing.
