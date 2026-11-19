# The KPI block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-19 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the answer copy), the stat tile of the
kit (the card), the table block of the chat (writing a value by the kit locale)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The agreement of task RT-3338: the `kpi` block of an answer of `rt-ai-chat`, a grid of KPI cards
built on `rt-stat-tile`, and what the tile itself gains for it. The approved mockup is the frame
8246-607 of the second kit file. The rules of the block merge into a subdomain of their own next to
`ai-chat-table`; the rules under «The stat tile» merge into `docs/specs/ui-kit-v2/stat-tile/`.

## Why

An overview answer («обзор месяца») shows a few key figures and how each changed against a base:
revenue against last year, occupancy against the last month. As markdown text such figures read as
a paragraph of numbers, without a sign of whether the change is good. The kit gets a `kpi` block:
a row of cards, each with a label, a value written by the kit locale, a coloured delta with its
base caption and a period.

## Terminology

- **The KPI block** — a block of an answer with the type `kpi`: a list of cards.
- **A card** — one item of the block drawn as `rt-stat-tile` inside a frame the block draws.
- **The value format** — `number`, `percent` or `currency`; it decides how the value is written.
- **The delta** — the change of the value against the base, a number with a sign, an arrow and a
  colour.
- **The base caption** — the short visible text after the delta that names the base: «vs LY».
- **The period** — the line under the value that names the period of the figure: «ноябрь 2026».
- **Growth is good** — the item flag that says the growth of the figure is good for the reader.
- **The short form** — a value of a million and more written by the locale's compact notation:
  «1,24 млн ₽».

### What it is called in the interface

| In the domain  | On the screen                                                               |
| -------------- | --------------------------------------------------------------------------- |
| The card       | a framed tile: the label, the value, the delta line, the period             |
| The delta line | the arrow, the signed number and the muted base caption: «↑ +12,5 % vs LY» |
| The period     | a muted line under the value                                                |
| The KPI block  | a grid of cards, two or four in a row                                       |

## Rules

### The block and its data

- **`kpi` is a type the kit draws itself, next to `markdown`, `notice` and `table`; an application gets it without registering anything, and a renderer registered for `kpi` is not taken.**

- **A KPI block has `items`, a list of cards.** An item has `label`, `value`, `format`, for a `currency` item `currency`, and the optional `delta`, `base`, `period` and `growthIsGood`. An item may also carry `deltaUnit`, `percent` by default or `points`.

- **A KPI block whose `items` is not a list, or holds no card left after the rules below, is shown as the plate with its type name, like a table block without columns.**

- **An item that is not an object, has no non-empty string `label`, or has no value is dropped; the other cards stay in their order.** A value is missing when it is absent, `null`, `NaN` or an infinity.

- **A malformed optional part of a card is absent, not refused.** A `delta` that is not a finite number is absent, and with it the base caption. A `base` or a `period` that is not a non-empty string is absent. A `growthIsGood` that is not a boolean is `true`.

- **An item of a format the kit does not know, or with no format, is written as `number`.**

- **The block draws every card it is given; the kit sets no cap on the number of cards.**

- **A new `block` input of the same block instance redraws the cards.**

- **The kit exports the JSON schema of the KPI block (JSON Schema 2020-12), so that an application gives it to the model as the parameters of a tool.** It names the formats, the currency code as three Latin upper-case letters, the delta as a number in percent and every optional field.

- **A block the schema accepts is drawn with nothing dropped or emptied.** The block is more lenient than the schema: what the schema refuses is still drawn by the rules above.

### Writing the value

- **A number value is written by the rules of a number cell of the table block.** The format of the item stands for the column type, `currency` for its currency code, and the locale is the kit label locale. `number` groups the digits and keeps up to 2 fraction digits, `percent` reads 0.78 as «78,0 %», `currency` writes «8 400 ₽».

- **A `number` or `currency` value of a million and more, by its absolute value, is written in the short form of the kit locale with up to 2 fraction digits.** 1 240 000 ₽ is «1,24 млн ₽», 2 500 000 000 is «2,5 млрд». A value below a million is written in full. A `percent` value is never short.

- **A `currency` item whose code is missing or is not three Latin upper-case letters writes its value as `number`.**

- **A string value is written as given; the kit does not read a number out of a string.**

