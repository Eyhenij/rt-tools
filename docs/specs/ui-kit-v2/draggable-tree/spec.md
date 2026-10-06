# A tree ordered by dragging

**Status:** in force · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/tree` (the node, the rows and the open state of `rt-tree`)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-draggable-tree`: a tree whose nodes a person reorders — by
dragging a row before, after or inside another one, or by keys. It marks nothing and chooses nothing;
it hands the application a new order of the same nodes.

## Why

Applications that install the kit order their own trees by hand: report folders, menu sections. Their
tree changes the node objects in place, looks for the drop target through the whole document and
cannot be ordered without a mouse. The kit has a tree already; a draggable one on the same node and
the same rows gives the applications one look, one keyboard and an order they can compare.

## Terminology

- **A node, a branch, a leaf** — as in `rt-tree`.
- **A container** — a node with a `children` array, even an empty one: it can take nodes inside. A
  node without that array is a leaf for a drop and takes none.
- **A drop place** — `before` or `after` a target row, or `inside` a target container.
- **A move** — one node taken from its place and put to a drop place; its subtree goes with it.

### What it is called in the interface

| In the domain | On the screen                                             |
| ------------- | --------------------------------------------------------- |
| A move        | a row dragged by its handle, or moved by Alt and an arrow |
| A drop place  | a line above or below the target row, or the row outlined |

## Rules

- **A node is the node of `rt-tree`, and the rows are counted by the same module.** Levels, the
  open state, the arrow and the indent are those of `rt-tree`.
- **A move gives a new array, and the nodes passed in are never changed.** The tree takes the order
  through the two-way `nodes`; after a move it writes a new array and emits `moved` with the node,
  the new parent and the index among the new siblings.
- **The drop place is read from the row under the pointer by thirds of its height.** The top third
  is `before`, the bottom third is `after`, the middle is `inside`.
- **Only a container takes a node inside.** The middle third of a leaf offers no drop place.
- **A node never goes into its own subtree.** Such a place is offered nowhere, neither by the
  pointer nor by a key.
- **A disabled node is not moved.** Its row has no handle and its keys move nothing; it stays a
  target.
- **The application may ban a place by `canDrop`.** The function gets the node, the target and the
  place; `false` means the place is not offered.
- **Alt with ArrowUp or ArrowDown moves a node among its siblings.** At the edge of its list it stays.
- **Alt with ArrowLeft takes a node out of its branch to stand right after it; Alt with ArrowRight
  puts it last into the container right above it.** A top-level node has nowhere to go left; a node
  with no container right above it has nowhere to go right.
- **The keys without Alt walk the rows as in `rt-tree`.** ArrowUp and ArrowDown move the highlight,
  ArrowRight and ArrowLeft open and fold, Enter emits `picked`.
- **A row takes the application's markup by a template.** Without it the row shows the label.
- **An empty tree shows the kit label for no options.**

## What is out of scope

- Marks and a choice: the owner's answer «Нет» — the tree only orders.
- Dragging between two trees.
- A search term.

## Contract

None: `rt-draggable-tree` is a layout component and serves no procedure. Its inputs and outputs are
listed on its showcase overview page, and the docs guard keeps that table matched to the code.

### Refusal codes

Not applicable: a component of the kit throws no refusals.

## Data

`IRtTree.Node<TValue>` of `rt-tree`. The open branches and the highlighted value live in the
component; the order lives with the application through `nodes`.

## Screens and states

| State                 | What is seen                                         |
| --------------------- | ---------------------------------------------------- |
| at rest               | rows with a handle at the start and the branch arrow |
| a row dragged         | the row follows the pointer, its place stays empty   |
| a place before, after | a line across the target row's top or bottom edge    |
| a place inside        | the target row outlined                              |
| a node disabled       | the row muted, no handle                             |
| empty                 | the kit label «No options»                           |

## Cross-cutting requirements

### Locales

The labels of the tree — the handle, expand, collapse, no options — are kit labels taken through the
label token; the node texts are the application's.

### SEO

Not applicable: a component of a published kit.

### Mobile layout

The rows grow to the touch height of the kit rows; the handle is dragged by a finger the same way.

### Several objects

Not applicable.

## Decisions

- **The drop place is a pure function of the row box and the pointer.** The application's tree read
  the document under the pointer and hung marks on rows by hand; a function of two numbers is
  tested without a browser, and the mark is a state of the component.

## Open questions

None.

## History of changes

- 2026-10-06 — the agreement written for RT-2549.
