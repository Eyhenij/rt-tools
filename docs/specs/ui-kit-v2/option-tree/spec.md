# A tree of options in a choice from a list

**Status:** in force · **Revision:** 2026-09-29 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/select` (the trigger and the panel of both families)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about options that have children: how the select and the multiselect
draw them, what a click and a key do in a tree, and how the filter finds a row inside it.

## Why

Both families that choose from a list draw every option in one flat column. A list of cities by
regions or of rooms by buildings then loses its shape: the person reads a hundred rows where the
application holds ten groups of ten. The mockup draws such a list as a tree — levels, arrows and,
at the multiselect, a parent checkbox that shows how much of the group is chosen.

## Terminology

- **A branch** — an option with at least one child.
- **A leaf** — an option without children.
- **A tree** — a list in which at least one option is a branch. A list without branches is flat.
- **A visible row** — an option whose every ancestor is open, or which the filter keeps.

### What it is called in the interface

| In the domain | On the screen                                       |
| ------------- | --------------------------------------------------- |
| A branch      | a group: a row with an arrow that opens more rows   |
| A leaf        | an ordinary row without an arrow                    |
| Partial state | a checkbox with a dash: some of the group is chosen |

## Rules

- **An option takes children of the same type, and a tree is recognised by the options themselves.**
  The option gets an optional `children` array; no input switches the tree on. A flat list draws and
  behaves exactly as before.

- **A row is indented by its level, one step of 24px per level.** The arrow of a child stands under
  the label of its parent. In a tree a leaf keeps an empty place where a branch has its arrow, so the
  labels of one level stand in one column. The step is the component's own property with
  `--rt-space-lg` as its default.

- **A branch shows an arrow, folded to the right or open downwards, and a click on the arrow opens or
  folds it.** The click on the arrow chooses nothing and does not close the panel.

- **In the select a click on the label chooses that option, a branch as well as a leaf.** The
  mockup says a click on the label chooses the option; the branch's value is a value like any other.

- **In the multiselect a click on a branch chooses every enabled leaf below it, or clears them when
  all are already chosen.** The branch's own value is never written: the value holds leaves only.
  The branch's checkbox is derived from its enabled leaves — on when all are chosen, partial when
  some are, off when none are.

- **The branches holding a chosen value are open when the list opens; the rest are folded.** A
  chosen row is then visible without a search.

- **The filter keeps a row whose label or a descendant's label matches, and shows the path to a match
  open.** A branch that matched by itself keeps its children folded as they were.

- **The keys move the highlight over visible rows, and the side arrows work the tree.** ArrowDown and
  ArrowUp skip disabled rows as before. ArrowRight opens a folded branch or moves to its first child
  when it is open. ArrowLeft folds an open branch or moves to the parent of a row. Enter chooses by
  the same rules as a click on the label.

- **A chip of the multiselect takes its label from the tree.** The label is looked up at any depth,
  not only in the top level.

## What is out of scope

- A tree in the autocomplete: the mockup draws none there.
- Loading children on demand: the options arrive whole.
- Choosing a branch's own value in the multiselect: the value holds leaves only.

## Contract

None: both families are layout components and serve no procedure. The tree is declared by the
`children` field of the options input.

### Refusal codes

Not applicable: a list with or without children is drawn; nothing is refused.

## Data

None of its own. Which branches are open lives while the panel is open and is not kept between
openings.

## Screens and states

| state                                 | what is drawn                                               |
| ------------------------------------- | ----------------------------------------------------------- |
| a flat list                           | the rows as before, without arrows and empty places         |
| a tree, the list just opened          | the top level, and open the branches holding a chosen value |
| a branch open                         | its children one step deeper, the arrow pointing down       |
| a multiselect branch with some leaves | the checkbox in its partial state                           |
| a tree filtered                       | the matching rows and the open path to each of them         |

## Cross-cutting requirements

### Locales

The labels of the rows are the consumer's. The arrow of a branch is named for a screen reader by
the kit's labels `uiExpand` and `uiCollapse`: English in the package, and in other languages by the
consumer's translator, like every label of the kit.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The tree changes nothing at any width: the panel grows to its content and the window bounds it.

### Several objects

Not applicable: the families belong to no owning entity.

## Decisions

- **The tree logic lives in one pure module shared by both families.** They flatten, look up and
  count the same way; two copies would drift.
- **The branch's checkbox in the multiselect is derived, not stored.** A stored parent value would
  disagree with its leaves the first time a leaf is cleared by its chip.

## Open questions

None.

## History of changes

- 2026-09-29 — written by the task RT-2369 of the epic RT-2370, which teaches both families a tree.
