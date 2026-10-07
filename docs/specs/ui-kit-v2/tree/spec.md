# A tree of choice

**Status:** in force · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/option-tree` (the tree logic shared with the select and the multiselect)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-tree`: a tree of nodes standing on the page by itself, not
inside a dropdown. It shows levels, opens and folds branches, and lets a person choose nodes with
checkboxes, with a radio, or not at all.

## Why

Applications that install the kit hold their own selection trees: a panel choosing hotels by chains,
a panel choosing records of a directory by groups. Each draws, opens and counts its tree itself, and
each carries the same defects — the expansion kept in markup classes, the node objects changed in
place, a checkbox nested inside the row button. The kit already counts a tree for the select and the
multiselect; a standalone tree on the same logic gives the applications one look and one keyboard.

## Terminology

- **A node** — one entry of the tree: a label, a value and, optionally, children of the same type.
- **A branch** — a node with at least one child. **A leaf** — a node without children.
- **The choice** — the set of chosen values the tree holds in its `value`.
- **A cascade** — choosing a branch chooses every enabled leaf under it; the branch's own mark is
  derived from its leaves.
- **The highlight** — the row the arrow keys stand on. It is neither the focus nor the choice.

### What it is called in the interface

| In the domain | On the screen                                       |
| ------------- | --------------------------------------------------- |
| A branch      | a group: a row with an arrow that opens more rows   |
| A leaf        | an ordinary row without an arrow                    |
| Partial state | a checkbox with a dash: some of the group is chosen |
| Select all    | a row above the tree with its own checkbox          |

## Rules

- **A node takes the shape of a select option, and a tree is counted by the same module.** The node
  type extends the option of the select with an optional description; rows, leaves, branch marks,
  the filter and the side keys are the functions the select and the multiselect already use.
- **The choice lives in `value`, and the nodes are never changed.** The tree holds the chosen values as
  a two-way bound array; a click produces a new array, the node objects passed in stay as they were.
- **In the cascade the choice holds leaves only, and a branch's mark is derived from them.** A click on
  a branch chooses every enabled leaf below it, or clears them when all are chosen already; the branch
  shows a tick, a dash or nothing by how many of its leaves are chosen.
- **Without the cascade a click changes only the clicked node.** The choice may then hold a branch
  value, and a branch shows its own mark, not one derived from its children.
- **In the single mode a node is chosen alone, and a click on a chosen one keeps it.** The mark is a
  radio; choosing a node drops the previous one.
- **In the mode without marks a click only picks.** No checkbox and no radio are drawn; a click on a
  leaf emits `picked`, a click on a branch opens or folds it.
- **A disabled node keeps its state through every change, select-all included.** It is drawn muted,
  takes no click, and no bulk action flips it.
- **A disabled tree changes nothing in the choice.** Clicks, keys and select-all leave the choice as
  it was, every row is drawn muted, and the tree takes no focus. The branch arrows still open and
  fold: looking is not changing.
- **The branches holding a chosen value are open when the tree appears; the rest are folded.** After
  that, opening and folding belong to the person and to the public `expandAll` and `collapseAll`.
- **Choosing never opens or folds a branch.** A mark on a row, by a click, a key or select-all, leaves
  every branch as open as it was before it.
- **A mark is drawn by the kit's own checkbox and radio.** They stand inert in the row: the row takes
  the click and the keys, and the control only shows the mark.
- **A cut label or description shows its whole text in the kit's tooltip.** The tooltip runs in the
  mode for a cut text, so a label that fits shows none.
- **The search term filters the tree and marks the match in the label.** A row stays when its label or
  a descendant's label holds the term, the path to a match is shown open, and the matched part of a
  label is drawn with the highlight tokens of the side-menu search.
- **Every word of the search term is marked, in the label, the description and the badges.** The
  application splits its search on spaces, so a word found anywhere in the row is drawn with the same
  highlight; a word inside an already marked part does not cut it again.
