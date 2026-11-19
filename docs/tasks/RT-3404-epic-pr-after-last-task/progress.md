# Ход работы

## Где мы

- **State:** `этап-идёт`

## Шаги

- [x] 1.1 The task merged last with no mark meets exit 12, whatever its row
- [x] 1.2 A mark on a task with an open PR keeps exit 12 unmet
- [x] 1.3 A fresh branch with no PR counts as not merged
- [x] 1.4 The epic plan marks RT-3392 merged
- [x] 2.1 The action of `влито` names the merge of the chain
- [x] 2.2 The pattern `task-flow-resume` carries the same words
- [x] 2.3 The spec article of exit 12 names the merged PR on the hosting
- [x] 2.4 The laid-out measure reads the open PR of a marked task

## Decisions along the way

- 19.11, live check: the laid-out exits read on this tree and the hosting give nextTaken, mergedMarked
  and finished all `false`. Of 18 rows of the epic plan, 13 have a merged PR and the mark; 2 are
  deferred; exit 12 is held by RT-3276 (no PR, another working copy leads it), RT-3404 and RT-3410.
  The engine suite: 155 ok, 0 failures.
- 19.11, review round one. Confirmed and fixed: the mark was required of no task, against the card —
  now every merged task is marked except the one merged last by `mergedAt`; a mark on a PR closed
  unmerged counted — now it does not; exit 11 held an unmarked merged task whose branch the hosting
  removed — now a merged PR takes it out of «ahead» (SC-AK-1755). Written off: an unmarked merged
  task with a second open PR (low; an open-PR read per row costs about a second each); a PR merged
  into any base (exit 13 still checks the tips); SC-AK-1754 alone proves little (kept as a guard
  against reading tips). A chain merged top-down leaves its upper task to be marked: the action of
  `влито` says bottom-up, and the ask-judge refused dropping the mark rule.
- 19.11, review round two. Confirmed and fixed: a chain merged top-down left its upper task, the last
  row, to be marked — the task of the last row is now exempt too; a chain merged in one go left its
  middle tasks unmarked — the pattern lets the upper branch mark them ahead, and exit 12 holds while
  their PRs are open; the tree rule named the merge as the owner's while the action of `влито` names
  the merge — the rule now names no button. Live: the Stop judge of RT-3276 runs with a median of
  37.2 s over 172 ends of a turn since 14.11. Written off: a mark with no PR in view counts (the
  window of 300 merged PRs); the tree rule commit lies outside the plan footprint — the owner ordered
  it on 19.11, and the PR names it. QA of round two, confirmed and fixed: the flow guard suite expected
  the old action text (SC-AK-289); a mark on a fresh branch with no PR counted — a branch left on the
  server now keeps it out, and SC-AK-1754 checks the marked case; the headlines left out the last
  row; tasks merged in the same second blocked each other — all of them count as last. Written off: a
  PR merged into any base (exit 13 checks the tips).
