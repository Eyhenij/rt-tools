# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — The check before the push
- **Done:** the task folder; the parts read the root; 2939 tests and 895 snapshots green
- **Next step:** step 2.1
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the parts service and its source type.
- [x] 1.2 Move the popup and the list onto it, and bind the root.
- [x] 1.3 Give the popup specs and the showcase matrix a frame that provides the service.
- [x] 1.4 Mark the parts deprecated in the barrel.
- [>] 2.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- The list is shared by the selector and `rt-dynamic-input`, so both roots bind it.
- The popup source carries the root itself as its settings: the input names are the same.
- The frame of the popup lives in the showcase folder, and the popup specs draw it.

## Sessions

### 2026-10-21

- The task taken under epic RT-2861, the branch from RT-2871.
