# Grill

## The owner request

> В PR #2583 (Recommended)

The answer to the question where the tree scenarios get new numbers. Main's `rt-dot-field` took
SC-UKV-637…643, and five `rt-tree` scenarios of the epic branch repeat 639…643. The spec check
refuses the merge of main into the epic branch. PR #2583 was already merged when the answer came,
so the renumber goes as this task.

## What the tree already has

- The renumber commit `bdae700e3` on the branch of RT-2572: tree scenarios 639…643 become 672…676
  in the tree spec, its implementation map, the scenario index, two spec files and the matrix
  story.
- `pnpm run spec:next-id SC-UKV` gave 677 after 672…676 were taken.

## What the rules already say

- A scenario number is issued once and never reused: the tree's numbers move, the dot field's stay.

## Questions and answers

**Where do the tree scenarios get new numbers?**
«В PR #2583 (Recommended)»

## Decisions

- **A task of its own instead of #2583** — #2583 was merged and its task closed; the delivery guard
  refuses a new PR on a closed task. Rejected: a push into the merged branch — it recreated the
  branch outside the epic.

## What is left unclear

- Nothing.