- **A minus of a value is the one `Intl.NumberFormat` writes for the locale, and the value is not coloured.** A KPI value carries no colour of its own; the delta carries the meaning of the change.

- **Values and deltas are written for the locale of the kit labels; a locale `Intl.NumberFormat` refuses writes them as `en`.**

- **A drawn block follows a change of the kit label locale: its values and deltas are written anew.**

### The delta

- **`delta` is the change in percent, as the tile reads it: 12.5 is «+12,5 %», -4 is «-4 %».** It is not a fraction, unlike a `percent` value. With `deltaUnit: 'points'` the delta is a change in percentage points and is written by the tile's points label; any other `deltaUnit` counts as `percent`.

- **The delta number carries a plus on growth, the locale minus on a fall and no sign at zero.**

- **The colour of the delta follows the theme state tokens: with `growthIsGood` true growth is the success colour and a fall the danger colour; with `growthIsGood` false the two swap; a zero delta is muted.**

- **The arrow shows the sign of the delta whatever `growthIsGood` says: up on growth, down on a fall, flat at zero.**

- **A card without a delta draws no delta line and no base caption; its value, label and period stay.**

- **The base caption stands after the delta number in the delta line, visible, in 12 Regular muted text; a delta without a `base` stands alone.**

- **The delta line of a card shows one base; the kit draws no second delta (no «YoY» chip) and no «was …» line in a KPI card.**

### Layout

- **A card is `rt-stat-tile` framed by the block: a 1 px border, radius 12, padding 12, 6 between the lines of the tile.** The tile itself draws no frame, by its own spec.

- **The card label is 14 SemiBold, the value 24/24 Bold, the delta 14 Bold, the base caption and the period 12 Regular muted.**

- **The cards stand in a grid with a gap of 8: two columns while the block is narrower than 664, four columns from 664.** The block follows its own width, not the mode of the chat: the narrow panel (328, 386) gives two columns, the full-screen mode (728) four.

- **The columns of the grid are equal, and a last row with fewer cards keeps the column width; its cards are not stretched.**

- **The cards of one row stand on one top.**

- **No text goes past its card.** A long label, base caption or period wraps between words, and a value or a delta line that does not fit wraps under the line before it.

- **The block takes the width of the answer and never widens the feed.**

### The stat tile

The tile gains two options, the value size and the visible base caption, and writes its delta by
the kit locale. A tile without the options draws as before the edit, its delta text aside.

- **The tile has a value size option: the default keeps the value at 32/32, the compact size writes it at 24/24 and the delta at 14.** The KPI card uses the compact size.

- **The tile writes the delta number by `Intl.NumberFormat` for the kit label locale, with a plus on growth and no sign at zero.** A percent delta is written as the locale writes a percent. In Russian the text stays «+12,5 %», «-4 %», «0 %», with the no-break space the locale writes; in English it is «+12.5%». A delta in points passes the same written number to the points label. The delta keeps at most one fraction digit and none when it is integral.

- **The direction, the arrow and the colour of a delta follow the written number: a delta written as zero, such as -0.04 written «0 %», is flat and muted.**

- **The tile can show the label of the primary delta as visible text after the delta; the option is off by default, and with it on the delta carries no `title` of the same text.**

- **«Growth is worse» of the tile, its colours and its arrow do not change; the KPI card maps `growthIsGood: false` to it.**

### Copying

- **The answer copy gives a KPI block as one line per card, joined by LF, in the order of the cards.**

- **A card line holds the label, the value, the delta with its base caption and the period, separated by a tab; an absent part is an empty field.** The parts are written as the card shows them, in the kit locale at the moment of the copy: «Выручка», «1,24 млн ₽», «+12,5 % vs LY», «ноябрь 2026».

- **A dropped item gives no line, and a tab or a line break inside a text becomes a space.**

### Accessibility

- **The block is a list whose items are the cards, so a screen reader announces how many cards there are.**

- **The arrow of the delta is hidden from a screen reader; the sign of the number tells the direction.**

- **The block has no fixed text of its own and adds no kit label.**

## What is out of scope

- A sparkline in a card, a click on a card, a hint icon, a second delta per card.
- The section and the grid of a composed answer (RT-3342) and the sources block (RT-3340).
- A title of the block: a heading of a composed answer comes with RT-3342.
- A total or a delta computed by the kit: both come as data.
- Telling the full-screen mode to a block: the block reads its own width.
- Telling good and bad apart other than by colour: a text for a screen reader is a tile edit of its
  own.

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block and keeps no data of its own. Of a block, as
the consumer gives it:

