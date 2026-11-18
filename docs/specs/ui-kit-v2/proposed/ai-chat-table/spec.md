# The table block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the answer copy), the markdown text of
the kit (its table), the data table of the chart block (the markup this table takes)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A product agreement written before the code, task RT-3337 of the epic RT-3346. It merges into the
kit spec as the subdomain `ai-chat-table` with the same scenario numbers: together with the
subdomain `ai-chat` it is longer than the document limit.

## Why

A table in an assistant answer arrives as markdown, and `rt-markdown-text` draws it with its own
markup: numbers aligned left, currencies and percents as raw text, and a wide table breaks the feed
width. A report of money and shares read from such a table is read wrong. The kit gets a `table`
block with typed columns, and the markdown table takes the same look.

## Terminology

- **The table block** — a block of an answer with the type `table`: columns, rows and an optional
  total row.
- **A column type** — `text`, `number`, `percent` or `currency`; it decides how a value is written
  and aligned.
- **A number column** — a column of the type `number`, `percent` or `currency`.
- **The total row** — the last row of the table, given by the data, drawn semibold under a top
  border.
- **The scroll box** — the area of the table inside the block: it scrolls sideways and down, the
  head row stays on its top.
- **The CSV** — the text «Copy CSV» puts into the clipboard: comma-separated values, one line per
  row.

### What it is called in the interface

| In the domain   | On the screen                                                |
| --------------- | ------------------------------------------------------------ |
| The CSV button  | the text button «Copy CSV» under the table                   |
| The copy result | «Copied» with a check in place of «Copy CSV» for two seconds |
| The table       | a head row, the rows and the total row in the scroll box     |
| The scroll box  | named «Table» for a screen reader                            |

## Rules

### The block and its data

- **`table` is a type the kit draws itself, next to `markdown` and `notice`; an application gets it without registering anything, and a renderer registered for `table` is not taken.**

- **A table block has `columns`, `rows` and an optional `total`.** A column has `label`, `type` and, for a `currency` column, `currency`. A row is a list of values in the order of the columns; `total` is one row of the same shape.

- **A table block whose `columns` is not a non-empty list, or whose `rows` is not a list, is shown as the plate with its type name, like a markdown block without text.**

- **A column of a type the kit does not know, or with no type, is a `text` column.**

- **A row shorter than the columns gets empty cells at its end; the values of a longer row past the last column are dropped. The total row follows the same rule.**

- **A block with an empty `rows` draws the head row and, if given, the total row; «Copy CSV» stays.**

### Writing a value

- **A number column writes a number value by `Intl.NumberFormat` for the locale of the kit labels.** `number` groups the digits and keeps up to 2 fraction digits. `percent` reads 0.25 as 25 % and keeps up to 1. `currency` signs the currency of the column with the digits of that currency.

- **A `currency` column without a code, or with a code `Intl.NumberFormat` refuses, writes its values as `number`.**

- **A value that is not a number in a number column is written as given, aligned as the column, and never coloured; the kit does not read a number out of a string.**

- **`null` and a missing value give an empty cell; zero is written as a zero.**

- **A `text` column writes a value as given; a number in it is written as its plain digits, not formatted.**

- **The minus is the one `Intl.NumberFormat` writes for the locale; the kit adds no sign and no spacing of its own.**

- **A number value below zero in a number column, the total row included, is written in the error text colour of the theme (`--rt-color-state-error-text`); zero and positive values keep the text colour.**

- **A drawn table follows a change of the kit label locale: its values are written anew for the new locale.**

### Layout

- **Number columns are aligned right and `text` columns left; a head cell is aligned as its column.**

- **A number column is as wide as its widest value, the head included, and a value in it never wraps; the first column takes the width left over, and a `text` cell wraps between words, never inside a word.**

- **A table wider than the block scrolls sideways inside the scroll box; the block and the feed keep their width.**

- **The scroll box is 200 high at most; a taller table scrolls down inside it, and the head row stays on the top of the box while the rows scroll under it.**

- **The total row stands after the last row, semibold, with a top border of the default border colour, and scrolls with the rows.**

- **Rows are 28 high with 8 of horizontal cell padding and a 12 px font; the head row stands on the surface background with muted semibold text, in the light and the dark theme.**

### Copying

- **«Copy CSV» puts the head, the rows and the total row into the clipboard as CSV: values separated by commas, lines by CRLF.**

- **A CSV field holding a comma, a double quote, a CR or an LF is wrapped in double quotes, and a double quote inside it is doubled; other fields stand bare.**

- **A number in the CSV is its raw value with a dot, no grouping, no currency sign and no percent sign.** 1234.5 stays 1234.5, −10 is -10, a share 0.25 is 0.25. A non-number stands as given, an empty cell as an empty field.

- **A CSV text field that starts with `=`, `+`, `-`, `@`, a tab or a CR gets an apostrophe in front; a number is never prefixed.**

- **After a successful copy the button shows «Copied» with a check for two seconds and then returns to «Copy CSV»; a refused copy leaves «Copy CSV» as it was.**

- **The answer copy gives a table block as tab-separated lines — the head, the rows, the total row — with values written as the table shows them; a tab or a line break inside a value becomes a space.**

### The markdown table

