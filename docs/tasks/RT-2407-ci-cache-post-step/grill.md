# Grill

## The owner request

> Задачи вне эпиков

The answer to the question what this copy takes after RT-2471; RT-2407 was named in the option.

## What the tree already has

- The task body: the step «Post Cache node_modules» fails with «Path(s) specified in the action
  for caching do(es) not exist», while every check of the run passed.
- Reproduced on 2 October: run 36994703590, attempt 1, failed only on that step; attempt 2 passed.
- The cache step computed the store path `~/setup-pnpm/node_modules/.bin/store/v11`: pnpm is
  installed by `pnpm/action-setup` into `~/setup-pnpm` by default, and the store lies inside it.
- The machine carries three runners — this tree's and two of other projects. A runner of another
  project started a job at 10:59 UTC, and `~/setup-pnpm` was recreated in that same minute: a
  shared home path is wiped under a running job of this tree.

## What the rules already say

- `git-workflow`: «On a machine with several runners, any path from the home directory is shared.
  Install directory, container name and builder name are per project.»
- `deploy-flow`: an edit to the pipeline is checked before the merge; a PR run reads the workflow
  file from the branch.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: behaviour of the applications does not change — only the CI file.
- Question closed by assumption: one task — one line of the workflow.
- Question closed by assumption: the sign is a green PR run with the store path under this runner's
  own tool directory.

## What is left unclear

- Nothing.
