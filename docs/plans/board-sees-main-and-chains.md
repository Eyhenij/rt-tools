# A red main branch and the open tasks of a chain are seen by the owner alone

**Эпик:** RT-2146 · **Ветка эпика:** `RT-2146-board-sees-main-and-chains`

Two incident analyses arrived in the intake from the tree `70f4a3ad0c32`, and both name the same
hole from two sides: what happens after a merge is watched by nobody in the tree. In the first a
red run of the main branch stood for a day and a half, the rollout did not go, and the owner said
so — no rule, no audit and no guard had a line for it; a cancelled merge run looked like a passed
one. In the second the `Closes #…` line of two chain PRs promised a closing the host never does
for a base other than main, the tasks stayed open, and the board column lagged the work.

## What it gives

The tree sees the main branch after a merge the way it sees its own PR before one: the queue audit
names a red or cancelled main run, the session reads the last main run first, the PR body with a
base other than main says how its task closes, and the audit's finding about such a base names
both consequences. Both analyses leave the intake as fixed with this epic.

## What already stands and works

| What                         | Where                                                    | The state                                                                        |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| the queue audit              | `projects/agent-kit/assets/checks/board*.github.mjs`     | reads the tip of an open PR, the lag behind main, the epic links; not main's run |
| the run reading of the audit | `projects/agent-kit/assets/checks/board-runs.github.mjs` | asks the run of a PR tip; a run pushed out of the queue gets its own line        |
| the rollout lag              | rule `deploy-flow`, the audit                            | counts commits from the last successful rollout; says nothing of a red main run  |
| the PR body sample           | pattern `git-workflow-pr`                                | demands `Closes #<номер>`, silent about a base other than main                   |
| the chain patterns           | `git-workflow-stack`, `git-workflow-merge`               | speak of the base retarget, not of the task closing                              |
| the closing by the pipeline  | the pipeline «Close epic tasks» of this tree — RT-2143   | closes the tasks of a PR merged into any branch but main; waits for the merge    |

## Decisions

- **The audit reads the main run, the rule reads it too — two readers, one command.** The audit is
  called by hand and finds the state whole; the session start prints one line every time. Each
  alone misses: the audit waits to be called, the line at start says nothing about a merge made
  mid-session.
- **A cancelled run is a finding by its step count, not by its colour.** The list gives no colour
  to a cancelled run and to a passed one alike; zero steps tells them apart, and the audit already
  reads the step count for a run pushed out of the queue.
- **The `Closes` line stays where the tree closes by the pipeline; elsewhere the task is named in
  words.** A consumer tree without such an action gets a false promise from the line; the sample
  says which of the two the tree has, and the cleanup step after a chain merge closes what is left
  open by hand, with a comment naming the PR.
- **One finding, both consequences.** The audit's line about a base other than main names the run
  and the closing together: the reader acted on the first and never learnt of the second.

## How the branches stand

The epic branch is taken from main, every task branch from the epic branch, and the PRs of the
tasks go into it. The tasks touch different resources and do not stand on one another.

## The makeup

| #   | Task                                                                          | State |
| --- | ----------------------------------------------------------------------------- | ----- |
| 1   | RT-2147 — the audit reads the last main run: red and cancelled are findings   | ahead |
| 2   | RT-2148 — the session reads the last main run first; the start hook prints it | ahead |
| 3   | RT-2149 — the PR body with a base other than main says how the task closes    | ahead |
| 4   | RT-2150 — the audit's finding about such a base names both consequences       | ahead |

## What the epic does not do

- It does not carry the closing pipeline into the package: a workflow file is laid out nowhere
  by the package; the sample names it as this tree's technique.
- It does not touch the rollout itself: the lag audit stays as it is.
