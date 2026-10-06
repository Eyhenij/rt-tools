# Grill

## The owner request

> 1-9 берем заведи эпик и го делать пока 2426 на ревью

> открывай пр и что дальше?

Item 2 of the list the owner took: the application's draggable tree moves into the second kit as
`rt-draggable-tree`.

## What the tree already has

- `rt-tree` (RT-2548, PR #2568) — rows, levels, the open state, the keys and the row template over
  the shared select tree module `rt-select-tree.ts`. Spec `docs/specs/ui-kit-v2/tree/`.
- CDK drag-drop is used by the kit already: the side-menu favorites, the table settings panel, the
  data-list settings and the dynamic selector list.
- The application's sample: nodes `id / name / children / expanded`; a drag by a handle; a drop
  before, after or inside by the thirds of the row height; inside only into a node that has a
  `children` array; templates for a branch row, a leaf row and the empty tree; outputs with the
  whole tree after a drop and after a toggle. Its debts: it mutates the node objects, finds the
  drop target through `document`, keeps drop marks as classes set by hand, and has no keyboard.

## What the rules already say

- The epic plan: no third-party packages, dragging takes CDK drag-drop already in the kit.
- `reuse-first`: what the kit has is not written anew — rows and keys come from `rt-tree`'s module.
- `frontend-application`: no `document` reads from a component; state through signals.

## Questions and answers

**On what is `rt-draggable-tree` built?**
На модели rt-tree (Recommended)

**Is a node moved from the keyboard? The application has no such thing.**
Да (Recommended) — arrows walk the rows as in `rt-tree`; Alt+↑/↓ move a node among its siblings,
Alt+← takes it out of its branch, Alt+→ puts it into the branch above.

**Marks (checkboxes, radio) in the draggable tree?**
Нет (Recommended) — the tree only orders; the row takes the application's markup by a template,
a press is given by an event.

**Limits of a move?**
Плюс функция приложения (Recommended) — inside only into a branch, never into its own subtree, a
disabled node is not dragged; plus an optional `canDrop(node, target, place)` input for the
application's own bans.

## Decisions

- **The node is `IRtTree.Node`, and nodes are never mutated** — the owner's answer and the
  `rt-tree` rule. A move gives a new array through the two-way `nodes` and an event naming the node,
  the new parent and the index. Rejected: the application's `id / name` model — a second tree model
  in the kit.
- **The drop place is computed by a pure function from the row rectangle and the pointer** — thirds
  of the row as in the sample; tested without a browser. Rejected: `document.elementFromPoint` —
  a browser global in a component.
- **The keyboard moves are pure functions over the node array** — the same function the drop uses.

## What is left unclear

- Dragging between two trees — the sample has one tree; not asked, out of scope.

## Decisions along the way

- **The branch stands on `RT-2548-kit2-tree`** — the epic plan stacks the tree tasks; the PR goes
  into that branch's successor base once #2568 is merged.

- **All branches are open when the tree appears** — an order is judged seen whole; what the person
  folds stays folded, and a container a node was put into opens. Affected stage: 2.
- **The handle is decoration, the row moves by keys** — the handle has no label of its own, so no
  new kit label is started; Alt with an arrow is the way without a mouse. Affected stage: 2.
- **The row content has a gap** — the frame of the application markup showed the tag glued to
  the label; the content element got `--rt-space-sm` between its children. Affected stage: 3.

- **The open branches became the application's** — after the showing the owner asked whether the
  application moves to both trees without workarounds; the answer showed its tree keeps `expanded`
  on nodes and hears every fold. The owner chose «Закрыть всё в ките»: `open` is a two-way input,
  `null` keeps every branch open. The modes `rt-tree` lacks went to RT-2572, since #2568 was
  already merged. Affected stage: 3.
