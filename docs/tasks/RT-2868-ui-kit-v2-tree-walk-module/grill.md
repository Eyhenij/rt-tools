# Grill

## The owner request

> Делай RT-2861

The first task of epic RT-2861. The task body (#2868): the tree walk (`rtTreeRows`, `rtTreeSideKey`,
`rtTreeBranchState` and the rest of `rt-select-tree.ts`) lives in `select`, so the tree and the
draggable tree depend on the select. The match highlight `splitTitleByWords` lives in the side
menu, so the tag and the tree depend on it. They move to a shared kit module with no change in
behaviour; the old names stay re-exported for one release.

## What the tree already has

- `rtTree*` functions live in `src/lib/components/select/rt-select-tree.ts` and use the
  `IRtSelect` option and row types from the select model.
- `rtScrollActiveOptionIntoView` lives in `src/lib/components/select/rt-select-active-option.ts`.
- `splitTitleByWords` lives in `src/lib/components/side-menu/rt-side-menu.logic.ts`.
- Users outside their owner: autocomplete, multiselect, tree, draggable tree, hybrid tree, tag.
- The kit's shared code lives under `src/lib/` (`util`, `platform`, `scroll`) and is published by
  the `core` entry point (`src/lib/core.ts`). Every component already imports `core`, and `core`
  imports no component entry point.

## Questions and answers

The owner named the epic, and its plan answers the questions of this task.

- **Behaviour changes?** No. The epic plan: «без смены поведения».
- **Where do the functions go?** A shared module under `src/lib/`, published by `core`: the only
  place every component can import without a cycle.
- **What happens to the old names?** They stay as re-exports from `select` and `side-menu` with a
  deprecation mark, for one release.
- **Done sign:** the tag, the tree and the draggable tree import neither `@rt-tools/ui-kit-v2/select`
  nor `@rt-tools/ui-kit-v2/side-menu`; tests and showcase snapshots unchanged.
- **Not part of it:** one search rule for the kit (RT-2869), the option-list controller (RT-2870).

## Decisions

- **The types the functions need move with them.** `core` cannot import the select model: the
  select imports `core`, and the reverse import makes a cycle. The select model keeps its names
  as aliases of the moved types.
