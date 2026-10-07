# Grill

## The owner request

> 1-9 берем заведи эпик и го делать пока 2426 на ревью

Item 4 of the epic list: the application's hybrid choice by a tree. The task card was written before
the owner turned the epic into ports, and asks to sort it against `rt-multiselect`.

> Продолжай

Said after RT-2550 was shown; RT-2550 waits for «открывай», so the next task of the epic is taken.

## What the tree already has

- `rt-tree-selector` from RT-2550 — `projects/ui-kit-v2/src/lib/components/tree-selector/`: search
  by every word, optional icon buttons, multi toggle, the application's controls on the right, a
  draft with «Apply», revert.
- `rt-tree` — `projects/ui-kit-v2/src/lib/components/tree/`: marks, cascade, select-all, groups
  without a mark, the exclusive click, keys, badges, row-end templates.
- The pure modules both stand on: `rt-select-tree.ts` (rows, open set, side keys) and
  `rt-tree.logic.ts` (marks, choosing, select-all, label parts).

## How the application calls its hybrid tree

Read in the application's common components:

- `cc-hybrid-tree-selector-popup` is a copy of `cc-tree-selector-popup`. Its own context file
  names it «the `cc-tree-selector-popup` variant built on `cc-hybrid-tree`». The panel is the same:
  search, expand-all and collapse-all, clear, multi toggle with the Ctrl or Cmd hint, select-all,
  the tree, the footer.
- `cc-hybrid-tree` differs from the ordinary tree by one thing: a node flag `singleSelect`. The
  leaves of such a group are radios: choosing one drops the other leaves of the same group, a click
  on the chosen one clears it. Leaves outside the group are not touched.
- The group's own radio clears the group when something in it is chosen, and chooses its first
  enabled leaf otherwise.
- Select-all skips the leaves of single groups and clears them on «deselect all».
- With group marks hidden, a group shows the count of its chosen leaves.
- One screen calls it: the field list of the report builder. The groups «This Year», «Last Year»
  and «2 Years Ago» take one field each, the rest take any number. Groups are not selectable, and
  select-all is hidden there.
- The ordinary popup is called by 27 places, the hybrid one by that one place.

## Questions and answers

**How is the hybrid choice ported — a node flag in the kit tree or a separate component?**
«Переформулировать не понимаю вопрос»

**Asked again on the report builder's field list.**
«А как в апке это разные компоненты?»

Answered: yes, two components, the second a copy of the first with another tree inside.
«Разные компоненты делай»

## Decisions

- **Two components, as in the application: `rt-hybrid-tree` and `rt-hybrid-tree-selector`** — the
  owner: «Разные компоненты делай». Rejected: a node flag inside `rt-tree` and `rt-tree-selector`.
- **They are separate components, not separate copies of the logic.** `rt-hybrid-tree` stands on
  the same pure modules as `rt-tree` and adds only the single-group rules; `rt-hybrid-tree-selector`
  shares the panel code with `rt-tree-selector` through a common base class, so a fix of the panel
  reaches both. The law `reuse-first` asks for it, and the owner's word is about the components.
- **A single group is marked on the node, `single: true`.** Its leaves are radios inside the group.
- **Select-all skips the leaves of single groups**, and a group with marks off shows the count of
  its chosen leaves — both from the application's tree.
- **Question closed by assumption: the task changes the kit's behaviour** — two new components; the
  agreement is written as a spec of its own.
- **Question closed by assumption: no law or rule is edited.**
- **Question closed by assumption: one task.** The tree and its selector roll back together.
- **Question closed by assumption: the sample is the application's hybrid tree and RT-2550.**
- **What will show the task is closed:** both components exported, their scenarios covered by
  tests, the showcase with overview and matrices, the owner saw it and said «открывай».

## What is left unclear

Nothing.

## Decisions along the way

- **The new components inherit, they do not copy** — `rt-hybrid-tree` extends `RtTreeComponent` and
  takes its template and styles; the tree opens four protected points of the choice. The hybrid
  selector extends `RtTreeSelectorComponent`, and the selector template draws the hybrid tree by
  the `hybrid` flag. Affected stage: 1.

- **The select-all mark stands above the first row's mark, and Clear is outlined and red** — the
  owner after looking at the stories: «Чекбокс Выбратьвсе должен быть над первым чекбоксом списка
  если там есть чекбокс у группы или на шевроном как сечас если чекбокса группы нет». Done in this
  branch, since RT-2550 waits for the same «открывай». Affected stage: 3.

- **Select-all is optional and sticky** — the owner: «Выбрать все должен быть стики и опциональным».
  `selectAll` of the selector is off by default like the buttons of the row. The row sticks to the
  top of the scrolling place, so the tree and the selector got their own surface background.
  Otherwise the sticky row stood as a white strip on the page. Affected stage: 3.

- **Both selectors and both trees get `disabled`** — the owner on the migration of the report
  builder: «в этой задаче добавь чего не хватает». The application's own `disabled` greys only
  select-all and Submit, and its rows stay clickable; the kit switches off the search, the buttons,
  select-all and the rows. Affected stage: 1–3.

The decisions above live in the agreements `docs/specs/ui-kit-v2/hybrid-tree-selector/spec.md`, `docs/specs/ui-kit-v2/tree-selector/spec.md` and `docs/specs/ui-kit-v2/tree/spec.md`, and the choice of two components in the epic plan.
