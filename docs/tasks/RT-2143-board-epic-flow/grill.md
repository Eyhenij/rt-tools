# Grill

## The owner request

> давай задача «закрыта» честно означает «влита в ветку эпика», можно ли настроить автоматизацию:
> по мержу в main двигать тикеты которые уезжают в колонку deployed??

Asked by the question tool, the owner chose: «Да, все три шага» — closing the tasks on the merge
of their PR into the epic branch, the move to «Deployed» on a successful rollout, the sub-issue
progress field in the board view.

## What the tree already has

- The board columns end with `✅ Done → Deployed` (`.claude/skills/git-workflow/REFERENCE.md`);
  the archive record RT-2085 says nothing in the tree moves a card to Deployed.
- The host closes a task by `Closes #…` only on a merge into the default branch: #2135 merged into
  the epic branch RT-1896 left #2134 open.
- The board rule «Item closed → ✅ Done» is on since this day; the card of a closed task moves by
  itself.
- `tools/board.mjs` (laid out) talks to the host through the `gh` client and needs no packages:
  a script on top of it runs on a bare runner after checkout.
- The deploy pipeline ends with «Health check» on `ubuntu-latest`; the repository holds no secret
  with the project scope — `GITHUB_TOKEN` cannot read a user board.
- The board has the field «Sub-issues progress»; the board view does not show it.

## What the rules already say

- Rule `git-workflow`: a closed task leaves the queue by merge, not by column; the columns `done`
  and `deployed` «the work does not pass through» (pattern `git-workflow-commit`, laid out).
- Rule `testing`: a created check goes into the pipeline, not only into an umbrella target.

## Questions and answers

**Do all three steps?**
Да, все три шага.

## Decisions

- **The task closes on the merge of its PR into any branch but main.** — a merge into a chain
  branch is the same road into the epic; the sign is the base of the merged PR, read from the
  event. Rejected: listing `Closes` in the epic PR — progress would stand at zero to the end.
- **«Deployed» is set by the rollout, not by the merge into main.** — the owner's words say
  «уезжают»: a card in Deployed then means «stands on the node». Rejected: the merge event — a
  merge rolls nothing out here, the rollout is a hand-started run.
- **Every card in Done with a closed task moves, not only the cards of the deployed change.** —
  the rollout carries the whole main branch; what stood in Done before it is on the node after
  it. The kit tasks move too: their code is in main, though a kit reaches a consumer by publish.
- **The board token is a repository secret from the machine account's token.** — the same token
  the tree moves cards with; set from the file, never printed.

## What is left unclear

- Nothing.