- **A markdown table reads its divider row: `--:` aligns a column right, `:-:` centres it, `:--` and `---` align it left; a column with no marker in the divider aligns left.**

- **A markdown table takes the look of the table block.** The same row height, cell padding, font and head row; bottom borders in place of full borders; the sideways scroll inside its own box.

- **A markdown table detects no type by content: its cells stay inline nodes, no value is formatted or coloured, and it has no total row and no «Copy CSV».**

- **A markdown row shorter than the head gets empty cells at its end, and cells past the head are dropped.**

### Accessibility

- **The table is a `<table>` with `thead`, `tbody` and, for the total row, `tfoot`; head cells are `th` with `scope="col"`.**

- **The scroll box is reachable by the keyboard and named «Table», so the keyboard scrolls it.**

- **«Copy CSV» is a button whose accessible name is its visible text; «Copied» is announced politely, as a status.**

- **Every fixed text of the block — «Copy CSV», «Copied», «Table» — is a kit label in the `rtKit` namespace, English in the package.**

## What is out of scope

- Sorting, filtering, pagination, column settings, narrow-screen cards and editing.
- A total computed by the kit: the total row comes as data.
- A type of a markdown table column detected by its content.
- «Copy CSV» under a markdown table.
- `rt-table` and `rt-data-table`: neither takes a column set from data.
- Changing the format of the chart block: it keeps its own format function.

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block; it keeps no data of its own. The only state is
the «Copied» flag of one block instance, held in memory for two seconds and never stored.

Of a block, as the consumer gives it:

- `type` — `table`;
- `columns` — the head: `label` — the head text; `type` — `text`, `number`, `percent` or
  `currency`; `currency` — the currency code of a `currency` column;
- `rows` — the rows, each a list of values: a number, a string or `null`;
- `total` — optional, the total row of the same shape.

## Screens and states

| state      | what is drawn                                                             |
| ---------- | ------------------------------------------------------------------------- |
| narrow     | four columns at 328: the first column wraps, number columns keep one line |
| wide       | twelve columns scroll sideways inside the scroll box                      |
| with total | the semibold total row under a top border                                 |
| negatives  | values below zero in the error text colour                                |
| scrolled   | the rows scroll down under the head row that stays on top                 |
| copied     | «Copied» with a check in place of «Copy CSV»                              |
| empty rows | the head row, the total row if given, «Copy CSV»                          |
| invalid    | the plate with the type name                                              |
| markdown   | a markdown table in the same look, aligned by its divider row             |
| dark theme | the same block in the dark palette                                        |

## Cross-cutting requirements

### Locales

Values are written for the locale of the kit labels and follow its change; the answer copy reads
the locale at the moment of the copy. The button texts and the scroll box name are kit labels in
the `rtKit` namespace, English in the package. The head texts and the values come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The table takes the width of the block; at 328 the first column wraps and a table that still does
not fit scrolls sideways inside the scroll box. The feed keeps its width.

### Several objects

Several table blocks in one answer and in one feed keep their own «Copied» flag and their own
scroll box.

## Decisions

- **The block is a kit type, not a registered renderer.** It needs no d3, so it stands next to
  `markdown` and `notice` in the rich-editor entry. A consequence: an application that registered a
  renderer for `table` loses it, by the existing rule that the kit's own types are not taken from
  the registry.
- **The cell format and the CSV are pure helpers of the core entry,** next to the markdown utils:
  the block and the markdown table share them, and the rich-editor entry does not import the
  chart entry.
- **The sample is the chart data table:** the same plain markup with the `native-ok` marker naming
  `rt-table`, the same rows and alignment, with the sticky head, the total row and the negative
  colour added.
- **The CSV carries raw numbers, the answer copy the written ones.** The CSV goes to a
  spreadsheet: a grouped «1 234,50 ₽» is read there as text and cannot be summed, while «1234.5»
  is a number in a spreadsheet with a dot as the decimal sign. The answer copy goes to a person and
  keeps what the table shows, as the markdown copy does.
- **A non-number in a number column is not parsed.** A string written for another locale cannot
  be read back without guessing its separators; it is shown as given.
- **The table block has no title of its own;** the scroll box is named by the kit label «Table».

- **A markdown table takes the look only, with no maximum height and no sticky head.**
  `rt-markdown-text` is drawn outside the chat too, and a height limit there would cut a document
  table; the sticky head belongs to the block, where the grill named it.
- **The scroll box is 200 high at most,** the number of the approved mockup, frame «sticky head
  scrolled».
- **A CSV text field starting with `=`, `+`, `-`, `@`, a tab or a CR gets an apostrophe in
  front.** The text comes from a model, and a spreadsheet runs such a field as a formula; quotes
  alone do not stop it. A number goes raw and is never prefixed: a negative number is a number in
  the spreadsheet, not a formula.
- **The CSV keeps a comma between values and a dot in numbers under every locale.** The grill
  names CSV; a spreadsheet with a comma as the decimal sign is the consumer's import setting, and a
  separator chosen by locale would give two formats of one button.

## Open questions

None: the four questions of the first draft are closed by the decisions above, by assumption —
the owner took the recommended option in every menu of this epic.

## History of changes

- 2026-11-18 — the agreement written for RT-3337 from the grill and the approved mockup.
