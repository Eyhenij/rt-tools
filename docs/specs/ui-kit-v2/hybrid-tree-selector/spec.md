# A hybrid choice by a tree

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/tree` (the rows), `docs/specs/ui-kit-v2/tree-selector` (the panel)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about two components: `rt-hybrid-tree`, a tree in which some groups
keep one leaf, and `rt-hybrid-tree-selector`, the choice by a tree with search built on it.

## Why

The application holds a second tree selector next to the ordinary one. It is a copy of the ordinary
panel with another tree inside: in that tree a group may be marked so that one leaf of it is chosen
at a time. The field list of the report builder stands on it. The groups «This Year», «Last Year»
and «2 Years Ago» take one field each, the rest take any number.

The owner asked for two components, as in the application. They stay two components in the kit, and
they share the code of the ordinary tree and panel instead of copying it.

## Terminology

- **A single group** — a branch whose node carries `single: true`. Its leaves are radios.
- **A single leaf** — a direct leaf of a single group.
- **A free leaf** — any other leaf.
- **The choice**, **the draft**, **the confirming form**, **the exclusive click** — as in the tree
  selector.

### What it is called in the interface

| In the domain  | On the screen                                            |
| -------------- | -------------------------------------------------------- |
| A single leaf  | a radio in front of the label                            |
| A single group | a radio in front of the group label, filled while chosen |
| A chosen count | a number at the end of a group row without a mark        |

## Rules

- **The hybrid tree is `rt-tree` with single groups, and it draws no rows of its own.** The rows, the
  keys, the search marks, the badges and the row templates are the tree's.

- **A single group keeps one leaf.** Choosing a single leaf drops the other single leaves of its
  group; a click on the chosen one clears it. Leaves outside the group stay as they were.

- **The radio of a single group clears the group or chooses its first leaf.** While a leaf of the
  group is chosen, the radio clears every enabled leaf of the group. Otherwise it chooses the first
  enabled leaf.

- **Select-all and the cascade of a branch skip single leaves when they add.** When they clear, they
  clear the single leaves too. A branch is marked by its free leaves alone.

- **The exclusive click on a single leaf keeps the choice outside its group.** The click on a free
  leaf keeps that leaf alone, as in the tree.

- **A group without a mark shows the count of its chosen leaves.** The count stands at the end of the
  row and is hidden while nothing under the group is chosen.

- **The hybrid selector is the tree selector with the hybrid tree inside.** Every rule of
  `docs/specs/ui-kit-v2/tree-selector` holds for it, and the single groups reach the tree unchanged.

## What is out of scope

- The order of the choice by click and the domain groups of the report builder: the application
  builds the nodes and keeps the order.
- A single group inside a single group: the inner group is drawn as an ordinary branch.

## Contract

None: both are layout components and serve no procedure. Their inputs and outputs are listed on
their showcase overview pages, and the docs guard keeps those tables matched to the code.

The hybrid tree takes the inputs of `rt-tree`; the hybrid selector takes the inputs of
`rt-tree-selector`. The node type is `IRtHybridTree.Node`, the tree node with `single`.

### Refusal codes

Not applicable: a component of the kit throws no refusals.

## Data

The nodes are `IRtHybridTree.Node<TValue>`. The choice lives with the application through `value`.

## Screens and states

| State                          | What is seen                                           |
| ------------------------------ | ------------------------------------------------------ |
| a single group, nothing chosen | an empty radio at the group and at each leaf           |
| a single group, a leaf chosen  | the group radio and that leaf radio filled             |
| groups without marks           | the count of chosen leaves at the end of a group row   |
| select-all chosen              | every free leaf ticked, the single groups as they were |

## Cross-cutting requirements

### Locales

The hybrid tree adds no label; the selector takes the labels of the tree selector.

### SEO

Not applicable: a component of a published kit.

### Mobile layout

The same as the tree and the tree selector.

### Several objects

Not applicable.

## Decisions

- **Two components, because the owner asked for them.** The application keeps a copy of its panel
  for the second tree, and the owner kept that shape: «Разные компоненты делай».
- **The new components inherit the tree and the selector.** A copy of the keys, the search and the
  panel would drift from the original at the first fix.
- **The single leaves never fill by select-all.** A whole group of one-at-a-time fields cannot be
  chosen at once, and the application skips them the same way.

## Open questions

None.

## History of changes

- 2026-10-07 — the agreement written for RT-2551.
