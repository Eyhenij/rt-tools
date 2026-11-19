# The table block of the assistant chat

**Status:** in force · **Revision:** 2026-11-19 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the answer copy), the markdown text of
the kit (its table), the data table of the chart block (the markup this table takes)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The table block of an answer of `rt-ai-chat` and the shared look of the chat tables. It stands as a
subdomain of its own next to `ai-chat`: together with it it is longer than the document limit.

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

- **A table block has `columns`, `rows`, an optional `total` and an optional `title`.** A column has `label`, `type` and, for a `currency` column, `currency`. A row is a list of values in the order of the columns; `total` is one row of the same shape.

- **A table block whose `columns` is not a non-empty list, or whose `rows` is not a list, is shown as the plate with its type name, like a markdown block without text.**

- **A malformed part of a valid block is dropped or emptied, not refused.** A row that is not a list is dropped. A column that is not an object is a `text` column with an empty label, and a `label` that is not a string gives an empty head cell. A `total` that is not a list is absent. A value that is not a number, a string or `null` gives an empty cell.

- **A column of a type the kit does not know, or with no type, is a `text` column.**

- **A row shorter than the columns gets empty cells at its end; the values of a longer row past the last column are dropped. The total row follows the same rule.**

- **A `total` that is `null`, an empty list or a row whose every cell is empty after fitting is absent: no `tfoot`, no line in the CSV and none in the answer copy.**

- **A block with an empty `rows` draws the head row and, if present, the total row; «Copy CSV» stays.**

- **The block draws every row it is given; the kit sets no cap on the number of rows.**

- **A new `block` input of the same block instance redraws the table and keeps the scroll position of the scroll box and the «Copied» state.**

- **«Copy CSV» stands while the answer is written and copies the rows drawn at the moment of the press.**

- **The kit exports the JSON schema of the table block (JSON Schema 2020-12), so that an application gives it to the model as the parameters of a tool.** It names the optional `title`, the column types, the currency code as three Latin upper-case letters and the optional `total`.

- **A block the schema accepts is drawn with nothing dropped or emptied.** The block is more lenient than the schema: what the schema refuses is still drawn by the rules above.

### Writing a value

- **A number column writes a number value by `Intl.NumberFormat`.** `number` groups the digits and keeps up to 2 fraction digits. `percent` reads 0.25 as 25 with the percent sign as the locale writes it, and keeps exactly 1 fraction digit, «0,0 %» as the mockup writes it. `currency` signs the currency of the column with the digits of that currency, and an integral value without its fraction, as the approved mockup writes «1 240 000 ₽».

- **Values are written for the locale of the kit labels; a locale `Intl.NumberFormat` refuses writes them as `en`.**

- **A `currency` column whose code is missing or is not three Latin upper-case letters writes its values as `number`.**

- **A value that is not a number in a number column is written as given, aligned as the column, and never coloured; the kit does not read a number out of a string.**

- **`null` and a missing value give an empty cell, and so do `NaN` and an infinity; zero is written as a zero.**

- **A `text` column writes a value as given; a number in it is written as its plain digits, not formatted.**

- **The minus is the one `Intl.NumberFormat` writes for the locale; the kit adds no sign and no spacing of its own.**

- **A value whose written form is zero, such as -0.001 in a `number` column, is written without a minus and is not coloured.**

- **A number value whose written form is below zero, in a number column and the total row included, is written in the error text colour of the theme (`--rt-color-state-error-text`); other values keep the text colour.**

- **A drawn table follows a change of the kit label locale: its values are written anew for the new locale.**

### Layout

- **Number columns are aligned to the end and `text` columns to the start; a head cell is aligned as its column, and under `dir="rtl"` both mirror.** A value the kit wrote into a number column is isolated and keeps its own order of sign, digits and symbol under `dir="rtl"`: only its side mirrors.

- **A number column is as wide as its widest value, the head included, and a value in it never wraps.**

- **The first `text` column takes the width left over; other `text` columns are as wide as their content allows, and every `text` cell wraps between words, never inside a word.** A table with no `text` column is as wide as its content.

- **A table wider than the block scrolls sideways inside the scroll box; the block and the feed keep their width.**

- **The scroll box is 200 high at most; a taller table scrolls down inside it, and the head row stays on the top of the box while the rows scroll under it.**

- **The total row stands after the last row, semibold, with a top border of the default border colour (`--rt-color-border-default`), and scrolls with the rows.**

- **A `title` given as a non-empty string stands above the table in the 14 px semibold primary text, as the chart title; it names the scroll box in place of «Table», opens the answer copy on a line of its own and stays out of the CSV.**

- **The table has a top border of the subtle border colour, and every row a bottom one.**

- **Rows are at least 28 high, and a row whose text wraps grows with it.** Cells have 8 of horizontal padding and a 12 px font. The head row stands on the surface background with muted semibold text, in the light and the dark theme.

- **The data table under the chart block takes the same look: rows, padding, head row and number column widths.** It keeps its own format function and its own rows.

### Copying

- **«Copy CSV» puts the head, the rows and the total row into the clipboard as CSV: values separated by commas, lines by CRLF, under every locale.**

- **Every string value and every head label is a CSV text field, whatever the type of its column.**

- **A CSV field holding a comma, a double quote, a CR or an LF is wrapped in double quotes, and a double quote inside it is doubled; other fields stand bare.**

- **A number value in the CSV is written as `String(value)`: a dot, no grouping, no currency sign and no percent sign.** 1234.5 stays 1234.5, the number -10 is -10, a share 0.25 is 0.25. An empty cell is an empty field.

