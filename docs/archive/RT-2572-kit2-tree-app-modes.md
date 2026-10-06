# Grill

## The owner request

> я смогу потом в апке использовать дерево и драгабле дерево в апке без костылей простая миграция?

Asked while looking at RT-2549's showcase. The answer listed what `rt-tree` lacks for the
application; the owner chose «Закрыть всё в ките (Recommended)». PR #2568 of `rt-tree` was already
merged into the epic branch, so the `rt-tree` part became this task.

## What the tree already has

- `rt-tree` — `projects/ui-kit-v2/src/lib/components/tree/`, spec `docs/specs/ui-kit-v2/tree/`:
  modes multiple, single and none; cascade; `searchTerm` that filters and marks; select-all row;
  keys; `expandAll`, `collapseAll`, `clearHighlight`, `handleKeydown`; a row end slot
  `rtTreeNodeEnd`.
- `rt-tag` — `projects/ui-kit-v2/src/lib/components/tag/`, spec `docs/specs/ui-kit-v2/tag/`: a pill
  with a label, a palette, sizes; no search marks.
- `splitSideMenuTitle` — the cut of a text by one search term, used by the side menu and `rt-tree`.

## How the application calls its tree

Four call sites, read by a research pass over the application:

- The hotel panel and the popup selector pass `isListsSelectorsShown = inputType === Checkbox` and
  `isMultiselectMod` starting false: groups without a checkbox open on a click, a plain click
  chooses one node, Ctrl or Cmd adds. Search words split on spaces go to `searchTerms`; the host
  filters the rows itself, also by badge text, and the tree only marks.
- The hotel access tree passes `isSelectionCascaded = false`, a control template at the row end and
  a meta template after the badges.
- Badges `{ text, variant }` stand under the name, cut by the search words.
- `isItemsSelectorsShown` is passed by no host; `info` is `''` almost everywhere.

## Questions and answers

**Close in the kit everything the application lacks, or only the dragged tree?**
Закрыть всё в ките (Recommended)

## Decisions

- **Groups without a mark: `branchMarks = false`** — a click, Space and Enter on a group open or
  fold it; leaves keep their marks; select-all still chooses leaves. Rejected: a per-level mark
  input for leaves too — no host hides leaf marks.
- **A plain click chooses one node: `exclusive`** — in the multiple mode a click, Space or Enter
  keeps only what the clicked node covers, plus the disabled chosen; Ctrl or Cmd with the click adds
  or removes as before. Both modifier keys count on every system, so no platform input. Rejected:
  `isMacOS` — the kit reads the event, not the system.
- **A second slot under the label: `rtTreeNodeMeta`** — the application's meta line, next to the
  badges. The end slot stays.
- **Node badges with search marks** — `badges` on the node, drawn by `rt-tag` of the small step;
  `rt-tag` gains a `highlight` input that marks the matched words the same way as the tree label.
  Rejected: the tree drawing its own pills — the kit has a tag.
- **Search that only marks: `filter = false`** — the rows stay as the application passed them; the
  term marks the label, the description and the badges.
- **Every word of the term is marked** — the application splits the search on spaces; the tree
  marks each word and filters by the whole term as before.
- **The choice stays in `value`** — the kit's rule that nodes are never changed; the application
  moves from `checked` on nodes to `value` itself.

## What is left unclear

- Text `info` at the row end and hidden leaf marks — no host uses them; the end slot covers `info`.

## Decisions along the way

- **The branch stands on the epic branch, not on RT-2549** — `rt-tree` does not depend on the
  dragged tree, and #2568 is merged there.
- **The word cut lives next to the side-menu cut** — `rt-tag` needs it too, and an atom does not
  import an organism. Affected stage: 1.
- **The filter reads the label only, the marks read the badges too** — a word found only in a badge
  hides the row while `filter` is on; an application searching by badges turns `filter` off and
  filters itself, as it does today. Affected stage: 3.
