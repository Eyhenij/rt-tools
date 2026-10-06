# Grill

## The owner request

> <the path to the shared components of a consumer application — left out: consumers of the kits are not named in the tree>
>
> гля что можно взять в кит вынести

> 1-9 берем заведи эпик и го делать пока 2426 на ревью

The list the owner answered «1-9» to, as it was given in the session:

1. `rtui-tree` (`cc-tree`) → `rt-tree` — the selection tree; the first consumer is the base, the second adds «select all».
2. `draggable-tree` → `rt-draggable-tree` — nodes reordered by dragging before, after or inside.
3. `common-tree-selector` → a field that opens the tree in a popup with «Apply».
4. `common-hybrid-tree-selector` — decided after 3: a mode of 3 or nothing.
5. `breadcrumb` → `rt-breadcrumbs`, together with the second consumer's `page-crumbs`.
6. `editable-badge` + `text-input` → editing a value in place: a pill or text turns into a field with save and cancel.
7. `speed-menu` → a quick menu at a floating round button.
8. `color-palette` → `rt-color-palette` without the third-party `color-circle`.
9. `rtui-card-carousel` → `rt-carousel`.

«2426» in the request is read as RT-2526: that is the PR under review now (#2527).

## What the tree already has

- **The tree of options in the select and the multiselect** — `docs/specs/ui-kit-v2/option-tree/`:
  branches, partial checkbox, filter keeping the path, side arrow keys. The logic is one pure module,
  `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts` (`rtTreeRows`, `rtTreeBranchState`,
  `rtTreeLeaves`, `rtTreeOpenFor`, `rtTreeSideKey`, `rtTreeToggle`). A standalone `rt-tree` is built on
  this module, not beside it — law `reuse-first`.
- **The multiselect has no «Apply» footer** — a grep over `multiselect/` finds no apply, footer or
  confirm. Item 3 therefore becomes a mode of `rt-multiselect`, not a new component: its tree
  already exists.
- **Dragging** — CDK drag-drop is already used by the kit: the side-menu favorites and the table
  settings column list.
- **No breadcrumbs, carousel, colour palette, speed menu or in-place editing** in the kit — a grep
  over `docs/specs`, `docs/plans`, `docs/archive` and the kit sources found nothing on them.
- **Samples:** `the consumer's folders `rtui-tree`, `draggable-tree`, `common-tree-selector`, `common-hybrid-tree-selector`, `breadcrumb`, `editable-badge`, `text-input`, `speed-menu`, `color-palette`, `rtui-card-carousel``
  and the second consumer's folders `tree`, `draggable-tree`, `page-crumbs`; the paths to both live next to the handover, outside the index.

## What the rules already say

- A port from a consumer goes folder by folder, each with the owner's consent — given: «1-9 берем».
- Each port is shown on the showcase :6007 before its PR; the PR opens on the owner's «открывай».
- Where the kit already has an analogue, it is not ported again; the consumer's wish is done the way
  that does not break the second kit, and the divergence is named in the PR.
- A kit component carries its description next to it, stories covering every axis, snapshots and a
  spec scenario per rule.

## Questions and answers

**Does the task change the application's behaviour**
Question closed by assumption: yes — new components and modes of the second kit; each task gets a
product agreement in `docs/specs/ui-kit-v2/proposed/<feature>/`.

**Does it need an edit of a law or a rule**
Question closed by assumption: no.

**One task or several**
Closed by the owner: an epic, one task per item — nine.

**What is not part of the task**
Question closed by assumption: the consumers' code is not edited; their domain wrappers
(`common-assign-*`, `mdm/*`, hotel selectors) are not ported; no release of the package.

**What will show that the task is closed**
Question closed by assumption: per task — the component or mode is in the public entry, covered by
tests with scenario ids, shown by stories on :6007, snapshots taken, and the owner said «открывай».

**Is there a sample the approach is taken from**
Closed by the exploration: the consumer folders above; for the tree — also `option-tree` of the kit.

## Decisions

- **`rt-tree` stands on `rt-select-tree.ts`.** The pure tree module serves the select, the
  multiselect and `rt-tree`. Rejected: a second tree logic copied from the consumer.
- **Item 3 is a mode of `rt-multiselect`.** Rejected: a new `rt-tree-select` that would repeat the
  multiselect's tree.
- **Item 4 is decided inside its task after item 3:** a mode of the multiselect if the hybrid tree is a
  multiselect variant, or closed as covered.
- **No third-party packages enter the kit:** the palette draws its own swatches, the carousel scrolls
  natively, dragging takes CDK drag-drop already in the kit.

## What is left unclear

- Whether the speed menu (item 7) earns a place in the kit — the owner took it; its agreement names
  the consumer case, and the showcase review decides.
