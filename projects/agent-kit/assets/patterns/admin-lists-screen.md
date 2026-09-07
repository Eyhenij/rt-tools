---
name: admin-lists-screen
kind: pattern
rule: lists
description: Pattern of rule lists. Load when assembling or editing an admin list screen — the ready-made order of blocks, the <prefix>-table markup, row click, row menu with an actions column and a row predicate, sortable header, toolbar slots, failure toast.
---

# Assembling a list screen

Pattern of the rule `lists`. What must be true — the law
`docs/constitution/lists.md`.

## When to use

- A new screen with a list of records is created.
- An existing one is edited: columns, row menu, toolbar, sorting.

## Order of blocks

The layout comes from the shared block `<prefix>-page` of the application layer, not from the
screen's styles. The screen answers for the order:

```html
<ng-container rtBlock="<prefix>-page">
    <header rtElem="header">
        <!-- div rtElem="header-main" with h1 rtElem="title" + p rtElem="hint" -->
        <<prefix>-toolbar>
        <!-- <prefix>ToolbarLeft / <prefix>ToolbarRight -->
        <div rtElem="scroll">
            <!-- overflow-x: auto -->
            <<prefix>-table rtElem="table">
            <!-- min-width: max-content -->
            <<prefix>-pagination>
        </div>
    </header>
</ng-container>
```

Both scrolling rules are needed together: with the container alone the columns shrink instead of
shifting. The toolbar and the pagination carry no classes of their own — the gap is set by
`<prefix>-page` itself.

## The table

```html
<<prefix>-table #rowsTable="<prefix>Table" rtElem="table" clickable [ariaLabel]="'recordsTableAria' | transloco"
[emptyMessage]="'recordsEmpty' | transloco" [tableId]="tableId" [dataSource]="rows()" [columnsConfig]="columnsConfig()"
[rowHasActions]="hasRowActions" [loading]="loading()">
```

- `tableId` — the key under which the column choice is stored; it also goes to the settings aside.
- `[columnsConfig]`, not a bare list of keys: the captions for the settings panel and for the
  cards on a narrow screen are taken from it.

## Row click

```html
<tr
    *cdkRowDef="let row; columns: rowsTable.displayedColumns()"
    cdk-row
    qa-dataid="records-row"
    <prefix>TableRow
    (activated)="openAside(row)"></tr>
```

Rows are declared on `rowsTable.displayedColumns()`: the column with the menu the table adds
itself.

## Row menu

```html
<<prefix>-table … [showRowActions]="true" [rowHasActions]="hasRowActions" [loading]="loading()">
    <ng-template <prefix>TableRowActions let-row [<prefix>TableRowActionsRowType]="rows()"></ng-template>
```

```typescript
protected readonly hasRowActions: I<Prefix>Table.RowActionsPredicate<IRecord.Row> = recordRowHasActions;
```

There are two inputs, and they do not replace each other. `showRowActions` creates the actions
column itself — by default it is omitted, and without it the table draws only the declared
columns: neither the actions template nor the predicate adds the column. `rowHasActions` decides
whether to show the button on a particular row, and creates no column at all. That is how the
roles screen came out with four columns and unreachable actions: the build, the lint and the
units on the row rules were green, and it was found by the end-to-end run.

The actions cell is hidden until the pointer is on the row — the end-to-end test hovers the row
before pressing.

Action availability lies in a row field (`canConfirm`, `canReject`), not in a call of a component
method. An action the record cannot take is removed from the menu entirely. An irreversible one
carries `danger`, `confirmTitle` and `confirmMessage` with the consequence — not "Are you sure?",
but what exactly will happen.

## Sortable header

```html
<th *cdkHeaderCellDef cdk-header-cell <prefix>SortHeader="createdAt">{{ 'recordsCreatedAt' | transloco }}</th>
```

The column is marked `sortable: true` in `columnsConfig`. The header cycles the sort and hands
the chosen one out by the `(sortChange)` event; the query itself is done by the screen. The
caption stays inside the button — the accessible name is taken from it.

The list arrives already sorted, so the screen passes the table the current sort —
`[sort]="sortModel()"` — and the arrow stands on the right column at once, before the first
press. Without it the list looks unsorted while it is sorted.

## Toolbar

The toolbar is split in two by slots: `<prefix>ToolbarLeft` — what changes the query,
`<prefix>ToolbarRight` — actions on the list. The screen sets up no layout of its own inside the
toolbar.

The left slot — filters and search. The right — `<prefix>-icon-button variant="primary"` icons
with a pair `tooltip` + `ariaLabel` of the same text: refresh (`sync`), column settings
(`sliders-v`), create (`plus`). If the list failed to load, the retry is the same refresh button.

## Loading refusal

```typescript
this.#notifications.error(this.#transloco.translate(this.#store.errorKey() ?? 'recordsLoadFailed'));
```

The key is read right after the request, not by subscribing to the store signal: the store is
shared by the list and the edit panel, and a subscription would show one refusal twice. No
`<p role="alert">` lines above the table.

## Check

```bash
npx nx build admin
```

The production build is mandatory: without `[<prefix>TableRowActionsRowType]` the type of
`let-row` is inferred as `unknown`, and only that build fails — units and the dev server pass.

## Common misses

- An own `@if (rows().length === 0)` — the screen was assembled bypassing the table.
- An own column list instead of `displayedColumns()` — the column with the menu disappears.
- Action availability computed by a component method — recomputed on every check.
- `[rowHasActions]` not set — the "…" button hangs on a row without actions.
- The title nested in the toolbar instead of its own `<header>`.
- `qa-dataid` not set on the table, the row, the cells and the toolbar elements.
