# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Layout and the set
- **Done:** the spec and the scenarios, the guard and its tests, the layout into the tree
- **Next step:** run the push set of the tree
- **Uncommitted:** the task folders of the other epic tasks, created by `task:new`
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the three articles into the spec of the delivery guards
- [x] 1.2 Write the scenarios SC-AK-1234…SC-AK-1236 next to it
- [x] 2.1 Write the tests of the three scenarios and see them red
- [x] 2.2 Recognise the push by the subcommand of the same `git` call
- [x] 2.3 Count several recipients and a loop over the whole command text
- [x] 2.4 Put the terminal tab tool into the header and into the tool list
- [x] 3.1 Build the package and lay it out into the tree
- [>] 3.2 Run the push set of the tree

## Decisions along the way

- **The scenarios are numbered SC-AK-1237…SC-AK-1239, not 1234…1236.** `pnpm run spec:next-id AK`
  named 1236 as taken across the branches. Affected stage of the plan: 1.
- **A deletion push is not judged for recipients.** `--delete` sends no branch; the guard of a
  merged branch and its deletion is task RT-3055. Affected stage of the plan: 2.

## Sessions

### 03.11.2026

- The task is taken from the epic RT-3043, the branch is taken from the epic branch.
- The suite of the push guard went from 39 to 52 ok, the delivery guards stay at 106 ok.
  `npm run check:specs` exits with zero.
- The first versions of the tests passed on the old guard: the red set refused any push, and the
  word in quotes after `"` never matched. The tests now run the recipient cases on a green set.