- **A CSV text field that starts with `=`, `+`, `-`, `@`, a tab or a CR gets an apostrophe in front; a number is never prefixed.** The apostrophe is added before quoting, so in a quoted field it stands inside the quotes.

- **After a successful copy the button shows «Copied» with a check for two seconds and then returns to «Copy CSV»; a refused copy leaves «Copy CSV» as it was.**

- **A press while «Copied» shows copies again and starts the two seconds anew; a locale change shows «Copied» in the new language and does not restart them.**

- **The answer copy gives a table block as tab-separated lines joined by LF, as the markdown table copy does: the head, the rows, the total row.** Values are written as the table shows them, in the kit locale at the moment of the copy. A tab or a line break inside a value or a head label becomes a space.

### The markdown table

- **A markdown table reads its divider row.** `--:` aligns a column to the end, `:-:` centres it, `:--` and `---` align it to the start, and a column with no marker aligns to the start. Under `dir="rtl"` the start and the end mirror, as in the block.

- **A markdown table takes the look of the table block, with no maximum height and no sticky head; its column widths are the browser's.** The same row height, cell padding, font and head row; bottom borders in place of full borders; the sideways scroll inside its own box.

- **A markdown table detects no type by content: its cells stay inline nodes, no value is formatted or coloured, and it has no total row and no «Copy CSV».**

- **A markdown row shorter than the head gets empty cells at its end, and cells past the head are dropped; the answer copy of a markdown table carries the fitted rows.**

### Accessibility

- **The table block is a `<table>` with `thead`, `tbody` and, for the total row, `tfoot`; head cells are `th` with `scope="col"`.**

- **The head cells of a markdown table are `th` with `scope="col"`.**

- **The scroll box of the block and the scroll box of a markdown table are reachable by Tab, named «Table», and scroll by the arrow keys.**

- **«Copy CSV» is a button whose accessible name is its visible text; «Copied» is announced politely, as a status.**

- **Every fixed text of the block — «Copy CSV», «Copied», «Table» — is a kit label in the `rtKit` namespace, English in the package.**

## What is out of scope

- Sorting, filtering, pagination, column settings, narrow-screen cards and editing.
- A total computed by the kit: the total row comes as data.
- A type of a markdown table column detected by its content.
- «Copy CSV» under a markdown table.
- A currency code in the CSV head: a head label goes into the CSV as given.
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

| state      | what is drawn                                                                   |
| ---------- | ------------------------------------------------------------------------------- |
| narrow     | four columns in a block 328 wide: the first column wraps, numbers keep one line |
| wide       | twelve columns scroll sideways inside the scroll box                            |
| with total | the semibold total row under a top border                                       |
| negatives  | values below zero in the error text colour                                      |
| scrolled   | the rows scroll down under the head row that stays on top                       |
| copied     | «Copied» with a check in place of «Copy CSV»                                    |
| empty rows | the head row, the total row if present, «Copy CSV»                              |
| invalid    | the plate with the type name                                                    |
| markdown   | a markdown table in the same look, aligned by its divider row                   |
| dark theme | the same block in the dark palette                                              |

## Cross-cutting requirements

### Locales

Values are written for the locale of the kit labels and follow its change; the answer copy reads
the locale at the moment of the copy. The button texts and the scroll box name are kit labels in
the `rtKit` namespace, English in the package. The head texts and the values come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The table takes the width of the block; in a block 328 wide the first column wraps, and a table
that still does not fit scrolls sideways inside the scroll box. The feed keeps its width.

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
- **The CSV carries raw numbers, the answer copy the written ones.** The CSV is for a reader who
  saves it as a file or imports it: a grouped «1 234,50 ₽» comes in as text and cannot be summed,
  a raw 1234.5 comes in as a number. Pasting into cells is served by the answer copy: its
  tab-separated lines split into cells and keep what the table shows.
- **A non-number in a number column is not parsed.** A string written for another locale cannot
  be read back without guessing its separators; it is shown as given.
- **The title is optional and comes from the approved mockup,** where it stands above the table; without it the scroll box is named by the kit label «Table». The first draft had no title, and the check against the mockup found it in stage 5.
- **The scroll box is 200 high at most,** the number of the approved mockup, frame «sticky head
  scrolled».
- **A CSV text field starting with `=`, `+`, `-`, `@`, a tab or a CR gets an apostrophe in
  front.** The text comes from a model, and a spreadsheet runs such a field as a formula; quotes
  alone do not stop it. A number goes raw and is never prefixed: a negative number is a number in
  the spreadsheet, not a formula.
- **The CSV keeps a comma between values and a dot in numbers under every locale.** The grill
  names CSV; a spreadsheet with a comma as the decimal sign is the consumer's import setting, and a
  separator chosen by locale would give two formats of one button.
- **`:-:` centring is added beyond the grill and applies only to markdown tables.** The grill names
  `--:`; the divider row carries `:-:` too, and reading one marker while dropping the other would
  be arbitrary. A block column never centres: its alignment follows its type.

## Open questions

None: the four questions of the first draft are closed by the decisions above, by assumption —
the owner took the recommended option in every menu of this epic.

## History of changes

- 2026-11-18 — the agreement written for RT-3337 from the grill and the approved mockup.
- 2026-11-18 — the review by spec-critic: malformed parts, an absent total, widths without a text
  column, the locale fallback, the zero form, the CSV text fields, logical alignment, the copy
  state across a new input and a locale change.
- 2026-11-19 — the code of RT-3337 written and the showcase approved; the agreement became this
  subdomain. The value of a number column is isolated under `dir="rtl"`.
