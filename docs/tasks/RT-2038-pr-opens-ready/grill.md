# Grill

## The owner request

> бери все жалобы и предложения из приёмника, верифицируй их по соотвтевию общему направлению
> развития пакетов, заведи эпик и под задачи и бери в работу

And, about this work in particular, after the state of the pipeline was named to them:

> не нужно триггерить ci в ветку эпика, открывай пр в ветки эпика сразу ready, ci нужно триггерить
> только на мерж в main

Row 10 of the epic plan `docs/plans/cargo-intake.md`. It stood last and apart: it reverses the
accepted order of handing work in, and could not be taken before the owner spoke about it directly.

## The cargo records taken here

| #   | Key                                                                | Resource                             |
| --- | ------------------------------------------------------------------ | ------------------------------------ |
| 1   | `cb4719010a1631e6f30c2020a66cfb8eeb5b7a3e9aa7f38491aa502b7584b970` | `laws/delivery.md`                   |
| 2   | `e51fe88ccf324e2c3b040851b2a905e5550e1573b73f6751901a78429f87b687` | `rules/task-flow.md`                 |
| 3   | `82861a035149ad4452587e390838c5a7b14dc50171a69e2e1bd918fc87d47827` | `patterns/git-workflow-pr.github.md` |
| 4   | `e3421cf07b7ff858081ceb86571a203a5684d153f32f84d2e5d220eec4ebb9ba` | `patterns/task-flow-close.md`        |
| 5   | `ba9cbd095911972374c97b908e21c571136fc7cb89e5a9d8aaa5cc83c8c76beb` | `rules/git-workflow.github.md`       |
| 6   | `6d753d673612bab0f1ab2e6745c0b65d85457b76b05f31b6e008d4e8ea6cc409` | `patterns/git-workflow-stack.md`     |

Records 1–5 are one proposal split across five resources: the pipeline wakes on a push into any
branch, so the run is had before the PR, the draft is not needed at all, and every PR opens ready.
Record 6 is on its own: a chain merged out of order left two pieces of work in dead branches, and
no text names that consequence.

## What the tree already has

- `.github/workflows/ci.yml` holds one trigger — `pull_request:` with no branch filter. So a run
  today comes only from an open PR, and a PR into an epic branch takes a whole run of the single
  runner standing on the owner's machine.
- The comment in that file records why the filter by the main branch was removed: with it a chain
  got no run at all. The owner's decision reverses that, and it is their decision to make.
- `hooks/git-guard-delivery-draft.sh` demands three things at `gh pr ready`: a review exists, the
  PR does not conflict, the task folder is taken apart. Two of the three are already demanded at
  opening by `hooks/git-guard-delivery-folder.sh` and the delivery guard itself.
- The work queue audit already names an open PR without a reviewer — `checks/board-*.github.mjs`.

## What the rules already say

- **The draft exists to separate two states.** «What is not ready to merge opens as a draft» —
  the host locks a draft's merge button, so "put up for viewing" and "may be merged" stop looking
  alike. The reason holds only where something is waited for on the PR itself.
- **The PR of a task has the epic branch as its base.** The merge button on an epic branch means
  the whole epic, and the owner does not press it task by task.

## Decisions

- **The pipeline wakes only for a PR into the main branch** — the owner's words. The price of the
  former order is a whole run of the single runner for every PR into an epic branch, and the
  benefit was the same checks the push gate has already run locally. Rejected: a second trigger on
  a push into any branch, which the six records asked for — the owner named it and declined it.
- **A PR into an epic branch opens ready, without a draft** — the owner's words. Nothing runs on
  it, so there is nothing for a draft to wait for, and a draft there means only a locked button
  and an extra turn.
- **The draft stays for the PR of an epic into the main branch.** There the run does exist, and
  the reason the draft was created for holds whole. That is the boundary the articles gain, and it
  is narrower than what the records asked for.
- **No new guard is written for a reviewerless PR.** The reviewer cannot exist before the PR is
  opened, and the work queue audit already names an open PR without one.

## What is left unclear

- Whether the owner means the run on the PR into the main branch, or a run after the merge has
  landed there. Taken as the first: a run after the fact cannot stop anything, and the epic PR is
  exactly the place where the whole epic is judged before the button. Said in the PR body so that
  one word corrects it.
