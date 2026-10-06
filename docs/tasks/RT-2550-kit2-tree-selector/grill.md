# Grill

## The owner request

> 1-9 берем заведи эпик и го делать пока 2426 на ревью

Item 3 of the epic list: the application's choice by a tree with an «Apply» button. The epic plan
decided it as a mode of `rt-multiselect`, not a new component.

## What the tree already has

- `rt-multiselect` — `projects/ui-kit-v2/src/lib/components/multiselect/`: a field-shaped trigger
  with chips, a popover panel, a flat list or a tree of options from `rt-select-tree.ts`. Each click
  writes the value at once; no search, no footer, no select-all, no expand-all.
- `rt-tree` — `projects/ui-kit-v2/src/lib/components/tree/`, after RT-2572: search with marks by
  words, select-all row, `expandAll`/`collapseAll`, `exclusive` click with Ctrl or Cmd, groups
  without a checkbox, badges, node meta and row-end templates.
- Labels `uiApply` and `uiCancel` exist in the kit's label set.

## How the application calls its tree with «Apply»

Read in the application's common components before the grill:

- The selector is a pill button with a label and a tooltip; it opens an overlay with a transparent
  backdrop. Backdrop click and Escape close it without applying.
- The popup holds:
    - a search field with a clear cross;
    - expand-all and collapse-all buttons;
    - a clear-selection button;
    - a «Multi selection» toggle with a Ctrl or Cmd hint;
    - a «Select All» checkbox;
    - the application's tree with the modes RT-2572 brought into `rt-tree`;
    - a footer with Cancel and Apply.
- The choice is kept inside the popup and leaves only by Apply as a list of leaf ids. Apply is off
  while the choice equals the starting one, and also when it is empty and an empty choice is not
  allowed.
- Inputs: nodes, starting ids, input type (checkbox or radio), empty choice allowed, multi toggle
  shown, multi by default, disabled, footer shown, clear button shown, label, search marks.

A research pass over every call site found that **no live screen of the application opens the
popup with «Apply»**:

- The trigger with the overlay is used by one wrapper, and that wrapper stands in no template.
- Four more selector popups with the footer are exported and stand in no template either.
- Every live use draws the tree inline, without the footer, and writes each click at once. These
  are six data-directory wrappers, the filters aside, the report assignment and the hybrid tree.
- In the popup «Apply» is off only by `disabled`: the «nothing changed» flag is computed and bound
  nowhere.
- The labels are hard-coded English; the trigger shows «first name + N selected», not chips.

What the live screens use is `rt-tree` after RT-2572 plus a toolbar above it: a search field,
expand-all and collapse-all, clear, select-all.

## The hotel selector — the live choice by a tree with confirmation

Pointed to by the owner: «Посмотри селектор отелей с деревом внутри, конкретизируй вопрос». Its
own agreement lives in the application, `docs/specs/hotels-selector/spec.md`.

- A pill in the page header with an icon and «N Hotels selected» opens a side panel «Select
  Hotels»; seven sections place it.
- The panel holds a search field that keeps the focus and hands the keys to the tree. Under it
  stand «Expand all», «Collapse all» and a «Group by» pill with six layouts; the second row holds
  «Select All» and the «Multi selection» toggle with the Ctrl or Cmd hint. Then the tree of groups
  and hotels.
- The footer «Submit» and «Cancel» belongs to the side panel. «Submit» is off while the choice
  equals the starting one, and while it is empty where an empty choice is not allowed.
- The single-hotel form uses radios; Enter on a hotel applies and closes. Escape closes without
  changes.

So the confirmation lives in a side panel, not in a dropdown: the epic plan's «mode of
`rt-multiselect`» does not match it.

## What the rules already say

- `reuse-first`: what the kit has ready is not written anew — the tree with search is `rt-tree`.
- The kit already has a draft with «Применить»: `docs/specs/ui-kit-v2/date-range/spec.md` and
  `docs/specs/ui-kit-v2/date-panel/spec.md`. The panel keeps a draft, «Применить» writes the value
  and closes, closing drops the draft. The multiselect mode takes the same behaviour, no question.
- The epic plan: «Выбор деревом с кнопкой «Применить» — режим `rt-multiselect`, а не новый
  компонент».

## Questions and answers

**What does the task do with the «Apply» popup no live screen opens?**
«Посмотри селектор отелей с деревом внутри, конкретизируй вопрос»

**The hotel selector is a side panel; what does the task do?**
«При чем здесь rt multiselect работа по переносу компоненто в кит????»

## Decisions

- **The task ports the application's tree selector into the kit as `rt-tree-selector`** — the
  owner: the epic moves components into the kit, and `rt-multiselect` has nothing to do with it.
  Rejected: a confirmation mode of `rt-multiselect` — no screen of the application opens a dropdown
  with «Apply», and the live selector is a side panel.
- **What is ported** — the content of the application's generic tree selector popup: a search
  field that keeps the focus and hands the keys to the tree, expand-all and collapse-all, a clear
  button, select-all, the multi-selection toggle with the Ctrl or Cmd hint, a slot for the
  application's own controls, the tree itself, and an optional footer with Cancel and Apply. The
  hotel panel is the same content inside the side panel plus «Group by» in the slot.
- **The choice is a draft until Apply** — the same as the date range of the kit. Apply is off while
  the draft equals the starting choice, and while it is empty where an empty choice is not allowed:
  the application computes this and binds it nowhere.
- **The tree is `rt-tree` after RT-2572**, not a copy of the application's tree.
- **The trigger with an overlay is not ported** — no live screen uses it; the side panel is opened
  by the application with `rt-aside`.
- **The hotel groupings stay in the application** — they are its domain.

## What is left unclear
