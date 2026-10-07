# A choice by a tree with search

**Status:** in force · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/tree` (the tree drawn inside)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-tree-selector`: a search field, a row of controls and a tree
of choice under them, with the choice applied at once or kept as a draft until «Apply». The
component stands on the page, in a side panel or in a popover; where it stands is the
application's decision.

## Why

The application holds its own tree selector: a search field, expand-all and collapse-all, a clear
button, select-all, a multi-selection toggle, the tree and an optional footer with Cancel and Apply.
Seven directory screens draw it inline, and the hotel panel of the page header draws the same
content in a side panel with Submit. Every copy carries the same faults: the node objects changed in
place, the expansion delayed by timers, the «nothing changed» flag computed and bound nowhere.

The kit already has the tree with search marks, select-all and keys. The selector puts the search
field and the controls on top of it, so the application moves without its own copy.

## Terminology

- **The choice** — the applied value the selector holds in `value`.
- **The draft** — the choice being edited before «Apply» in the confirming form. It starts equal to
  the choice every time the selector appears or the choice changes from outside.
- **The confirming form** — the draft lives until «Apply» or «Cancel». **The direct form** — every
  change is written to the choice at once.
- **The exclusive click** — a plain click keeps one node; Ctrl or Cmd with a click adds.

### What it is called in the interface

| In the domain       | On the screen                                             |
| ------------------- | --------------------------------------------------------- |
| The search field    | a field with a magnifier and a cross, «Search»            |
| Expand and collapse | two icon buttons «Expand all» and «Collapse all»          |
| Clear               | a trash can icon «Clear selection»                        |
| Revert              | a back arrow icon «Revert selection»                      |
| The multi toggle    | a switch «Multiple selection» with a hint about Ctrl or ⌘ |
| Apply and Cancel    | «Apply» and «Cancel» in the footer                        |

## Rules

- **The tree inside is `rt-tree`, and the selector draws no rows of its own.** Marks, cascade,
  select-all, badges, the keys and the highlight are the tree's; the selector passes its inputs on.

- **The search field keeps the focus and hands every key to the tree.** The arrows, Space, Enter and
  the side arrows walk the tree while the field keeps the text; a key the tree does not take types as
  usual. The field takes the focus when the selector appears.

- **The search keeps the nodes in which every typed word is found, and marks the words.** A word is
  looked for in the label, the description and the badges, without case. A branch that matches keeps
  its whole subtree; a branch with a matching node below it stays as its path. While a term is typed
  every kept branch is open. The line starts from `searchTerm`, so a rebuilt tree keeps its search.

- **Expand-all and collapse-all open and fold every branch of the tree.** They are icon buttons drawn
  only when asked for by `expandControls`, and they stand while the tree has rows.

- **Clear empties the choice except the disabled chosen nodes.** It is an icon button with a trash
  can, drawn only when asked for and only while something is chosen.

- **Revert returns the draft to the choice without closing the selector.** It is an icon button drawn
  only when asked for by `revertable`. It stands in the confirming form alone: in the direct form
  the choice is already written. It is off while the draft equals the choice.

- **The multi toggle switches the exclusive click off and on.** With the toggle off a plain click
  keeps one node and Ctrl or Cmd adds; with it on a click adds. The toggle is drawn only when asked
  for; without it the click adds.

- **The application's own controls stand in the row of the selector.** A template marked by
  `rtTreeSelectorControls` is pressed to the right end of the row. The selector's own buttons stand
  at the left end; the hotel grouping is one such control.

- **In the direct form every change is written to the choice at once.** A click, a key, select-all and
  clear write `value` with a new array.

- **In the confirming form the changes go to the draft, and «Apply» writes it to the choice.** «Apply»
  emits `applied` with the new choice; «Cancel» drops the draft back to the choice and emits
  `cancelled`.

- **«Apply» is off while the draft equals the choice, and while it is empty where an empty choice is
  not allowed.** The order of values does not count. `canApply` tells the application the same, for a
  side panel that draws its own buttons.

- **The footer belongs to the selector only when asked for.** Without the footer the application
  calls `apply()` and `cancel()` from its own buttons.

- **In the single mode of the confirming form Enter on a node applies.** Enter chooses the
  highlighted node; then the draft is applied if «Apply» is on, and `cancelled` is emitted if it is
  not — picking the node already chosen changes nothing.

- **A disabled selector changes nothing in the choice.** The search field, the control buttons, the
  multi toggle, the tree and the footer are off, and `canApply` is false. The selector takes no
  focus on appearance.

- **On appearance the branches over the choice are open, or all of them, or none.** `expandOnStart`
  takes `chosen`, `all` or `none`; `chosen` is the default.

## What is out of scope

- The trigger that opens the selector: the application opens it in `rt-aside` or `rt-popover`.
- The hotel groupings and any domain data: the application builds the nodes.
- Row templates of the tree at the end of a row and under its label: the selector does not pass them
  on yet.

## Contract

None: `rt-tree-selector` is a layout component and serves no procedure. Its inputs and outputs are
listed on its showcase overview page, and the docs guard keeps that table matched to the code.

Public members: `canApply`, `apply()`, `cancel()`. The controls template is marked by the
`rtTreeSelectorControls` directive.

### Refusal codes

Not applicable: a component of the kit throws no refusals.

## Data

The nodes are `IRtTree.Node<TValue>`. The choice lives with the application through `value`; the
draft, the search line and the multi toggle live in the component.

## Screens and states

| State                      | What is seen                                                |
| -------------------------- | ----------------------------------------------------------- |
| direct form                | the search field, the controls and the tree, no footer      |
| confirming form, unchanged | the footer with «Apply» off                                 |
| confirming form, changed   | «Apply» on                                                  |
| a search term              | the matching nodes with every branch open, the words marked |
| nothing found              | the controls row stays, the tree says «Nothing found»       |
| single mode                | radios, no select-all, no multi toggle                      |
| the application's control  | its template at the right end of the row                    |

## Cross-cutting requirements

### Locales

Every label of the selector — search, expand all, collapse all, clear, revert, multiple selection
and its hint, apply, cancel — is a kit label taken through the label token. The kit carries the English set; the application
gives its own language through the translator.

### SEO

Not applicable: a component of a published kit.

### Mobile layout

The controls wrap onto a second line on a narrow screen; the tree scrolls inside the selector, and
the search field and the footer stay in place.

### Several objects

Not applicable.

## Decisions

- **The selector stands on `rt-tree`, not on the application's tree.** The application's tree changed
  the nodes in place and kept the expansion in classes; `rt-tree` already does the marks, the keys
  and the search marks the application relies on.
- **The search is done by the selector, by every word.** The tree filters by the whole term as one
  substring; the application's panels keep a node only when every typed word is in it.
- **«Apply» off when nothing changed is a rule here.** The application computed that flag and bound it
  nowhere, so its «Apply» sent an unchanged choice.

## Open questions

None.

## History of changes

- 2026-10-06 — the agreement written for RT-2550.
- 2026-10-07 — a disabled selector, for the report builder of the application; RT-2551.
- 2026-10-06 — expand-all and collapse-all became optional icon buttons by the owner's word. Clear
  became an icon button with a trash can, and an optional revert button was added.
