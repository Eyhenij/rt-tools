# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The check in the browser and before the push
- **Done:** the task folder; the spec rules and scenarios SC-UKV-885…888; the keys in the controller, the popup and the tree; 2939 tests green
- **Next step:** press the keys on the showcase
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the rules and the scenarios of the new keys to the spec `option-list`, numbered from `SC-UKV-885`.
- [x] 2.1 Give the controller Home and End, and the select and the multiselect their answers.
- [x] 2.2 Wire the controller into the dynamic selector popup.
- [x] 2.3 Give `rt-tree` Home and End.
- [x] 2.4 Write the tests of the new scenarios and the companion lines.
- [>] 3.1 Press the keys in the showcase stories of the dynamic selector and the tree selector.
- [ ] 3.2 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- The checkbox row of the dynamic popup is a native button, so Enter ticks it without a handler of the popup; the radio button takes Enter itself.
- ArrowUp in the search field of the dynamic popup goes to the last row.

## Sessions

### 2026-10-21

- The task taken under epic RT-2861, the branch from RT-2870.
