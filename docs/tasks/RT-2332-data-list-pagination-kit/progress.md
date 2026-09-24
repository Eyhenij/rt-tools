# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The kit's page strip learns the first kit's look
- **Done:** branch taken from RT-2330 after the epic got main; the first kit's strip measured
- **Next step:** own properties of `rt-pagination`
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Give `rt-pagination` its own properties for the page box, the current page, the arrows, the range label and the page size field, defaults equal to today's values
- [ ] 1.2 Give the material preset `--rt-pagination-*` values measured from the first kit
- [ ] 1.3 Show the pair of presets in the page strip's stories
- [ ] 2.1 Put `rt-pagination` into the list in place of its own strip, with the list's page sizes and the first kit's page after a size change
- [ ] 2.2 Remove `rt-data-list-pagination` with its spec and the logic nothing calls any more
- [ ] 2.3 Move the list's specs to the kit strip's anchors
- [ ] 3.1 Look at the diverged frames and re-take them in the image
- [ ] 3.2 Move the page strip from «out of scope» to the rules of the spec, with its binding
- [ ] 3.3 Open the PR into RT-2330 as a draft

## Decisions along the way

- **The page numbers follow the kit's rule, not the first kit's.** The kit shows the first, the last and the neighbours of the open page; the first kit showed all of them up to six. The owner asked the table to use the kit's components. Affected stage: 2.

## Sessions

### 2026-09-24

- The epic took main: the side-menu conflict resolved, eleven first-kit frames re-taken, the changelog split, ten archive records pruned. RT-2330 took the epic.