- `type` — `kpi`;
- `items` — the cards: `label` — the label text; `value` — a number or a string; `format` —
  `number`, `percent` or `currency`; `currency` — the currency code of a `currency` item; `delta` —
  the change in percent, a number; `base` — the base caption; `period` — the period line;
  `growthIsGood` — a boolean, `true` when absent.

## Screens and states

| state           | what is drawn                                                              |
| --------------- | -------------------------------------------------------------------------- |
| narrow 328      | four cards in two columns, 160 a card                                      |
| narrow 386      | four cards in two columns, 189 a card                                      |
| full screen 728 | four cards in one row, 176 a card                                          |
| deltas          | a positive, a negative and a zero delta in one block                       |
| growth is worse | a growing delta of an item with `growthIsGood: false` in the danger colour |
| short form      | «1,24 млн ₽» next to «8 400 ₽»                                             |
| no delta        | a card with the label, the value and the period only                       |
| odd count       | three cards: the third stands alone in its row at the column width         |
| invalid         | the plate with the type name                                               |
| dark theme      | the block at 328 and 728 in the dark palette                               |

## Cross-cutting requirements

### Locales

Values and deltas are written for the locale of the kit labels and follow its change; the answer
copy reads the locale at the moment of the copy. The block adds no kit label. The labels, the base
captions and the periods come from the consumer as given.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow panel is the mobile width of the chat: at 328 two cards of 160 stand in a row, and a
value of a million and more takes the short form so that it fits 136 inside a card.

### Several objects

Several KPI blocks in one answer and in one feed each lay out by their own width.

## Decisions

- **The card is `rt-stat-tile`, and what the tile lacks is added to the tile itself** — the law
  `reuse-first`: every consumer of the tile gets the compact size, the delta by the locale and the
  visible base caption.
- **The value is written by the table cell writer** — one rule for a number in a table cell and in a
  card, plus the short form the card needs.
- **The short form starts at a million** — the approved mockup: a full seven-digit sum does not fit
  136 inside a card even at 24 px, and «8 400 ₽» does.
- **The value is 24/24, not the tile's 32** — the mockup: «1 240 000 ₽» at 32 px is 192 wide, a
  card at 328 leaves 136.
- **The four-column threshold is 664** — four cards of 160, the card width the mockup holds at
  328, with three gaps of 8. The mockup shows two columns at 386 and four at 728, and 664 lies
  between them.
- **The width decides the columns, not `fullScreen`** — a block gets only its `block` input; the
  kit already lays out by a block-local container query.
- **The block frames the card** — the tile draws no frame by its own spec; the frame is the
  container's job, as the mockup draws it.
- **`growthIsGood` is the item flag, default `true`** — the words of the task card; it maps to the
  tile's «growth is worse».
- **A KPI value is not coloured below zero, unlike a table cell** — in a card the delta carries the
  meaning, and a red value next to a green delta would contradict it.

- **The item fields are flat: `label`, `value`, `format`, `currency`, `delta`, `deltaUnit`, `base`,
  `period`, `growthIsGood`** — the task card names the parts, not the fields; closed by assumption.
- **`delta` is in percent, with `deltaUnit: 'points'` for a share whose change reads in points** —
  the tile reads a delta in percent and already draws points; the schema description says so, since
  a `percent` value is a fraction and a model may mix the two up. Closed by assumption.
- **A delta keeps at most one fraction digit** — «+12,5 %» and «-4 %» keep their text. Closed by
  assumption.
- **A card line of the copy is tab-separated** — as the table block copies its rows, so pasted
  lines split into cells. Closed by assumption.
- **No cap on the number of cards, and a short last row keeps the column width** — as the table
  block sets no cap on rows. Closed by assumption.
- **Good and bad stay told by colour, as the tile does today** — a text for a screen reader is a
  tile edit of its own. Closed by assumption.

## Open questions

None: the six questions of the draft are closed by assumption in the decisions above, because the
owner took the recommended option more than twice in a row in this session.

## History of changes

- 2026-11-19 — the agreement written for RT-3338 from the grill and the approved mockup.
