# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The check before the push
- **Done:** the shared module `src/lib/options` published by `core`; every user switched; spec
  bindings repointed; 2914 tests, the typecheck, the build and the lint green
- **Next step:** push the branch through the gate set
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create the shared module under `src/lib/` with the tree walk, its types, the scroll helper and the highlight, and publish it from `core`.
- [x] 1.2 Turn the select and side-menu files into re-exports of the moved names, marked `@deprecated`.
- [x] 1.3 Move the tests of the moved functions next to the module.
- [x] 2.1 Switch the six users to import from `core`.
- [x] 2.2 Point the spec bindings at the new file.
- [>] 3.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- **No deprecated re-exports: the old function names leave `select` and `side-menu` now.** The
  rule `lib-layers` forbids re-exporting a foreign symbol in any form, and the linter refused
  `export { … } from '@rt-tools/ui-kit-v2/core'`. A constant pointing at the core function is
  the same re-export in another form. The root of the package still gives the tree functions and
  `rtScrollActiveOptionIntoView` under their names through `core`. `splitSideMenuTitle` and
  `splitTitleByWords` are renamed `rtMatchParts` and `rtMatchPartsByWords`. No code in this tree
  imports the removed names. Affected stage of the plan: 1, step 1.2.
- **`IRtSelect.Option`, `Row`, `TBranchState`, `SideKeyAnswer` and `IRtSideMenu.TitlePart` stay
  as type aliases.** They are the input contract of the select and the side menu, and many
  applications name them. Affected stage of the plan: 1.
- **The scroll spec stays in `select`.** It checks the select, the multiselect and the
  autocomplete, not the function on its own. Affected stage of the plan: 1, step 1.3.
- **The epic plan keeps the old address of the tree walk** as its starting state, and the address
  is listed in `tools/doc-paths-allowlist.json`. Affected stage of the plan: 2.

## Sessions

### 2026-10-20

- The task taken under epic RT-2861; the epic branch caught up with `main`.
