# Grill

## The owner request

> почему тикет эпика не в in progress? … пиздуй прописывай в законах и правилах что ты обязан
> перетягивать эпик в in progress когда приступаешь к работе

## What the tree already has

- The epic RT-1896 stood in the first column while three of its seven tasks were merged into the
  epic branch: the board query showed `📋 Backlog` for the card, the sub-issue summary showed
  3 of 7 done.
- The delivery law says the state of a task in the work queue matches what is happening to it; it
  says nothing about the epic card.
- The rule `git-workflow` moves the task column «in the same motion as the work» — branch created,
  PR opened. The epic card is named nowhere in that article.
- The rule `task-flow` has the state `эпик-заведён` with the mandatory action «take the epic branch
  from the main branch»; the epic card's column is not part of it.
- The move command takes any task number: `npm run task:move -- <номер> in-progress` works for
  the epic card the same as for a task — checked by moving RT-1896 this turn.

## What the rules already say

- Law `work-conduct`: the epic is declared twice — a card and a plan; every task gets a card at
  once. About the epic card's column after the declaration — nothing.
- Rule `task-flow`: a task of an epic is linked to the epic card as a sub-issue, and the board
  counts the share of what is done from that. The share is there; the column is not moved.

## Questions and answers

**Which column and at which moment?**
The owner's words: in progress when work on the epic begins. The moment is the first task taken —
the same motion that moves the task's own column.

## Decisions

- **The epic card moves by the same command as a task card, on the epic number.** — no second
  technique; the command already accepts any number. Rejected: a board automation — the host has
  no rule «sub-issue moved → parent moved».
- **The law gets one article, the rules get the technique and the state table.** — a law says
  what must be true, a rule says by which command.

## What is left unclear

- A guard for it: none yet. Named in the rule's «What of the law is not here» until a check
  exists; a check is work of its own.
