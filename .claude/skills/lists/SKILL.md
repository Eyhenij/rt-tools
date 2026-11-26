---
name: lists
kind: rule
law: lists
description: Rule under the lists law. Load when editing a list screen (libs/admin/*/feature/list), the kit table and pagination. Names the order of blocks, what the list is assembled from, where the query lives and what the kit already has. Ready-made screen code is in pattern admin-lists-screen.
---
<!-- rt-kit v0.41.1 · rules/lists.md · 9bc7f315a5d9 · правится надстройкой, не здесь -->

# List screen — how it works here

Rule under the law `docs/constitution/lists.md`. Cold part: `pitfalls.md`.

## How the law applies here

- **The page is assembled by the shared list-page component, not by markup of its own.**
- **The screen mechanics come from the shared list-screen base, not written anew.**
- **The screen declares the table itself and puts it inside the template.**
- **The list is assembled by `<prefix>-table`, not by markup of its own.** It is `rt-table` with
  `[dataSource]`. Scroll: container `overflow-x`, table `min-width: max-content`.
- **Rows are declared on `rowsTable.displayedColumns()`, not on a list of their own.**
- **The header of a sortable column names the server field, not the column key.**
- **A column is sortable when its header cell carries a sort header.**
- **A row click opens the record, and the menu is for actions on it.** A pressable row takes
  `clickable` and `<prefix>TableRow`. A button click is no activation.
- **Action availability lies in a row field, not in a call of a component method.** Set
  `[<prefix>TableRowActionsRowType]`, or only the production build fails.
- **An action unavailable right now is not drawn in the row menu at all.**
- **An irreversible action asks for confirmation by the ready-made technique, not by a dialog of its
  own.** The item carries the danger sign, a confirm title and the consequence.
- **The menu button is not shown when the row has no available actions left.** It is
  `[rowHasActions]`.
- **A loading refusal is served as a toast, not as a line above the table.** Read its key right
  after the request, not from the store signal.
- **The screen takes the sort and the filter conditions from the response, not from its own query.**
- **A list row receives the short model of the entity, not the full one.**

## Toolbar and title

- Toolbar and pagination carry no classes of their own. The title sits in its own `<header>`.

## This tree: the shared list page

- **Filter and buttons go into the page's three slots; an empty slot is not drawn.**
- **Refresh and column settings are drawn by the page, section buttons to their left.**
- **The page asks the host for the read, page, size and columns; the host is one provider line.**
- **Check anchors, the table's and rows' included, are built from the screen's prefix.**
- **The heading takes a hint; without one it shows a single name.**
- **An empty list shows the emptiness view with a line on where records come from.**
- **The list page scrolls with the whole page.**
