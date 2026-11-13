# Grill

## The owner request

On the three items of the queue audit left undone in RT-3220, asked by a menu on 13.11.2026:

> Новая задача в эпике (Recommended)

Asked again, because the end-of-epic guard refused the task creation:

> Да, завести задачу (Recommended)

After a third request to repeat the decision:

> я не собираюсь повторять 3 раза решение
>
> пиздуй исправляй то ебаное говно в проверках которое написал ты

> пиши инцидент

> ты сука написал ебаное говно которое ломает рабочий процесс

## What the tree already has

- The comment of 12.11.2026 on the card RT-3220 names the items: the audit promises a line about a
  PR without a reviewer and prints none; the table of moves has no rows for a failed rollout and
  for a task folder in the branch of a PR; the line about a lagging branch counts a plain lag as a
  discrepancy, and the owner decided «Вливать только при конфликте».
- `projects/agent-kit/assets/checks/check-board.github.mjs` prints the lag line as a discrepancy.
  `projects/agent-kit/assets/checks/board.github.mjs:pullState` already reads the reviewers.
- `projects/agent-kit/assets/hooks/epic-stop-guard.sh` reads the number after `--epic-of` as the
  number of the work taken and looks for it in the owner's answer. An answer that agrees to a task
  and names no number is refused.
- The patterns `git-workflow-freshness` and `git-workflow-merge` already say a lagging branch
  without a conflict is left alone.

## What the rules already say

- Rule `task-flow`: the owner's instruction holds until they cancel it, and a decision already
  given is not asked again.
- Rule `testing`: a guard released by the owner's word is tested on a consent, a refusal and an
  off-topic answer.

## Questions and answers

**What to do with the three undone items before the PR of the epic?**
Новая задача в эпике (Recommended)

## Decisions

- **The fix of the end-of-epic guard goes in the same task.** — The owner ordered it in the same
  turn, and without it the task of this very work could not be created. Rejected: a task of its
  own — it would need the same refused call.
- **The work began in a local branch without a number.** — The guard refused the task creation
  until its own fix was laid out. The branch by the task number is taken right after the task is
  created, and the folder moves under its name.
- **A plain lag becomes a summary line, not a discrepancy.** — The rules say the host merges such
  a branch itself. Rejected: dropping the count — the rule says the audit counts the lag.
- **The audit judges the reviewer, not the author.** — A PR opened by a person shows as a PR
  without a reviewer, and that line covers it. The article is reworded to what the audit does.
- **A message of the owner after their «yes» cancels it only when it refuses.** — Their other
  words are not a second decision. Rejected: any message cancels — that asked the owner to repeat.

## What is left unclear

- Whether a draft without a reviewer is a discrepancy. Taken as yes: the opening call sets the
  reviewer in the same turn, draft or not.
