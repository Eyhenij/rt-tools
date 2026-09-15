# Grill

The closing work of the epic RT-2097: the four tasks are merged into the epic branch, and the
branch goes to the main one. The owner's request and answers on the design stand in the records
of the tasks in the archive; here — what the closing adds.

## The owner request

> всё вмержено, подтяни свежий main и почисти ветки

## What the tree already has

- **The epic plan** — `docs/plans/rule-usage.md`: four tasks, all merged by the PRs #2110…#2113 into `RT-2097-rule-usage`.
- **Main moved ahead by ten commits** while the chain was written: RT-2103, RT-2105, RT-1970, RT-1988 among them.
- **A collision of scenario numbers.** RT-2098 issued `SC-AK-1094`…`SC-AK-1098` to the observation cargo scenarios of `docs/specs/agent-kit/observations/cargo/`; RT-2105, merged into main today, issued the same five numbers to `docs/specs/agent-kit/discard-guard/`. After main is merged in, `npm run check:specs` names five taken identifiers and the push gate refuses the epic branch.

## What the rules already say

- `spec-driven` — a scenario number is issued once and never reused; a new one takes the next free number; a scenario and the title of its test are edited by one change.
- `git-workflow` — the main branch is merged into the epic branch, not bypassed; the epic branch carries the plan and the merges of its tasks; a divergence inside a chain is resolved by the one who branches.
- `task-flow` — the PR of the epic opens when its last folder is taken apart; the guard demands a folder by the branch name for any edit of the tree.

## Questions and answers

None asked: the owner ordered the closing in one line, and the collision has one lawful answer in the rule of specs.

## Decisions

- **The collision is resolved on the epic branch, by the merge of main, under a folder of its own.** The delivery guard refuses a task branch off the epic branch while the epic branch at the host lacks main's tip, and the push gate refuses the epic branch while the numbers collide: a task branch cannot be started, and the fix is the resolution of the very merge. The folder is taken apart by the last commit, as with any work. Rejected: a fix past the guard on an unnumbered branch — an edit laid past the guard in silence.
- **The cargo scenarios take the next free numbers, `SC-AK-1099`…`SC-AK-1103`; the discard-guard ones stay.** Those are already in main, and a number in main is never renumbered.
- **Task #2114, created for the fix before the guard refused its branch, is closed as not planned with the reason in its comment.**

## What is left unclear

- Nothing: the closing has one path — merge, renumber, take the folder apart, open the PR of the epic into main.