- **A plain click chooses the clicked node alone when the tree is exclusive.** In the multiple mode
  with `exclusive`, a click, Space or Enter keeps of the choice only what the clicked node covers and
  the disabled nodes, then works as an ordinary click: a second click on the only chosen node clears
  it. A click with Ctrl or Cmd adds or removes as in the ordinary mode.
- **The keys walk the visible rows, and the side arrows work the tree.** ArrowDown and ArrowUp move the
  highlight, ArrowRight opens a folded branch or steps to the first child, ArrowLeft folds an open
  branch or steps to the parent; Space toggles the mark of the highlighted node and Enter picks it.
- **A key the tree does not use is not consumed.** `handleKeydown` answers whether it took the key, so
  an application can pass every key from its own search field and typing there keeps working.
- **Select-all chooses every enabled leaf of the visible rows, or clears them.** It is drawn only when
  asked for and only in the cascade with checkboxes.
- **Groups may go without a mark, and then a click on a group opens it.** With `branchMarks` off,
  branch rows draw no checkbox or radio; a click, Space and Enter on such a row open or fold it, and
  the choice is made on the leaves. Select-all still chooses the leaves.
- **The search may only mark, leaving the rows to the application.** With `filter` off, the term
  hides no row and opens no path; it marks the words where they stand.
- **A node's badges stand under its label as kit tags.** Each badge of the node is a small `rt-tag`
  of its palette, and the search words are marked in it as in the label.
- **A row takes the application's content under its label too.** A template marked by
  `rtTreeNodeMeta` is drawn in the line of the badges with the node in its context.
- **A row takes the application's content at its end.** A template marked by `rtTreeNodeEnd` is drawn
  at the end of every row with the node in its context; the tree adds no input per such control.
- **An empty tree says so.** With no rows the tree shows the kit label for nothing found when a term is
  set, and for no options otherwise.

## What is out of scope

- Reordering nodes by dragging — `rt-draggable-tree`, its own task.
- A tree inside a dropdown — the select and the multiselect already have one.
- Loading children on demand: the tree draws what it was given.
- Badges as a part of the node model: an application draws them through the row template.

## Contract

None: `rt-tree` is a layout component and serves no procedure. Its inputs and outputs are
listed on its showcase overview page, and the docs guard keeps that table matched to the code.

Public methods: `handleKeydown(event)`, `expandAll()`, `collapseAll()`, `clearHighlight()`.
The row template is marked by the `rtTreeNodeEnd` directive.

### Refusal codes

Not applicable: a component of the kit throws no refusals.

## Data

`IRtTree.Node<TValue>` is `IRtSelect.Option<TValue>` with an optional `description` and children of
its own type. The state of the tree — the set of open branches and the highlighted value — lives in
the component; the choice lives with the application through `value`.

## Screens and states

| State                  | What is seen                                                |
| ---------------------- | ----------------------------------------------------------- |
| folded                 | the top level, every branch with an arrow to the right      |
| a branch open          | its children indented one step of 24px                      |
| a branch partly chosen | its checkbox with a dash                                    |
| single mode            | radios instead of checkboxes                                |
| no marks               | labels only                                                 |
| a node disabled        | the row muted, its mark unchangeable                        |
| the tree disabled      | every row and select-all muted, the arrows still open       |
| a search term          | the matching rows with the path open, the match highlighted |
| empty                  | the kit label «Nothing found» or «No options»               |
| a row highlighted      | the row background of the active option of the select       |

## Cross-cutting requirements

### Locales

The labels of the tree — select all, expand, collapse, nothing found, no options — are kit labels
taken through the label token; the node texts are the application's.

### SEO

Not applicable: a component of a published kit.

### Mobile layout

On a narrow screen the rows keep the same indent step and grow to the touch height of the kit rows;
the tree scrolls inside its container.

### Several objects

Not applicable.

## Decisions

- **The tree is counted by the module of the select, not by a copy of the application's code.** The
  application's tree changed nodes in place and kept expansion in markup classes; the kit module
  already counts rows, marks and keys over immutable options.

## Open questions

None.

## History of changes

- 2026-10-06 — the agreement written for RT-2548.
- 2026-10-07 — a disabled tree, for the report builder of the application; RT-2551.
