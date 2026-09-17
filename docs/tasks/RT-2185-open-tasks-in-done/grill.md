# Grill

## The owner request

> почему на доске в done лежат незакрытые задачи? исправляй автоматизацию

## What the tree already has

- The board query: seven open issues stand in the column «✅ Done» — #1878, #1951, #1961, #1970,
  #1988, #2090, #2102. All seven belong to epic #1870; their PRs (#2141, #2126, #2104, #2108,
  #2109, #2092, #2128) merged into the epic branch on 14–15 September.
- The closing pipeline closes a task on a merge into a branch other than main. It was added by
  commit `e79ff0930` on 15 September, 13:26 UTC — after all seven merges.
- The mover to «Deployed» names such a card a discrepancy in its own comment and silently skips
  it: it moves only a card whose task is closed.
- The queue audit judges the column only against an open PR — «in review» both ways. About a
  closing column it says nothing at all.
- The epic declaration is read by two words anywhere in the body. The phrase «Все семь — задачи
  эпика #1870» in this task's own description was read as «this task belongs to epic #1870», and
  the delivery check refused a branch from main.

## What the rules already say

- `git-workflow`: a closed task leaves the queue by a merge, and a lagging column is found by the
  queue audit, not by eye. The closing columns are not named there at all.
- `task-flow`: the state `влито` is the merge; no rule says who watches a card left in a closing
  column with its task open.

## Questions and answers

None asked: every answer above is read from the board, the pipeline file and the merge dates.

## Decisions

- **The audit names the discrepancy; the seven tasks are closed by hand in this task.** A catch-up
  that closes by itself would repeat the closing pipeline and could close what a person moved to
  «Done» by mistake. Rejected: a scheduled closing job.
- **The epic declaration is read at the start of a line, at most after one word.** The shapes the
  tree already writes stay declarations — «Задача эпика #N, план — путь», «Первая задачи эпика
  #7»; prose that mentions an epic mid-sentence stops being one. Rejected: demanding the full
  shape with the plan path — bodies written by hand carry the short form.
