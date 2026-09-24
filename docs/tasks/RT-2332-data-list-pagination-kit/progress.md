# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Frames, spec rules and the PR
- **Done:** the list draws `rt-pagination`, frames re-taken, the strip is a rule of the material spec
- **Next step:** take the task folder apart and open the PR into RT-2330 as a draft
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Give `rt-pagination` its own properties for the page box, the current page, the arrows, the range label and the page size field, defaults equal to today's values
- [x] 1.2 Give the material preset `--rt-pagination-*` values measured from the first kit
- [x] 1.3 Show the pair of presets in the page strip's stories
- [x] 2.1 Put `rt-pagination` into the list in place of its own strip, with the list's page sizes and the first kit's page after a size change
- [x] 2.2 Remove `rt-data-list-pagination` with its spec and the logic nothing calls any more
- [x] 2.3 Move the list's specs to the kit strip's anchors
- [x] 3.1 Look at the diverged frames and re-take them in the image
- [x] 3.2 Move the page strip from «out of scope» to the rules of the spec, with its binding
- [>] 3.3 Open the PR into RT-2330 as a draft

## Decisions along the way

- **The page numbers follow the kit's rule, not the first kit's.** The kit shows the first, the last and the neighbours of the open page; the first kit showed all of them up to six. The owner asked the table to use the kit's components. Affected stage: 2.

- **The page strip's stories already show the pair of presets.** `Presets` existed, so step 1.3 needed no new story. Affected stage: 1.
- **The page size label no longer wraps in both presets.** «На странице:» broke into two lines in a narrow strip. Affected stage: 1.

- **The strip's arrows became an input.** The first kit draws arrows, the kit draws chevrons; `prevIcon` and `nextIcon` let the list pick by its look. Affected stage: 2.
- **The list and page strip tokens moved to a part of their own.** The forms part grew past 500 lines; the generated set is the same, only its order moved. Affected stage: 2.
- **The label stays the kit's «На странице:».** The first kit wrote «Items per page:»; the kit's word is kept. Affected stage: 2.
- **The icons of the material set are thicker than the first kit's.** The first kit's list draws the classic Material Icons font; the kit took Material Symbols at weight 700. Outside this task: filed as RT-2342. Affected stage: none.

## Sessions

### 2026-09-24

- The epic took main: the side-menu conflict resolved, eleven first-kit frames re-taken, the changelog split, ten archive records pruned. RT-2330 took the epic.
